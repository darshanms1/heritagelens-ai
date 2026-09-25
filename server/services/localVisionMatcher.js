const fs = require('fs');
const path = require('path');
let pipeline = null;

// In-memory cache for reference gallery embeddings
let gallery = null;
let extractorPromise = null;

// Load precomputed reference embeddings synchronously
function loadGallery() {
  if (gallery) return gallery;
  const embeddingsPath = path.join(__dirname, '..', 'data', 'reference_embeddings.json');
  if (fs.existsSync(embeddingsPath)) {
    const raw = fs.readFileSync(embeddingsPath, 'utf8');
    gallery = JSON.parse(raw);
    console.log(`[LocalVisionMatcher] Loaded reference gallery with ${gallery.monuments?.length || 0} monuments.`);
  } else {
    console.warn(`[LocalVisionMatcher] Reference embeddings file not found at ${embeddingsPath}`);
    gallery = { monuments: [] };
  }
  return gallery;
}

// Vector math utilities
function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function normalize(vec) {
  let s = 0;
  for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i];
  const mag = Math.sqrt(s);
  if (mag === 0) return vec;
  return Array.from(vec).map(v => v / mag);
}

// Singleton extractor loader
async function getExtractor() {
  if (process.env.ENABLE_LOCAL_CLIP !== 'true') {
    throw new Error('Local ONNX CLIP is disabled. Set ENABLE_LOCAL_CLIP=true to enable.');
  }
  if (!extractorPromise) {
    console.log('[LocalVisionMatcher] Initializing Xenova/clip-vit-base-patch32 (quantized ONNX)...');
    if (!pipeline) {
      pipeline = require('@xenova/transformers').pipeline;
    }
    extractorPromise = pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32', {
      quantized: true
    }).catch(err => {
      extractorPromise = null;
      throw err;
    });
  }
  return extractorPromise;
}

/**
 * Extract 512-d normalized embedding vector from image buffer or file path
 */
async function extractEmbedding(imageBufferOrPath) {
  const extractor = await getExtractor();
  let tempFilePath = null;

  try {
    let inputPath = imageBufferOrPath;

    if (Buffer.isBuffer(imageBufferOrPath)) {
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      tempFilePath = path.join(uploadsDir, `tmp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`);
      fs.writeFileSync(tempFilePath, imageBufferOrPath);
      inputPath = tempFilePath;
    }

    const output = await extractor(inputPath);
    return normalize(output.data);
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // Silently clean up
      }
    }
  }
}

/**
 * Match an input image against the Bagalkot reference monument gallery
 * @param {Buffer|string} imageBufferOrPath 
 * @returns {Promise<Object>} Match result with top candidates, margin, and confidence
 */
async function matchImage(imageBufferOrPath) {
  // Local ONNX CLIP requires ~400MB memory. Skip unless explicitly enabled via ENABLE_LOCAL_CLIP=true
  if (process.env.ENABLE_LOCAL_CLIP !== 'true') {
    return null;
  }

  const g = loadGallery();
  if (!g.monuments || g.monuments.length === 0) {
    return {
      matched: false,
      confidence_label: 'unknown',
      candidates: [],
      reason: 'Reference gallery is not loaded.'
    };
  }

  const queryVec = await extractEmbedding(imageBufferOrPath);

  // Compute similarity against each monument in the closed gallery
  const scores = g.monuments.map(m => {
    let maxSim = -1;
    let bestRefIndex = 1;

    for (const ref of m.references) {
      const sim = dot(queryVec, ref.vector);
      if (sim > maxSim) {
        maxSim = sim;
        bestRefIndex = ref.ref_index;
      }
    }

    const centroidSim = m.centroid ? dot(queryVec, m.centroid) : maxSim;
    // Composite score balances best single-view match (85%) with overall monument affinity (15%)
    const compositeScore = (maxSim * 0.85) + (centroidSim * 0.15);

    return {
      monument_id: m.monument_id,
      monument_name: m.monument_name,
      site_id: m.site_id,
      site_name: m.site_name,
      key_clues: m.key_clues || [],
      score: parseFloat(compositeScore.toFixed(4)),
      max_sim: parseFloat(maxSim.toFixed(4)),
      best_ref: bestRefIndex
    };
  });

  // Sort descending by composite score
  scores.sort((a, b) => b.score - a.score);

  const top1 = scores[0];
  const top2 = scores[1] || { score: 0 };
  const top3 = scores[2] || { score: 0 };
  const margin = parseFloat((top1.score - top2.score).toFixed(4));

  // Thresholds derived from empirical validation on Bagalkot heritage gallery
  // High: strong absolute similarity AND decisive margin over alternative monuments
  // Medium: solid similarity, but either lower score or close competitor (e.g. adjacent twin temples)
  // Low: weak similarity to all 9 monuments (out-of-domain, unrelated temple, landscape)
  let confidence_label = 'low';
  let matched = false;

  if (top1.max_sim >= 0.885 && margin >= 0.035) {
    confidence_label = 'high';
    matched = true;
  } else if ((top1.score >= 0.82 && top1.max_sim >= 0.84) || (top1.score >= 0.80 && margin >= 0.05)) {
    confidence_label = 'medium';
    matched = true;
  } else {
    confidence_label = 'low';
    matched = false;
  }

  const candidates = scores.slice(0, 3).map(c => ({
    monument_id: c.monument_id,
    monument_name: c.monument_name,
    site_id: c.site_id,
    site_name: c.site_name,
    score: c.score,
    key_clues: c.key_clues
  }));

  let reason = '';
  if (confidence_label === 'high') {
    reason = `Visual features strongly match ${top1.monument_name} at ${top1.site_name} (similarity ${top1.score}, margin ${margin}).`;
  } else if (confidence_label === 'medium') {
    reason = `Possible match with ${top1.monument_name} at ${top1.site_name} (similarity ${top1.score}). Closest alternative: ${top2.monument_name}.`;
  } else {
    reason = `Visual features do not match any of the 9 supported Bagalkot heritage monuments with sufficient confidence (highest similarity: ${top1.score} for ${top1.monument_name}).`;
  }

  return {
    matched,
    site_id: top1.site_id,
    site_name: top1.site_name,
    monument_id: top1.monument_id,
    monument_name: top1.monument_name,
    confidence_label,
    score: top1.score,
    max_sim: top1.max_sim,
    margin,
    visual_clues: top1.key_clues,
    reason,
    candidates
  };
}

// Prewarm function to initialize model ahead of time
async function prewarm() {
  try {
    loadGallery();
    if (process.env.ENABLE_LOCAL_CLIP === 'true') {
      await getExtractor();
      console.log('[LocalVisionMatcher] Prewarmed and ready.');
    } else {
      console.log('[LocalVisionMatcher] Gallery loaded. ONNX model loading deferred to conserve container memory.');
    }
  } catch (err) {
    console.warn('[LocalVisionMatcher] Prewarm skipped or failed:', err.message);
  }
}

module.exports = {
  loadGallery,
  extractEmbedding,
  matchImage,
  prewarm
};
