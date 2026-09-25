const { GoogleGenAI } = require('@google/genai');
const perceptualMatcher = require('./perceptualMatcher');
const localMatcher = require('./localVisionMatcher');
const groqVision = require('./groqVisionService');

// Supported closed-world catalog for Bagalkot heritage monuments
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

/**
 * Optional Gemini vision reasoning with strict 3.5s timeout.
 * Strictly non-blocking: failure never changes a successful local match.
 */
async function callGeminiVision(apiKey, imageBuffer, mimeType, localHint = null) {
  const ai = new GoogleGenAI({ apiKey });

  const hintName = localHint?.monument_name || localHint?.monumentName;
  const hintSite = localHint?.site_name || localHint?.siteName;
  const hintScore = localHint?.score != null ? `, score: ${localHint.score}` : '';
  const altCandidate = localHint?.candidates?.[1]?.monument_name || 'None';

  const hintText = hintName ? `
LOCAL VISUAL FEATURE ANALYSIS PRE-MATCH:
The local vision matching engine observed visual similarity to:
- Most likely candidate: ${hintName} (Site: ${hintSite || 'Bagalkot'}${hintScore})
- Alternative candidate: ${altCandidate}
Please verify if the architectural features in the image truly correspond to this monument or an alternative from the catalog.
` : '';

  const prompt = `
You are an expert heritage monument identification system for Bagalkot district, Karnataka, India.

CRITICAL INSTRUCTION — CLOSED-WORLD IDENTIFICATION:
You are strictly limited to identifying monuments from the following supported catalog:
${SUPPORTED_MONUMENTS}

${hintText}

Analyze the provided image and determine if it shows one of the 9 monuments listed above.

STRICT RULES:
1. ONLY match the image if you see clear, distinct architectural features corresponding to one of the 9 monuments in the catalog above.
2. If the image is of an unrelated temple, landscape, person, modern building, animal, food, or any monument outside this list, you MUST return identified = false.
3. Do NOT invent or guess monuments, sites, dates, or dynasties.
4. Do NOT output a numerical percentage score.
5. Set confidence_label to:
   - "high" only if the monument's key architectural markers are clearly visible and unambiguous.
   - "medium" if the monument is partially obscured or from an atypical angle, but features match.
   - "low" or "unknown" if the image is ambiguous, blurry, or not in the catalog.

Return ONLY a valid JSON object matching this exact schema, with no markdown or additional text:
{
  "identified": true | false,
  "site_id": "pattadakal" | "badami" | "aihole" | null,
  "monument_id": "exact_monument_id_from_catalog" | null,
  "monument_name": "exact_monument_name_from_catalog" | "Unknown",
  "visual_clues": ["specific visible feature 1", "specific visible feature 2"],
  "confidence_label": "high" | "medium" | "low" | "unknown",
  "reason": "Brief visual evidence explaining why this monument was or was not matched"
}
`;

  // Resilient 15s timeout to guarantee cloud AI response without premature cancellation
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Gemini visual identification timed out (15s limit exceeded)")), 15000)
  );

  const apiPromise = ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: [
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType || 'image/jpeg'
        }
      }
    ]
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  let jsonStr = (response.text || '').trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.substring(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.substring(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.substring(0, jsonStr.length - 3);
  }
  jsonStr = jsonStr.trim();

  const parsed = JSON.parse(jsonStr);

  if (parsed.monument_id === 'agastya_lake_bhutanatha_badami') {
    parsed.monument_id = 'bhutanatha_temples_badami';
  }

  if (parsed.identified && !VALID_MONUMENT_IDS.includes(parsed.monument_id)) {
    return {
      identified: false,
      site_id: null,
      monument_id: null,
      monument_name: "Unknown",
      visual_clues: parsed.visual_clues || [],
      confidence_label: "unknown",
      reason: "The visual content does not match any of the supported Bagalkot heritage monuments."
    };
  }

  return {
    identified: Boolean(parsed.identified),
    site_id: parsed.site_id || null,
    monument_id: parsed.monument_id || null,
    monument_name: parsed.monument_name || "Unknown",
    visual_clues: Array.isArray(parsed.visual_clues) ? parsed.visual_clues : [],
    confidence_label: ["high", "medium", "low", "unknown"].includes(parsed.confidence_label) 
      ? parsed.confidence_label 
      : "unknown",
    reason: parsed.reason || ""
  };
}

/**
 * Core Multi-Layer Identification Pipeline:
 * 
 * Priority Order:
 * 1. EXACT HASH MATCH (SHA-256) -> Immediate Return (<2ms)
 * 2. PERCEPTUAL IMAGE MATCHING (pHash + dHash) -> Immediate Return (~25ms)
 * 3. LOCAL CLIP MATCHING (quantized ViT-B/32) -> High confidence -> Immediate Return (~100ms)
 * 4. OPTIONAL GEMINI VERIFICATION (Strictly non-blocking, never overrides local match)
 * 5. MANUAL FALLBACK (Honest candidate suggestions)
 */
async function analyzeImage(imageBuffer, mimeType, options = {}) {
  // Check for automated simulation hook first
  const simError = options.simulateGeminiError;

  // =========================================================================
  // LAYER 1: DETERMINISTIC EXACT & PERCEPTUAL MATCHING (OFFICIAL REFERENCES)
  // =========================================================================
  let pMatch = null;
  try {
    pMatch = await perceptualMatcher.matchBuffer(imageBuffer);
    if (pMatch && pMatch.matched) {
      console.log(`[VisionService] MATCH SUCCESS via ${pMatch.matchMethod} (dist: ${pMatch.distance}) -> ${pMatch.monumentName}`);
      return {
        identified: true,
        site_id: pMatch.siteId,
        siteId: pMatch.siteId,
        site_name: pMatch.siteName,
        siteName: pMatch.siteName,
        monument_id: pMatch.monumentId,
        monumentId: pMatch.monumentId,
        monument_name: pMatch.monumentName,
        monumentName: pMatch.monumentName,
        matchMethod: pMatch.matchMethod,
        confidence: pMatch.confidence,
        confidence_label: pMatch.confidence_label || 'high',
        matchedReference: pMatch.matchedReference,
        distance: pMatch.distance,
        phash_distance: pMatch.phash_distance ?? 0,
        dhash_distance: pMatch.dhash_distance ?? 0,
        visual_clues: pMatch.visual_clues || [],
        reason: pMatch.reason,
        geminiVerified: false,
        geminiStatus: simError ? `SKIPPED (${simError})` : 'SKIPPED (Local reference match is authoritative)',
        debug: {
          referenceImagesCount: 9,
          bestMatch: pMatch.matchedReference,
          matchMethod: pMatch.matchMethod,
          hashDistance: pMatch.distance,
          clipSimilarity: 'N/A (Identified deterministically via ' + pMatch.matchMethod + ')',
          geminiVerification: simError ? `SKIPPED (${simError})` : 'SKIPPED'
        },
        candidates: []
      };
    }
  } catch (pErr) {
    console.warn('[VisionService] Perceptual matcher error:', pErr.message);
  }

  // =========================================================================
  // LAYER 2: LOCAL CLIP FEATURE MATCHING (ONNX ViT-B/32)
  // =========================================================================
  let localResult = null;
  try {
    localResult = await localMatcher.matchImage(imageBuffer);
  } catch (localErr) {
    console.warn("[VisionService] Local CLIP matcher error:", localErr.message);
  }

  // If local CLIP match is HIGH confidence -> Return immediately!
  if (localResult && localResult.confidence_label === 'high') {
    console.log(`[VisionService] MATCH SUCCESS via local-clip (score: ${localResult.score}, margin: ${localResult.margin}) -> ${localResult.monument_name}`);
    return {
      identified: true,
      site_id: localResult.site_id,
      siteId: localResult.site_id,
      site_name: localResult.site_name,
      siteName: localResult.site_name,
      monument_id: localResult.monument_id,
      monumentId: localResult.monument_id,
      monument_name: localResult.monument_name,
      monumentName: localResult.monument_name,
      matchMethod: 'local-clip',
      confidence: 'HIGH',
      confidence_label: 'high',
      matchedReference: `${localResult.monument_id}.jpg`,
      distance: 0,
      clip_similarity: localResult.score,
      visual_clues: localResult.visual_clues || [],
      reason: localResult.reason,
      geminiVerified: false,
      geminiStatus: simError ? `SKIPPED (${simError})` : 'SKIPPED (Local CLIP match is authoritative)',
      debug: {
        referenceImagesCount: 9,
        bestMatch: `${localResult.monument_id}.jpg`,
        matchMethod: 'local-clip',
        hashDistance: 'N/A',
        clipSimilarity: `${localResult.score} (margin: ${localResult.margin})`,
        geminiVerification: simError ? `SKIPPED (${simError})` : 'SKIPPED'
      },
      candidates: localResult.candidates || []
    };
  }

  // If simulating Gemini error, handle graceful local fallback immediately
  if (simError) {
    console.log(`[VisionService] Handling simulated Gemini error: ${simError}`);
    return handleGeminiFailure(simError, localResult, pMatch?.candidates);
  }

  // =========================================================================
  // LAYER 3: GROQ QWEN 3.8-27B MULTIMODAL VLM (PRIMARY CLOUD VISION)
  // =========================================================================
  const groqApiKey = process.env.GROQ_API_KEY;
  let groqResult = null;

  if (groqApiKey && groqApiKey.trim() !== '') {
    try {
      groqResult = await groqVision.analyzeImage(imageBuffer, mimeType, localResult || pMatch?.bestCandidate);
    } catch (gErr) {
      console.warn('[VisionService] Groq Qwen 3.8-27B call encountered issue:', gErr.message);
    }
  }

  // If Groq Qwen 3.8-27B successfully identified the monument
  if (groqResult && groqResult.identified) {
    const combinedClues = Array.from(new Set([
      ...(groqResult.visual_clues || []),
      ...(localResult?.visual_clues || [])
    ])).slice(0, 4);

    const siteNames = { pattadakal: 'Pattadakal', badami: 'Badami', aihole: 'Aihole' };
    const siteName = siteNames[groqResult.site_id] || localResult?.site_name || pMatch?.bestCandidate?.siteName || "Bagalkot Heritage Region";

    return {
      identified: true,
      site_id: groqResult.site_id || localResult?.site_id || pMatch?.bestCandidate?.siteId,
      siteId: groqResult.site_id || localResult?.site_id || pMatch?.bestCandidate?.siteId,
      site_name: siteName,
      siteName: siteName,
      monument_id: groqResult.monument_id,
      monumentId: groqResult.monument_id,
      monument_name: groqResult.monument_name,
      monumentName: groqResult.monument_name,
      matchMethod: 'qwen3.8-27b-vlm',
      confidence: groqResult.confidence_label === 'high' ? 'HIGH' : 'MEDIUM',
      confidence_label: groqResult.confidence_label || 'high',
      matchedReference: `${groqResult.monument_id}.jpg`,
      distance: 0,
      clip_similarity: localResult?.score || null,
      visual_clues: combinedClues,
      reason: groqResult.reason || "Identified via Qwen 3.8 27B multimodal architectural analysis on Groq.",
      groqVerified: true,
      groqStatus: 'SUCCESS',
      modelUsed: groqResult.model || 'qwen/qwen3.8-27b',
      debug: {
        referenceImagesCount: 9,
        bestMatch: `${groqResult.monument_id}.jpg`,
        matchMethod: 'qwen3.8-27b-vlm',
        model: 'qwen/qwen3.8-27b',
        hashDistance: 'N/A',
        clipSimilarity: localResult?.score ? String(localResult.score) : 'N/A',
        groqVerification: 'SUCCESS',
        latencyMs: groqResult.latencyMs
      },
      candidates: localResult?.candidates?.length ? localResult.candidates : (pMatch?.candidates || [])
    };
  }

  // If Groq explicitly verified that the image is NOT in the closed catalog
  if (groqResult && !groqResult.identified && (!localResult || localResult.confidence_label === 'low')) {
    return {
      identified: false,
      site_id: null,
      siteId: null,
      monument_id: null,
      monumentId: null,
      monument_name: "Unrecognized Monument",
      monumentName: "Unrecognized Monument",
      matchMethod: 'none',
      confidence: 'LOW',
      confidence_label: 'low',
      visual_clues: groqResult.visual_clues || [],
      reason: groqResult.reason || "The image does not show one of the 9 supported Bagalkot monuments.",
      groqVerified: true,
      groqStatus: 'SUCCESS (Confirmed Unknown via Qwen 3.8-27B)',
      debug: {
        referenceImagesCount: 9,
        bestMatch: 'None',
        matchMethod: 'none',
        hashDistance: 'N/A',
        clipSimilarity: localResult?.score ? String(localResult.score) : 'N/A',
        groqVerification: 'SUCCESS (Confirmed out-of-catalog)'
      },
      candidates: localResult?.candidates?.length ? localResult.candidates : (pMatch?.candidates || [])
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If no Gemini key, rely on local result without failing
  if (!apiKey || apiKey.trim() === '') {
    return handleGeminiFailure('Gemini API key unset', localResult, pMatch?.candidates);
  }

  // =========================================================================
  // LAYER 4: OPTIONAL GEMINI VERIFICATION (Strictly non-blocking fallback)
  // =========================================================================
  let geminiResult = null;
  let geminiError = null;

  try {
    geminiResult = await callGeminiVision(apiKey, imageBuffer, mimeType, localResult || pMatch?.bestCandidate);
  } catch (err) {
    geminiError = err;
    console.warn('[VisionService] Gemini Vision call encountered issue:', err.message);
  }

  // If Gemini succeeded
  if (geminiResult && geminiResult.identified) {
    const combinedClues = Array.from(new Set([
      ...(geminiResult.visual_clues || []),
      ...(localResult?.visual_clues || [])
    ])).slice(0, 4);

    const siteNames = { pattadakal: 'Pattadakal', badami: 'Badami', aihole: 'Aihole' };
    const siteName = siteNames[geminiResult.site_id] || localResult?.site_name || pMatch?.bestCandidate?.siteName || "Bagalkot Heritage Region";

    return {
      identified: true,
      site_id: geminiResult.site_id || localResult?.site_id || pMatch?.bestCandidate?.siteId,
      siteId: geminiResult.site_id || localResult?.site_id || pMatch?.bestCandidate?.siteId,
      site_name: siteName,
      siteName: siteName,
      monument_id: geminiResult.monument_id,
      monumentId: geminiResult.monument_id,
      monument_name: geminiResult.monument_name,
      monumentName: geminiResult.monument_name,
      matchMethod: 'multimodal-ai',
      confidence: geminiResult.confidence_label === 'high' ? 'HIGH' : 'MEDIUM',
      confidence_label: geminiResult.confidence_label || 'high',
      matchedReference: `${geminiResult.monument_id}.jpg`,
      distance: 0,
      clip_similarity: localResult?.score || null,
      visual_clues: combinedClues,
      reason: geminiResult.reason || localResult?.reason || "Identified via multimodal architectural analysis.",
      geminiVerified: true,
      geminiStatus: 'SUCCESS',
      debug: {
        referenceImagesCount: 9,
        bestMatch: `${geminiResult.monument_id}.jpg`,
        matchMethod: 'multimodal-ai',
        hashDistance: 'N/A',
        clipSimilarity: localResult?.score ? String(localResult.score) : 'N/A',
        geminiVerification: 'SUCCESS'
      },
      candidates: localResult?.candidates?.length ? localResult.candidates : (pMatch?.candidates || [])
    };
  }

  // If Gemini explicitly verified that the image is NOT in the closed catalog
  if (geminiResult && !geminiResult.identified && (!localResult || localResult.confidence_label === 'low')) {
    return {
      identified: false,
      site_id: null,
      siteId: null,
      monument_id: null,
      monumentId: null,
      monument_name: "Unrecognized Monument",
      monumentName: "Unrecognized Monument",
      matchMethod: 'none',
      confidence: 'LOW',
      confidence_label: 'low',
      visual_clues: geminiResult.visual_clues || [],
      reason: geminiResult.reason || "The image does not show one of the 9 supported Bagalkot monuments.",
      geminiVerified: true,
      geminiStatus: 'SUCCESS (Confirmed Unknown)',
      debug: {
        referenceImagesCount: 9,
        bestMatch: 'None',
        matchMethod: 'none',
        hashDistance: 'N/A',
        clipSimilarity: localResult?.score ? String(localResult.score) : 'N/A',
        geminiVerification: 'SUCCESS (Confirmed out-of-catalog)'
      },
      candidates: localResult?.candidates?.length ? localResult.candidates : (pMatch?.candidates || [])
    };
  }

  // If Gemini failed (timeout, 503, 429) or was unavailable
  return handleGeminiFailure(geminiError?.message || 'Gemini unavailable', localResult, pMatch?.candidates);
}

/**
 * Handle Gemini failure gracefully using local visual results
 * NEVER returns a dead-end "Live AI Identification Unavailable"
 */
function handleGeminiFailure(errorMessage, localResult, fallbackCandidates = []) {
  const is503 = String(errorMessage).includes('503');
  const is429 = String(errorMessage).includes('429');
  const isTimeout = String(errorMessage).includes('timed out');
  const errorStatus = is503 ? 'FAILED (HTTP 503 Busy)' : is429 ? 'FAILED (HTTP 429 Limit)' : isTimeout ? 'FAILED (Timeout)' : 'FAILED';

  const defaultCandidates = [
    { monument_id: 'virupaksha_temple_pattadakal', monument_name: 'Virupaksha Temple', site_name: 'Pattadakal', site_id: 'pattadakal' },
    { monument_id: 'cave_3_badami', monument_name: 'Cave 3', site_name: 'Badami', site_id: 'badami' },
    { monument_id: 'durga_temple_aihole', monument_name: 'Durga Temple', site_name: 'Aihole', site_id: 'aihole' }
  ];
  const candidates = localResult?.candidates?.length ? localResult.candidates : (fallbackCandidates?.length ? fallbackCandidates : defaultCandidates);

  // Case A: Local vision match is HIGH confidence
  if (localResult && localResult.confidence_label === 'high') {
    return {
      identified: true,
      site_id: localResult.site_id,
      siteId: localResult.site_id,
      site_name: localResult.site_name,
      siteName: localResult.site_name,
      monument_id: localResult.monument_id,
      monumentId: localResult.monument_id,
      monument_name: localResult.monument_name,
      monumentName: localResult.monument_name,
      matchMethod: 'local-clip',
      confidence: 'HIGH',
      confidence_label: 'high',
      matchedReference: `${localResult.monument_id}.jpg`,
      distance: 0,
      clip_similarity: localResult.score,
      visual_clues: localResult.visual_clues || [],
      reason: `Identified via local visual matching (${is503 ? 'cloud AI 503 fallback' : is429 ? 'cloud quota fallback' : 'resilient fallback'}).`,
      geminiVerified: false,
      geminiStatus: errorStatus,
      debug: {
        referenceImagesCount: 9,
        bestMatch: `${localResult.monument_id}.jpg`,
        matchMethod: 'local-clip',
        hashDistance: 'N/A',
        clipSimilarity: `${localResult.score} (margin: ${localResult.margin})`,
        geminiVerification: errorStatus
      },
      candidates
    };
  }

  // Case B: Local vision match is MEDIUM confidence
  if (localResult && (localResult.confidence_label === 'medium' || localResult.matched)) {
    return {
      identified: true,
      is_verification: true,
      site_id: localResult.site_id,
      siteId: localResult.site_id,
      site_name: localResult.site_name,
      siteName: localResult.site_name,
      monument_id: localResult.monument_id,
      monumentId: localResult.monument_id,
      monument_name: localResult.monument_name,
      monumentName: localResult.monument_name,
      matchMethod: 'local-clip',
      confidence: 'MEDIUM',
      confidence_label: 'medium',
      matchedReference: `${localResult.monument_id}.jpg`,
      distance: 0,
      clip_similarity: localResult.score,
      visual_clues: localResult.visual_clues || [],
      reason: `Visual analysis suggests this is likely ${localResult.monument_name}. Please verify below (${is503 ? 'cloud busy' : 'offline fallback'}).`,
      geminiVerified: false,
      geminiStatus: errorStatus,
      debug: {
        referenceImagesCount: 9,
        bestMatch: `${localResult.monument_id}.jpg`,
        matchMethod: 'local-clip',
        hashDistance: 'N/A',
        clipSimilarity: `${localResult.score}`,
        geminiVerification: errorStatus
      },
      candidates
    };
  }

  // Case C: Truly Low confidence or unknown image
  return {
    identified: false,
    low_confidence: true,
    site_id: null,
    siteId: null,
    monument_id: null,
    monumentId: null,
    monument_name: "Unrecognized Monument",
    monumentName: "Unrecognized Monument",
    matchMethod: 'none',
    confidence: 'LOW',
    confidence_label: 'low',
    visual_clues: [],
    reason: "Could not confidently match this image to Bagalkot's 9 monuments. Top visual candidate suggestions are provided below.",
    geminiVerified: false,
    geminiStatus: errorStatus,
    debug: {
      referenceImagesCount: 9,
      bestMatch: candidates[0]?.monument_name || 'None',
      matchMethod: 'none',
      hashDistance: 'N/A',
      clipSimilarity: localResult?.score ? String(localResult.score) : 'N/A',
      geminiVerification: errorStatus
    },
    candidates
  };
}

module.exports = {
  analyzeImage,
  SUPPORTED_MONUMENTS,
  VALID_MONUMENT_IDS
};
