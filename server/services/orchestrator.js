const visionService = require('./visionService');
const knowledgeService = require('./knowledgeService');
const generationService = require('./generationService');

function buildStructuredKnowledgeExplanation(monument, site, language = 'English', level = 'tourist') {
    const lang = (language === 'kn' || language === 'Kannada') ? 'kn' : 
                 (language === 'hi' || language === 'Hindi') ? 'hi' : 'en';

    // Check if we have rich cached data for this monument
    try {
        const fs = require('fs');
        const path = require('path');
        const demoData = fs.readFileSync(path.join(__dirname, '..', 'data', 'demoCache.json'), 'utf8');
        const demoCache = JSON.parse(demoData);
        const demo = demoCache.find(d => d.monument_id === monument.monument_id);
        if (demo && demo.cached_explanations && demo.cached_explanations[lang]) {
            const levelText = demo.cached_explanations[lang][level] || demo.cached_explanations[lang]['tourist'];
            return {
                what_am_i_looking_at: levelText,
                why_is_it_important: monument.cultural_significance,
                historical_context: monument.historical_context,
                architectural_features: Array.isArray(monument.architectural_features) ? monument.architectural_features.join(', ') : monument.architectural_features,
                what_to_observe: Array.isArray(monument.visitor_observation_points) ? monument.visitor_observation_points.join('. ') : monument.visitor_observation_points,
                interesting_fact: Array.isArray(monument.interesting_facts) ? monument.interesting_facts.join('. ') : monument.interesting_facts
            };
        }
    } catch (e) {
        // Fall back to direct knowledge base
    }

    if (lang === 'kn') {
        const knData = monument.language_adaptations?.kn;
        return {
            what_am_i_looking_at: knData?.summary || `${monument.monument_name} ಪಟ್ಟದಕಲ್ಲು/ಬಾದಾಮಿ/ಐಹೊಳೆ ವಲಯದ ಪ್ರಮುಖ ಐತಿಹಾಸಿಕ ಸ್ಮಾರಕವಾಗಿದೆ.`,
            why_is_it_important: monument.cultural_significance,
            historical_context: `${monument.period} ರಲ್ಲಿ ${monument.patron} ಅವರ ಕಾಲದಲ್ಲಿ ನಿರ್ಮಿಸಲಾಯಿತು. ${monument.historical_context}`,
            architectural_features: `${monument.architectural_style} ಶೈಲಿ. ${Array.isArray(monument.architectural_features) ? monument.architectural_features.join(', ') : monument.architectural_features}`,
            what_to_observe: Array.isArray(monument.visitor_observation_points) ? monument.visitor_observation_points.join('. ') : monument.visitor_observation_points,
            interesting_fact: Array.isArray(monument.interesting_facts) ? monument.interesting_facts.join('. ') : monument.interesting_facts
        };
    }

    if (lang === 'hi') {
        const hiData = monument.language_adaptations?.hi;
        return {
            what_am_i_looking_at: hiData?.summary || `${monument.monument_name} बागलकोट क्षेत्र का एक प्रमुख ऐतिहासिक स्मारक है।`,
            why_is_it_important: monument.cultural_significance,
            historical_context: `${monument.period} में ${monument.patron} द्वारा निर्मित। ${monument.historical_context}`,
            architectural_features: `${monument.architectural_style} शैली। ${Array.isArray(monument.architectural_features) ? monument.architectural_features.join(', ') : monument.architectural_features}`,
            what_to_observe: Array.isArray(monument.visitor_observation_points) ? monument.visitor_observation_points.join('. ') : monument.visitor_observation_points,
            interesting_fact: Array.isArray(monument.interesting_facts) ? monument.interesting_facts.join('. ') : monument.interesting_facts
        };
    }

    // Default English
    return {
        what_am_i_looking_at: `${monument.monument_name} is a celebrated ${monument.architectural_style} ${monument.type.replace('_', ' ')} located at ${site.site_name}, Bagalkot district, Karnataka. Built during the Chalukya dynasty circa ${monument.period}.`,
        why_is_it_important: monument.cultural_significance,
        historical_context: `Built circa ${monument.period} under the patronage of ${monument.patron}. ${monument.historical_context}`,
        architectural_features: Array.isArray(monument.architectural_features) ? monument.architectural_features.join(', ') : monument.architectural_features,
        what_to_observe: Array.isArray(monument.visitor_observation_points) ? monument.visitor_observation_points.join('. ') : monument.visitor_observation_points,
        interesting_fact: Array.isArray(monument.interesting_facts) ? monument.interesting_facts.join('. ') : monument.interesting_facts
    };
}

async function processImage(imageBuffer, mimeType, language = 'English', level = 'tourist', options = {}) {
    const identification = await visionService.analyzeImage(imageBuffer, mimeType, options);
    
    // Case 1: Image could not be confidently matched to the 9 supported monuments
    if (!identification.identified || identification.confidence_label === 'low' || identification.confidence_label === 'unknown') {
        return {
            identified: false,
            identification: {
                site: identification.site_name || "Bagalkot Heritage Region",
                site_id: identification.site_id || null,
                monument: "Unrecognized Monument",
                monument_id: null,
                confidence_label: "low",
                visual_clues: identification.visual_clues || [],
                reason: identification.reason
            },
            candidates: identification.candidates || [],
            explanation: null,
            low_confidence: true,
            unidentified: true,
            message: identification.reason || "The AI could not identify this monument with high confidence among supported Bagalkot heritage sites. Please select from suggested matches or choose manually below.",
            is_cached: false
        };
    }
    
    // Case 2: Confidently identified in closed-world catalog -> Ground in Knowledge Base
    const monument = knowledgeService.getMonumentById(identification.monument_id);
    const site = knowledgeService.getSiteById(identification.site_id || monument?.site_id);
    
    if (!monument || !site) {
        return {
            identification: {
                site: identification.site_name || "Bagalkot Heritage Region",
                site_id: identification.site_id,
                monument: identification.monument_name,
                monument_id: null,
                confidence_label: "low",
                visual_clues: identification.visual_clues || [],
                reason: "Monument identified by visual cues but not verified in core knowledge records."
            },
            candidates: identification.candidates || [],
            explanation: null,
            low_confidence: true,
            message: "Identified monument records are being updated. Please select manually below.",
            is_cached: false
        };
    }
    
    // Generate grounded explanation using the verified knowledge base
    let explanation = await generationService.generateExplanation(monument, site, language, level);
    
    // If Gemini text generation fails or times out, fall back safely to structured knowledge
    if (!explanation || !explanation.what_am_i_looking_at) {
        console.warn("Gemini explanation generation fallback activated for:", monument.monument_id);
        explanation = buildStructuredKnowledgeExplanation(monument, site, language, level);
    }
    
    return {
        identified: true,
        monument_id: monument.monument_id,
        monumentId: monument.monument_id,
        monument_name: monument.monument_name,
        monumentName: monument.monument_name,
        site_id: site.site_id,
        siteId: site.site_id,
        site_name: site.site_name,
        siteName: site.site_name,
        matchMethod: identification.matchMethod || 'local-clip',
        confidence: identification.confidence || 'HIGH',
        confidence_label: identification.confidence_label || 'high',
        matchedReference: identification.matchedReference || `${monument.monument_id}.jpg`,
        distance: identification.distance ?? 0,
        geminiVerified: Boolean(identification.geminiVerified),
        geminiStatus: identification.geminiStatus || 'SKIPPED',
        debug: identification.debug || {
            referenceImagesCount: 9,
            bestMatch: identification.matchedReference || `${monument.monument_id}.jpg`,
            matchMethod: identification.matchMethod || 'local-clip',
            hashDistance: identification.distance ?? 0,
            geminiVerification: identification.geminiStatus || 'SKIPPED'
        },
        identification: {
            site: site.site_name,
            site_id: site.site_id,
            siteId: site.site_id,
            monument: monument.monument_name,
            monument_id: monument.monument_id,
            monumentId: monument.monument_id,
            confidence: identification.confidence || 'HIGH',
            confidence_label: identification.confidence_label || 'high',
            matchMethod: identification.matchMethod || 'local-clip',
            matchedReference: identification.matchedReference,
            distance: identification.distance ?? 0,
            visual_clues: identification.visual_clues || [],
            reason: identification.reason
        },
        is_verification: Boolean(identification.is_verification),
        candidates: identification.candidates || [],
        explanation,
        evidence_sources: monument.sources || ["Archaeological Survey of India", "UNESCO World Heritage Records"],
        language,
        level,
        is_cached: false,
        is_live_ai: identification.matchMethod === 'multimodal-ai'
    };
}

async function processManualSelection(siteId, monumentId, language = 'English', level = 'tourist') {
    const site = knowledgeService.getSiteById(siteId);
    const monument = knowledgeService.getMonumentById(monumentId);
    
    if (!site || !monument) {
        throw new Error("Site or Monument not found");
    }
    
    let explanation = await generationService.generateExplanation(monument, site, language, level);
    if (!explanation) {
        explanation = buildStructuredKnowledgeExplanation(monument, site, language, level);
    }
    
    return {
        identification: {
            site: site.site_name,
            site_id: site.site_id,
            monument: monument.monument_name,
            confidence: 1.0,
            confidence_label: 'Manual-selection',
            visual_clues: []
        },
        explanation,
        evidence_sources: monument.sources,
        language,
        level,
        is_cached: false,
        monument_id: monument.monument_id
    };
}

function getFallbackFollowUpAnswer(question, monument, site, language) {
    const q = (question || '').toLowerCase();
    const lang = (language === 'kn' || language === 'hi') ? language : 'en';

    // 1. Try matching with demoCache if monument is in demo
    try {
        const fs = require('fs');
        const path = require('path');
        const demoData = fs.readFileSync(path.join(__dirname, '..', 'data', 'demoCache.json'), 'utf8');
        const demoCache = JSON.parse(demoData);
        const demo = demoCache.find(d => d.monument_id === monument.monument_id);

        if (demo && demo.cached_followups) {
            if (q.includes('notice') || q.includes('look') || q.includes('observe') || q.includes('see') || q.includes('ಗಮನಿಸ') || q.includes('देखें')) {
                return demo.cached_followups.what_to_notice?.[lang] || demo.cached_followups.what_to_notice?.['en'];
            }
            if (q.includes('who') || q.includes('built') || q.includes('patron') || q.includes('king') || q.includes('queen') || q.includes('ಯಾರು') || q.includes('ಕಟ್ಟಿಸ') || q.includes('किसने') || q.includes('बनाया')) {
                return demo.cached_followups.who_built?.[lang] || demo.cached_followups.who_built?.['en'];
            }
            if (q.includes('child') || q.includes('kid') || q.includes('simple') || q.includes('12') || q.includes('ಮಗು') || q.includes('ಸರಳ') || q.includes('बच्चे') || q.includes('सरल')) {
                return demo.cached_followups.explain_to_child?.[lang] || demo.cached_followups.explain_to_child?.['en'];
            }
            if (q.includes('architecture') || q.includes('special') || q.includes('style') || q.includes('ವಾಸ್ತು') || q.includes('ವಿಶೇಷ') || q.includes('वास्तु') || q.includes('विशेष')) {
                return demo.cached_followups.architecture_special?.[lang] || demo.cached_followups.architecture_special?.['en'];
            }
        }
    } catch (e) {
        console.error("Error reading demoCache fallback:", e);
    }

    // 2. Synthesize from verified monument knowledge base
    if (lang === 'kn') {
        if (q.includes('ಯಾರು') || q.includes('ಕಟ್ಟಿಸ') || q.includes('who') || q.includes('built')) {
            return `${monument.monument_name} ಅನ್ನು ${monument.patron} ಅವರ ಕಾಲದಲ್ಲಿ (${monument.period}) ಚಾಲುಕ್ಯ ಶೈಲಿಯಲ್ಲಿ ನಿರ್ಮಿಸಲಾಯಿತು. ${monument.historical_context}`;
        }
        return `${monument.cultural_significance} ${monument.historical_context} ವಾಸ್ತುಶಿಲ್ಪ ಶೈಲಿ: ${monument.architectural_style}.`;
    }

    if (lang === 'hi') {
        if (q.includes('किसने') || q.includes('बनाया') || q.includes('who') || q.includes('built')) {
            return `${monument.monument_name} का निर्माण ${monument.patron} द्वारा (${monument.period}) में कराया गया था। ऐतिहासिक संदर्भ: ${monument.historical_context}`;
        }
        return `${monument.cultural_significance} ऐतिहासिक संदर्भ: ${monument.historical_context}। वास्तु शैली: ${monument.architectural_style}।`;
    }

    // Default English fallback
    if (q.includes('who') || q.includes('built') || q.includes('patron')) {
        return `Built under the patronage of ${monument.patron} during the Chalukya dynasty (${monument.period}). Historical context: ${monument.historical_context}`;
    }
    if (q.includes('notice') || q.includes('observe')) {
        return `Key observation points: ${monument.visitor_observation_points?.join('. ')}. Architectural features: ${monument.architectural_features?.join(', ')}.`;
    }
    return `${monument.cultural_significance} Historical Context: ${monument.historical_context} Architectural Style: ${monument.architectural_style}.`;
}

async function processFollowUp(question, monumentId, previousContext, language = 'English') {
    const monument = knowledgeService.getMonumentById(monumentId);
    if (!monument) throw new Error("Monument not found");
    
    const site = knowledgeService.getSiteById(monument.site_id);
    
    // Normalize language code to name if needed for Gemini
    const langCode = (language === 'kn' || language === 'Kannada') ? 'kn' : (language === 'hi' || language === 'Hindi') ? 'hi' : 'en';
    const langName = langCode === 'kn' ? 'Kannada' : langCode === 'hi' ? 'Hindi' : 'English';

    // If Gemini API key is missing, use verified knowledge fallback immediately
    if (!process.env.GEMINI_API_KEY) {
        const answer = getFallbackFollowUpAnswer(question, monument, site, langCode);
        return {
            answer,
            monument_id: monumentId,
            language: langCode,
            is_cached: true,
            is_fallback: true,
            source: "Curated Heritage Knowledge Base"
        };
    }

    try {
        const result = await generationService.generateFollowUp(question, monument, site, previousContext, langName);
        if (!result || !result.answer || result.answer.includes("unable to answer")) {
            throw new Error("AI response incomplete, falling back to curated knowledge");
        }
        return {
            answer: result.answer,
            monument_id: monumentId,
            language: langCode,
            is_cached: false
        };
    } catch (err) {
        console.warn("Follow-up generation fallback activated:", err.message);
        const answer = getFallbackFollowUpAnswer(question, monument, site, langCode);
        return {
            answer,
            monument_id: monumentId,
            language: langCode,
            is_cached: true,
            is_fallback: true,
            source: "Curated Heritage Knowledge Base"
        };
    }
}

module.exports = {
    processImage,
    processManualSelection,
    processFollowUp
};
