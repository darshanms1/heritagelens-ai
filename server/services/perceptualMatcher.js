const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { RawImage } = require('@xenova/transformers');

const REGISTRY_PATH = path.join(__dirname, '..', 'data', 'referenceImages.json');

// In-memory cache for fast lookup
let registry = [];
let shaIndex = new Map();

function loadRegistry() {
  if (registry.length > 0) return registry;
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
      shaIndex.clear();
      for (const item of registry) {
        if (item.sha256) shaIndex.set(item.sha256.toLowerCase(), item);
      }
      console.log(`[PerceptualMatcher] Loaded ${registry.length} reference images into in-memory hash registry.`);
    } else {
      console.warn(`[PerceptualMatcher] Reference registry not found at ${REGISTRY_PATH}`);
    }
  } catch (err) {
    console.error(`[PerceptualMatcher] Failed to load reference registry:`, err.message);
  }
  return registry;
}

// Ensure registry is loaded on require
loadRegistry();

function hammingDistance(h1, h2) {
  if (!h1 || !h2) return 64;
  try {
    let v1 = BigInt('0x' + h1);
    let v2 = BigInt('0x' + h2);
    let x = v1 ^ v2;
    let dist = 0;
    while (x > 0n) {
      if (x & 1n) dist++;
      x >>= 1n;
    }
    return dist;
  } catch (e) {
    return 64;
  }
}

function computeDHashFromRaw(gray9x8) {
  const data = gray9x8.data;
  let hashBits = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = data[y * 9 + x];
      const right = data[y * 9 + (x + 1)];
      hashBits += (left > right ? '1' : '0');
    }
  }
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(hashBits.substr(i, 4), 2).toString(16);
  }
  return hex.padStart(16, '0');
}

function computeDCT32(matrix) {
  const N = 32;
  const c = new Float64Array(N);
  for (let i = 1; i < N; i++) c[i] = Math.sqrt(2 / N);
  c[0] = 1 / Math.sqrt(N);

  const rowTrans = new Float64Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let u = 0; u < N; u++) {
      let sum = 0;
      for (let x = 0; x < N; x++) {
        sum += matrix[y * N + x] * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N));
      }
      rowTrans[y * N + u] = c[u] * sum;
    }
  }

  const dct8x8 = new Float64Array(64);
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      let sum = 0;
      for (let y = 0; y < N; y++) {
        sum += rowTrans[y * N + u] * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
      }
      dct8x8[v * 8 + u] = c[v] * sum;
    }
  }
  return dct8x8;
}

function computePHashFromRaw(gray32x32) {
  const data = gray32x32.data;
  const matrix = new Float64Array(32 * 32);
  for (let i = 0; i < 32 * 32; i++) matrix[i] = data[i];

  const dct = computeDCT32(matrix);
  const lowFreq = [];
  for (let i = 1; i < 64; i++) lowFreq.push(dct[i]);
  lowFreq.sort((a, b) => a - b);
  const median = lowFreq[Math.floor(lowFreq.length / 2)];

  let hashBits = '';
  for (let i = 0; i < 64; i++) {
    hashBits += (dct[i] > median ? '1' : '0');
  }
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(hashBits.substr(i, 4), 2).toString(16);
  }
  return hex.padStart(16, '0');
}

/**
 * Match image buffer against deterministic reference registry
 * 1. Exact SHA-256 match (<1ms)
 * 2. Perceptual pHash & dHash match (~25ms)
 * 
 * @param {Buffer} imageBuffer 
 * @returns {Promise<Object>}
 */
async function matchBuffer(imageBuffer) {
  loadRegistry();

  if (!registry || registry.length === 0) {
    return { matched: false, reason: 'Reference registry empty' };
  }

  // 1. Exact Hash Match (SHA-256)
  const sha256 = crypto.createHash('sha256').update(imageBuffer).digest('hex').toLowerCase();
  if (shaIndex.has(sha256)) {
    const matchedRef = shaIndex.get(sha256);
    return {
      matched: true,
      identified: true,
      monumentId: matchedRef.monumentId,
      monumentName: matchedRef.monumentName,
      siteId: matchedRef.siteId,
      siteName: matchedRef.siteName,
      matchMethod: 'exact-hash',
      confidence: 'EXACT',
      confidence_label: 'high',
      matchedReference: matchedRef.filename,
      distance: 0,
      sha256: sha256,
      visual_clues: matchedRef.architecturalFeatures || [],
      reason: `Exact binary hash match with reference image ${matchedRef.filename}.`,
      geminiVerified: false
    };
  }

  // 2. Perceptual Image Matching (pHash + dHash)
  try {
    const blob = new Blob([imageBuffer]);
    const raw = await RawImage.fromBlob(blob);

    // Compute dHash
    const gray9x8 = (await raw.resize(9, 8)).grayscale();
    const queryDHash = computeDHashFromRaw(gray9x8);

    // Compute pHash
    const gray32x32 = (await raw.resize(32, 32)).grayscale();
    const queryPHash = computePHashFromRaw(gray32x32);

    // Calculate Hamming distances across all references
    const scored = registry.map(ref => {
      const pDist = hammingDistance(queryPHash, ref.phash);
      const dDist = hammingDistance(queryDHash, ref.dhash);
      const compositeDist = Math.round((pDist * 0.7) + (dDist * 0.3));
      return {
        ref,
        pDist,
        dDist,
        compositeDist,
        minDist: Math.min(pDist, dDist)
      };
    });

    scored.sort((a, b) => a.minDist - b.minDist);

    const topMatch = scored[0];
    const runnerUp = scored[1] || { minDist: 64 };
    const margin = runnerUp.minDist - topMatch.minDist;

    // Thresholds:
    // Distance 0: Exact perceptual
    // Distance <= 5: VERY HIGH (resized, converted PNG->JPEG, slight compression)
    // Distance <= 10: HIGH (heavily compressed, screenshot crop)
    // Distance > 10: Low confidence or candidate suggestion
    if (topMatch.minDist === 0) {
      return {
        matched: true,
        identified: true,
        monumentId: topMatch.ref.monumentId,
        monumentName: topMatch.ref.monumentName,
        siteId: topMatch.ref.siteId,
        siteName: topMatch.ref.siteName,
        matchMethod: 'perceptual-hash',
        confidence: 'EXACT',
        confidence_label: 'high',
        matchedReference: topMatch.ref.filename,
        distance: topMatch.minDist,
        phash_distance: topMatch.pDist,
        dhash_distance: topMatch.dDist,
        visual_clues: topMatch.ref.architecturalFeatures || [],
        reason: `Zero perceptual distance match with reference image ${topMatch.ref.filename}.`,
        geminiVerified: false
      };
    } else if (topMatch.minDist <= 5) {
      return {
        matched: true,
        identified: true,
        monumentId: topMatch.ref.monumentId,
        monumentName: topMatch.ref.monumentName,
        siteId: topMatch.ref.siteId,
        siteName: topMatch.ref.siteName,
        matchMethod: 'perceptual-hash',
        confidence: 'VERY_HIGH',
        confidence_label: 'high',
        matchedReference: topMatch.ref.filename,
        distance: topMatch.minDist,
        phash_distance: topMatch.pDist,
        dhash_distance: topMatch.dDist,
        visual_clues: topMatch.ref.architecturalFeatures || [],
        reason: `High-fidelity perceptual match (distance ${topMatch.minDist}/64) with reference image ${topMatch.ref.filename}.`,
        geminiVerified: false
      };
    } else if (topMatch.minDist <= 10 && margin >= 3) {
      return {
        matched: true,
        identified: true,
        monumentId: topMatch.ref.monumentId,
        monumentName: topMatch.ref.monumentName,
        siteId: topMatch.ref.siteId,
        siteName: topMatch.ref.siteName,
        matchMethod: 'perceptual-hash',
        confidence: 'HIGH',
        confidence_label: 'high',
        matchedReference: topMatch.ref.filename,
        distance: topMatch.minDist,
        phash_distance: topMatch.pDist,
        dhash_distance: topMatch.dDist,
        visual_clues: topMatch.ref.architecturalFeatures || [],
        reason: `Strong perceptual hash match (distance ${topMatch.minDist}/64) with reference image ${topMatch.ref.filename}.`,
        geminiVerified: false
      };
    }

    // Not a direct perceptual match; return candidates for local CLIP layer
    return {
      matched: false,
      identified: false,
      minDistance: topMatch.minDist,
      bestCandidate: {
        monumentId: topMatch.ref.monumentId,
        monumentName: topMatch.ref.monumentName,
        siteId: topMatch.ref.siteId,
        siteName: topMatch.ref.siteName,
        distance: topMatch.minDist
      },
      candidates: scored.slice(0, 3).map(s => ({
        monument_id: s.ref.monumentId,
        monument_name: s.ref.monumentName,
        site_id: s.ref.siteId,
        site_name: s.ref.siteName,
        distance: s.minDist
      }))
    };
  } catch (err) {
    console.warn(`[PerceptualMatcher] Error processing image buffer:`, err.message);
    return { matched: false, error: err.message };
  }
}

module.exports = {
  loadRegistry,
  matchBuffer,
  hammingDistance
};
