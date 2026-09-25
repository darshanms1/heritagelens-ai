/**
 * groqVisionService.js
 * Multimodal Visual Language Model (VLM) identification service powered by Groq LPU inference.
 * Uses Alibaba Cloud's Qwen 3.8 27B Vision Model (`qwen/qwen3.8-27b`).
 * Delivers sub-500ms visual architectural analysis grounded in the Bagalkot Chalukya catalog.
 */

const SUPPORTED_MONUMENTS = `
1. Site: pattadakal (Pattadakal)
   - monument_id: virupaksha_temple_pattadakal | Name: Virupaksha Temple | Visual features: Massive Dravidian stepped vimana (tower), detached Nandi mandapa pavilion in front, extensive Ramayana/Mahabharata narrative friezes on pillars, sandstone construction.
   - monument_id: mallikarjuna_temple_pattadakal | Name: Mallikarjuna Temple | Visual features: Dravidian vimana similar to Virupaksha but smaller, circular/hemispherical griva and shikhara, located adjacent to Virupaksha.
   - monument_id: papanatha_temple_pattadakal | Name: Papanatha Temple | Visual features: Curvilinear Rekha-Nagara tower, transition-style architecture, ornate external wall sculptures, near Malaprabha river.

2. Site: badami (Badami)
   - monument_id: cave_1_badami | Name: Cave 1 | Visual features: Rock-cut cave shrine carved in red sandstone, 18-armed dancing Shiva (Nataraja) relief at entrance portico.
   - monument_id: cave_3_badami | Name: Cave 3 | Visual features: Largest rock-cut cave temple in red sandstone cliff, deep colonnaded verandah, colossal high-relief sculptures of Vishnu as Trivikrama and Varaha, carved bracket figures.
   - monument_id: bhutanatha_temples_badami | Name: Bhutanatha Temples | Visual features: Sandstone structural temple cluster built on the edge of Agastya lake water, backed by steep red sandstone cliffs.

3. Site: aihole (Aihole)
   - monument_id: durga_temple_aihole | Name: Durga Temple | Visual features: Unique apsidal (U-shaped / horseshoe / elephant-back) plan, elevated plinth (adhisthana), curved outer pillared ambulatory gallery, damaged Rekha-Nagara shikhara.
   - monument_id: lad_khan_temple_aihole | Name: Lad Khan Temple | Visual features: Rectangular pillared mandapa resembling wooden hall, stone lattice (jali) windows, small rectangular shrine on the flat roof.
   - monument_id: meguti_jain_temple_aihole | Name: Meguti Jain Temple | Visual features: Sits atop a rocky hill (Meguti hill), elevated plinth, contains the famous 634 CE Aihole stone inscription by poet Ravikirti.
`;

const VALID_MONUMENT_IDS = [
  'virupaksha_temple_pattadakal',
  'mallikarjuna_temple_pattadakal',
  'papanatha_temple_pattadakal',
  'cave_1_badami',
  'cave_3_badami',
  'bhutanatha_temples_badami',
  'durga_temple_aihole',
  'lad_khan_temple_aihole',
  'meguti_jain_temple_aihole'
];

const MONUMENT_SITE_MAP = {
  virupaksha_temple_pattadakal: 'pattadakal',
  mallikarjuna_temple_pattadakal: 'pattadakal',
  papanatha_temple_pattadakal: 'pattadakal',
  cave_1_badami: 'badami',
  cave_3_badami: 'badami',
  bhutanatha_temples_badami: 'badami',
  durga_temple_aihole: 'aihole',
  lad_khan_temple_aihole: 'aihole',
  meguti_jain_temple_aihole: 'aihole'
};

const MONUMENT_NAME_MAP = {
  virupaksha_temple_pattadakal: 'Virupaksha Temple',
  mallikarjuna_temple_pattadakal: 'Mallikarjuna Temple',
  papanatha_temple_pattadakal: 'Papanatha Temple',
  cave_1_badami: 'Cave 1 (Nataraja)',
  cave_3_badami: 'Cave 3 (Vishnu Reliefs)',
  bhutanatha_temples_badami: 'Bhutanatha Temples',
  durga_temple_aihole: 'Durga Temple (Apsidal)',
  lad_khan_temple_aihole: 'Lad Khan Temple',
  meguti_jain_temple_aihole: 'Meguti Jain Temple'
};

/**
 * Normalizes any variations in monument IDs returned by LLMs.
 */
function normalizeMonumentId(rawId) {
  if (!rawId) return null;
  const id = String(rawId).toLowerCase().trim().replace(/[- ]/g, '_');
  
  if (id.includes('virupaksha')) return 'virupaksha_temple_pattadakal';
  if (id.includes('mallikarjuna')) return 'mallikarjuna_temple_pattadakal';
  if (id.includes('papanatha')) return 'papanatha_temple_pattadakal';
  if (id.includes('cave_1') || id.includes('cave1') || id.includes('nataraja')) return 'cave_1_badami';
  if (id.includes('cave_3') || id.includes('cave3') || id.includes('vishnu')) return 'cave_3_badami';
  if (id.includes('bhutanatha') || id.includes('agastya')) return 'bhutanatha_temples_badami';
  if (id.includes('durga') || id.includes('apsidal')) return 'durga_temple_aihole';
  if (id.includes('lad_khan') || id.includes('ladkhan')) return 'lad_khan_temple_aihole';
  if (id.includes('meguti') || id.includes('ravikirti')) return 'meguti_jain_temple_aihole';

  return VALID_MONUMENT_IDS.includes(id) ? id : null;
}

/**
 * Analyzes an image buffer using Groq Qwen 3.8-27B VLM.
 * 
 * @param {Buffer} imageBuffer - Raw image buffer
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @param {object} localHint - Optional preliminary hint from local matching
 * @returns {Promise<object>} Standardized identification result
 */
async function analyzeImage(imageBuffer, mimeType = 'image/jpeg', localHint = null) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const hintName = localHint?.monument_name || localHint?.monumentName || localHint?.monument_id || localHint?.monumentId;
  const hintSite = localHint?.site_name || localHint?.siteName || localHint?.site_id || localHint?.siteId;
  const hintText = hintName ? `
LOCAL PRE-MATCH CONTEXT:
The local vision matching engine noted similarity to: ${hintName} (Site: ${hintSite || 'Bagalkot'}).
Verify if the architectural features in the image match this monument or another from the catalog.
` : '';

  const prompt = `You are an expert heritage monument identification system for the Early Chalukyan temples in Bagalkot district, Karnataka, India.

CRITICAL INSTRUCTION — CLOSED-WORLD IDENTIFICATION:
You are strictly limited to identifying monuments from the following supported catalog:
${SUPPORTED_MONUMENTS}

${hintText}

Analyze the provided image and determine if it shows one of the 9 monuments listed above.

STRICT RULES:
1. ONLY match the image if you see clear architectural features corresponding to one of the 9 Chalukyan monuments in the catalog above.
2. If the image shows any other style (such as Hoysala star-shaped soapstone temples like Somnathpura/Belur/Halebidu, Vijayanagara temples like Hampi, Chola tall gopurams, Khajuraho, north Indian Nagara), or an unrelated building, landscape, or object, you MUST return identified = false.
3. Do NOT invent monuments, dynasties, or dates.
4. Set confidence_label to:
   - "high" only if key architectural markers of the specific Bagalkot Chalukyan monument are clearly visible and unambiguous.
   - "medium" if partially obscured or from an atypical angle, but features match.
   - "low" or "unknown" if ambiguous, blurry, or not in the catalog.

Return ONLY a valid JSON object matching this exact schema, with no markdown or extra conversational text:
{
  "identified": true,
  "site_id": "pattadakal" | "badami" | "aihole",
  "monument_id": "exact_monument_id_from_catalog",
  "monument_name": "exact_monument_name_from_catalog",
  "visual_clues": ["specific visible feature 1", "specific visible feature 2"],
  "confidence_label": "high" | "medium" | "low" | "unknown",
  "reason": "Brief visual evidence explaining why this monument was or was not matched"
}`;

  let processedBuffer = imageBuffer;
  try {
    const sharp = require('sharp');
    processedBuffer = await sharp(imageBuffer)
      .resize(480, 480, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (_) {
    // Graceful fallback to raw buffer if sharp is unavailable
  }

  const base64Data = processedBuffer.toString('base64');
  const imageUrl = `data:image/jpeg;base64,${base64Data}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const startTime = Date.now();
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 450
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson = null;
      try { errorJson = JSON.parse(errorText); } catch (_) {}
      const errMsg = errorJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 429) {
        console.warn(`[GroqVision] Rate limit reached (429): ${errMsg}`);
        return {
          identified: false,
          site_id: null,
          monument_id: null,
          monument_name: 'Unknown',
          visual_clues: [],
          confidence_label: 'unknown',
          reason: 'Groq vision rate limit reached (7,000 ITPM limit).',
          model: model,
          provider: 'groq',
          rateLimited: true,
          latencyMs: latency
        };
      }

      throw new Error(`Groq API Error (${response.status}): ${errMsg}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Strip markdown fences
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }
    jsonStr = jsonStr.trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      // If direct parse failed, attempt regex extraction of JSON object
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Failed to parse Groq Qwen JSON response: ${rawContent.slice(0, 100)}...`);
      }
    }

    const normalizedId = normalizeMonumentId(parsed.monument_id);

    if (parsed.identified && normalizedId) {
      const siteId = MONUMENT_SITE_MAP[normalizedId] || parsed.site_id;
      const monumentName = MONUMENT_NAME_MAP[normalizedId] || parsed.monument_name;

      return {
        identified: true,
        site_id: siteId,
        monument_id: normalizedId,
        monument_name: monumentName,
        visual_clues: Array.isArray(parsed.visual_clues) ? parsed.visual_clues : [],
        confidence_label: ['high', 'medium', 'low'].includes(parsed.confidence_label) ? parsed.confidence_label : 'high',
        reason: parsed.reason || `Identified as ${monumentName} via Groq Qwen 3.8-27B visual architectural analysis.`,
        model: model,
        provider: 'groq',
        latencyMs: latency
      };
    }

    // Explicitly unverified / out-of-catalog
    return {
      identified: false,
      site_id: null,
      monument_id: null,
      monument_name: 'Unknown',
      visual_clues: Array.isArray(parsed.visual_clues) ? parsed.visual_clues : [],
      confidence_label: 'unknown',
      reason: parsed.reason || 'The visual features do not match any of the 9 supported Chalukyan monuments in Bagalkot.',
      model: model,
      provider: 'groq',
      latencyMs: latency
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Groq Qwen 3.8-27B vision call timed out (15s exceeded)`);
    }
    throw err;
  }
}

module.exports = {
  analyzeImage,
  normalizeMonumentId,
  VALID_MONUMENT_IDS
};
