const orchestrator = require('../services/orchestrator');
const knowledgeService = require('../services/knowledgeService');

async function analyzeImage(req, res, next) {
    try {
        if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
            return res.status(400).json({ 
                error: true, 
                message: 'No image file uploaded or the uploaded file is empty. Please upload a non-empty image file.' 
            });
        }
        
        const { language = 'English', level = 'tourist', simulateGeminiError } = req.body;
        const simError = simulateGeminiError || req.headers['x-simulate-gemini-error'];
        
        try {
            const result = await orchestrator.processImage(
                req.file.buffer, 
                req.file.mimetype, 
                language, 
                level,
                { simulateGeminiError: simError }
            );
            res.json(result);
        } catch (procError) {
            console.error("Orchestrator error in analyzeImage:", procError.message || procError);
            const localMatcher = require('../services/localVisionMatcher');
            let fallbackCandidates = [];
            try {
                const lm = await localMatcher.matchImage(req.file.buffer);
                fallbackCandidates = lm.candidates || [];
            } catch (e) {}

            res.json({
                identification: {
                    site: "Bagalkot Heritage Region",
                    site_id: null,
                    monument: "Could not confidently identify monument",
                    monument_id: null,
                    confidence_label: "low",
                    visual_clues: []
                },
                candidates: fallbackCandidates,
                explanation: null,
                low_confidence: true,
                message: "Could not identify this monument automatically. Please select from suggested matches or choose manually below.",
                is_cached: false
            });
        }
    } catch (error) {
        next(error);
    }
}

async function getExplanation(req, res, next) {
    try {
        let { site_id, monument_id, monumentId, siteId, language = 'English', level = 'tourist', detailLevel } = req.body;
        
        monument_id = monument_id || monumentId;
        site_id = site_id || siteId;
        level = level || detailLevel || 'tourist';

        if (!monument_id) {
            return res.status(400).json({ error: true, message: 'monument_id is required' });
        }

        if (!site_id) {
            const monument = knowledgeService.getMonumentById(monument_id);
            if (monument) {
                site_id = monument.site_id;
            } else {
                return res.status(400).json({ error: true, message: 'Invalid monument_id' });
            }
        }
        
        const result = await orchestrator.processManualSelection(site_id, monument_id, language, level);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

async function followUp(req, res, next) {
    try {
        let { question, monument_id, monumentId, previous_context = {}, language = 'English' } = req.body;
        monument_id = monument_id || monumentId;
        
        if (!question || !monument_id) {
            return res.status(400).json({ error: true, message: 'question and monument_id are required' });
        }
        
        const result = await orchestrator.processFollowUp(question, monument_id, previous_context, language);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

async function getSites(req, res, next) {
    try {
        const sites = knowledgeService.getAllSites();
        res.json(sites);
    } catch (error) {
        next(error);
    }
}

async function getMonumentsBySite(req, res, next) {
    try {
        const { siteId } = req.params;
        const monuments = knowledgeService.getMonumentsBySite(siteId);
        res.json(monuments);
    } catch (error) {
        next(error);
    }
}

async function getAllMonuments(req, res, next) {
    try {
        const monuments = knowledgeService.getAllMonuments();
        res.json(monuments);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    analyzeImage,
    getExplanation,
    followUp,
    getSites,
    getMonumentsBySite,
    getAllMonuments
};
