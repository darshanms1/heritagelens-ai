const fs = require('fs');
const path = require('path');

let demoCache = [];

try {
    const demoData = fs.readFileSync(path.join(__dirname, '..', 'data', 'demoCache.json'), 'utf8');
    demoCache = JSON.parse(demoData);
} catch (error) {
    console.error("Error loading demo cache:", error);
}


function getStructuredSections(demoId, language) {
    const lang = (language === 'kn' || language === 'hi') ? language : 'en';

    const sectionsData = {
        pattadakal_demo: {
            en: {
                why_is_it_important: "It is the largest, most sophisticated temple at Pattadakal and the only surviving ancient monument here that remains in active worship after nearly 13 centuries.",
                historical_context: "Commissioned circa 740 CE by Queen Lokamahadevi to commemorate King Vikramaditya II's victory over the Pallavas of Kanchipuram.",
                architectural_features: "Mature Dravidian vimana tower, square sanctum with circumambulatory passage, 16-pillared sabha mandapa, and detached Nandi pavilion.",
                what_to_observe: "Notice the intricate narrative friezes on the mandapa pillars depicting the Ramayana and Mahabharata, and the monolithic Nandi bull facing the shrine.",
                interesting_fact: "Unlike most imperial monuments built by emperors, this architectural masterpiece was conceived and commissioned entirely by a queen."
            },
            kn: {
                why_is_it_important: "ಇದು ಪಟ್ಟದಕಲ್ಲಿನ ಅತಿದೊಡ್ಡ ಮತ್ತು ಅತ್ಯಂತ ಭವ್ಯವಾದ ದೇವಾಲಯವಾಗಿದ್ದು, ಸುಮಾರು 13 ಶತಮಾನಗಳ ನಂತರವೂ ಇಂದಿಗೂ ಪೂಜೆ ನಡೆಯುವ ಜೀವಂತ ದೇವಾಲಯವಾಗಿದೆ.",
                historical_context: "ಕ್ರಿ.ಶ. 740 ರಲ್ಲಿ ರಾಣಿ ಲೋಕಮಹಾದೇವಿಯು ಪಲ್ಲವರ ಮೇಲಿನ ವಿಕ್ರಮಾದಿತ್ಯ II ರ ವಿಜಯೋತ್ಸವದ ಸ್ಮರಣಾರ್ಥವಾಗಿ ಇದನ್ನು ನಿರ್ಮಿಸಿದಳು.",
                architectural_features: "ಪ್ರಬುದ್ಧ ದ್ರಾವಿಡ ಶೈಲಿಯ ವಿಮಾನ (ಶಿಖರ), ಚೌಕಾಕಾರದ ಗರ್ಭಗುಡಿ, ಪ್ರದಕ್ಷಿಣಾ ಪಥ, 16 ಕಂಬಗಳ ಸಭಾಮಂಟಪ ಮತ್ತು ಪ್ರತ್ಯೇಕ ನಂದಿ ಮಂಟಪ.",
                what_to_observe: "ಮಂಟಪದ ಕಂಬಗಳ ಮೇಲಿನ ರಾಮಾಯಣ-ಮಹಾಭಾರತ ಕಥಾನಕಗಳ ಕೆತ್ತನೆಗಳು ಮತ್ತು ಗರ್ಭಗುಡಿಗೆ ಎದುರಾಗಿರುವ ಏಕಶಿಲಾ ನಂದಿ ವಿಗ್ರಹವನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಗಮನಿಸಿ.",
                interesting_fact: "ಸಾಮಾನ್ಯವಾಗಿ ರಾಜರು ನಿರ್ಮಿಸುವ ಸ್ಮಾರಕಗಳಿಗೆ ಭಿನ್ನವಾಗಿ, ಈ ಭವ್ಯ ವಾಸ್ತುಶಿಲ್ಪದ ಮೇರುಕೃತಿಯನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಒಬ್ಬ ರಾಣಿಯೇ ಯೋಜಿಸಿ ನಿರ್ಮಿಸಿದಳು."
            },
            hi: {
                why_is_it_important: "यह पट्टदकल का सबसे बड़ा और परिष्कृत मंदिर है, जिसमें लगभग 13 शताब्दियों के बाद भी आज तक निरंतर पूजा-अर्चना होती आ रही है।",
                historical_context: "लगभग 740 ईस्वी में रानी लोक महादेवी ने कांचीपुरम के पल्लवों पर राजा विक्रमादित्य द्वितीय की विजय के उपलक्ष्य में बनवाया था।",
                architectural_features: "द्रविड़ शैली का भव्य विमान (शिखर), प्रदक्षिणा पथ युक्त गर्भगृह, 16 स्तंभों वाला विशाल सभा मंडप और सामने नंदी मंडप।",
                what_to_observe: "मंडप के खंभों पर रामायण और महाभारत के प्रसंगों को दर्शाने वाली नक्काशी और गर्भगृह के सम्मुख स्थित विशाल नंदी बैल की मूर्ति देखें।",
                interesting_fact: "अधिकांश शाही स्मारकों के विपरीत, इस वास्तुशिल्प कृति की योजना और निर्माण पूरी तरह से एक रानी (लोक महादेवी) द्वारा कराया गया था।"
            }
        },
        badami_demo: {
            en: {
                why_is_it_important: "Cave 3 is the largest, most elaborately sculpted cave temple in the Badami cluster and contains a definitive epigraphic anchor dated to 578 CE.",
                historical_context: "Excavated during the Early Chalukya reign under King Mangalesha, dedicated to Lord Vishnu and featuring royal patronage inscriptions.",
                architectural_features: "Monolithic rock-cut verandah carved into sheer red sandstone cliffs, supported by massive pillars with madanika (bracket) sculptures.",
                what_to_observe: "Look at the monumental reliefs of Vishnu as Trivikrama and Varaha, and check the ceiling for ancient Chalukyan fresco pigment remains.",
                interesting_fact: "The rock-cut verandah and inner shrine were carved directly from the living sandstone mountain without using any mortar or external stone blocks."
            },
            kn: {
                why_is_it_important: "ಗುಹೆ ೩ ಬಾದಾಮಿಯ ನಾಲ್ಕು ಗುಹೆಗಳಲ್ಲಿ ಅತಿದೊಡ್ಡದಾಗಿದ್ದು, ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಕೆತ್ತನೆಗಳು ಮತ್ತು ಕ್ರಿ.ಶ 578 ರ ಸ್ಪಷ್ಟ ಶಾಸನಾಧಾರವನ್ನು ಹೊಂದಿದೆ.",
                historical_context: "ಆರಂಭಿಕ ಚಾಲುಕ್ಯ ದೊರೆ ಮಂಗಳೇಶನ ಆಳ್ವಿಕೆಯಲ್ಲಿ ವಿಷ್ಣುವಿಗೆ ಸಮರ್ಪಿತವಾಗಿ ಈ ಬೃಹತ್ ಗುಹೆಯನ್ನು ಕೆತ್ತಲಾಯಿತು.",
                architectural_features: "ಕೆಂಪು ಮರಳುಗಲ್ಲಿನ ಬಂಡೆಯನ್ನು ಕೊರೆದು ನಿರ್ಮಿಸಿದ ಏಕಶಿಲಾ ಮುಖಮಂಟಪ, ಬೃಹತ್ ಕಂಬಗಳು ಮತ್ತು ಮನಮೋಹಕ ಮದನಿಕಾ ಬ್ರಾಕೆಟ್ ಶಿಲ್ಪಗಳು.",
                what_to_observe: "ವಿಷ್ಣುವಿನ ತ್ರಿವಿಕ್ರಮ ಮತ್ತು ವರಾಹ ಅವತಾರಗಳ ಬೃಹತ್ ಉಬ್ಬುಶಿಲ್ಪಗಳು ಹಾಗೂ ಛಾವಣಿಯ ಮೇಲಿರುವ ಪ್ರಾಚೀನ ವರ್ಣಚಿತ್ರಗಳ ಕುರುಹುಗಳನ್ನು ಗಮನಿಸಿ.",
                interesting_fact: "ಯಾವುದೇ ಗಾರೆ ಅಥವಾ ಪ್ರತ್ಯೇಕ ಕಲ್ಲುಗಳನ್ನು ಬಳಸದೆ, ಜೀವಂತ ಪರ್ವತದ ಬಂಡೆಯನ್ನೇ ಕೊರೆದು ಇಡೀ ದೇವಾಲಯವನ್ನು ಸೃಷ್ಟಿಸಲಾಗಿದೆ."
            },
            hi: {
                why_is_it_important: "गुफा 3 बादामी की चार गुफाओं में सबसे बड़ी और सबसे अलंकृत है, जिसमें 578 ईस्वी का प्रामाणिक शिलालेख मौजूद है।",
                historical_context: "प्रारंभिक चालुक्य शासक मंगलेश द्वारा भगवान विष्णु को समर्पित इस भव्य गुफा का उत्खनन कराया गया था।",
                architectural_features: "लाल बलुआ पत्थर की खड़ी चट्टान को तराशकर बनाया गया गहरा बरामदा, भारी नक्काशीदार स्तंभ और मदनिका कोष्ठक आकृतियां।",
                what_to_observe: "त्रिविक्रम और वराह के रूप में भगवान विष्णु की विशाल मूर्तियां और छत पर प्राचीन भित्ति चित्रों के दुर्लभ अवशेष देखें।",
                interesting_fact: "इस पूरे मंदिर को बिना किसी बाहरी पत्थर या गारे के, केवल पहाड़ की ठोस चट्टान को काटकर एक ही पत्थर से तराशा गया है।"
            }
        },
        aihole_demo: {
            en: {
                why_is_it_important: "Its rare apsidal plan makes it an architectural anomaly in South India, reflecting the experimental genius of Early Chalukyan builders.",
                historical_context: "Constructed during the late 7th to early 8th century CE as part of Aihole's thriving architectural workshop of over 120 stone temples.",
                architectural_features: "Apsidal (gajaprastha / horseshoe) layout, elevated adhisthana plinth, curved outer pillared ambulatory gallery, and ruined Rekha-Nagara shikhara.",
                what_to_observe: "Walk along the outer curved colonnade and inspect the high-relief carvings of Narasimha, Shiva with Nandi, and flying gandharva couples.",
                interesting_fact: "Despite being called the 'Durga Temple', it is not dedicated to Goddess Durga; the name derives from 'Durg' (fort) due to an adjacent fortification wall."
            },
            kn: {
                why_is_it_important: "ಇದರ ವಿಶಿಷ್ಟ ಗಜಪೃಷ್ಠ (ಕುದುರೆ ಲಾಳದ ಆಕಾರದ) ವಿನ್ಯಾಸವು ದಕ್ಷಿಣ ಭಾರತದ ವಾಸ್ತುಶಿಲ್ಪದಲ್ಲಿ ಅಪರೂಪವಾಗಿದ್ದು, ಆರಂಭಿಕ ಚಾಲುಕ್ಯರ ಪ್ರಾಯೋಗಿಕ ಪ್ರತಿಭೆಯನ್ನು ಬಿಂಬಿಸುತ್ತದೆ.",
                historical_context: "7ನೇ ಶತಮಾನದ ಕೊನೆಯಲ್ಲಿ ಅಥವಾ 8ನೇ ಶತಮಾನದ ಆರಂಭದಲ್ಲಿ 120ಕ್ಕೂ ಹೆಚ್ಚು ದೇವಾಲಯಗಳ ವಾಸ್ತುಶಿಲ್ಪ ಪ್ರಯೋಗಶಾಲೆಯಾಗಿದ್ದ ಐಹೊಳೆಯಲ್ಲಿ ನಿರ್ಮಿಸಲಾಯಿತು.",
                architectural_features: "ಗಜಪೃಷ್ಠ ವಿನ್ಯಾಸ, ಎತ್ತರದ ಜಗುಲಿ, ಹೊರಭಾಗದ ದುಂಡನೆಯ ಕಂಬಗಳ ಪ್ರದಕ್ಷಿಣಾ ಪಥ ಮತ್ತು ಆರಂಭಿಕ ರೇಖಾ-ನಾಗರ ಶಿಖರ.",
                what_to_observe: "ಹೊರಗಿನ ಅರ್ಧಚಂದ್ರಾಕಾರದ ಕಾರಿಡಾರ್‌ನಲ್ಲಿ ನಡೆದು ಕಂಬಗಳ ಮೇಲಿನ ನರಸಿಂಹ, ನಂದಿ ಸಹಿತ ಶಿವ ಮತ್ತು ಗಂಧರ್ವ ದಂಪತಿಗಳ ಶಿಲ್ಪಗಳನ್ನು ವೀಕ್ಷಿಸಿ.",
                interesting_fact: "'ದುರ್ಗಾ ದೇವಾಲಯ' ಎಂಬ ಹೆಸರು ಬಂದಿರುವುದು ದುರ್ಗಾ ದೇವಿಯಿಂದಲ್ಲ, ಬದಲಿಗೆ ಸಮೀಪದ ಕೋಟೆಯ ರಕ್ಷಣಾ ಗೋಡೆಯ (ದುರ್ಗ) ಬಳಿ ಇದ್ದುದರಿಂದ!"
            },
            hi: {
                why_is_it_important: "इसकी दुर्लभ अर्धवृत्ताकार (गजपृष्ठाकार) योजना इसे दक्षिण भारत की वास्तुकला में अद्वितीय बनाती है, जो प्रारंभिक चालुक्यों के प्रयोगशील स्वभाव को दर्शाती है।",
                historical_context: "7वीं के अंत और 8वीं शताब्दी की शुरुआत में 120 से अधिक मंदिरों की वास्तुशिल्प प्रयोगशाला ऐहोल में निर्मित किया गया था।",
                architectural_features: "गजपृष्ठाकार (यू-आकार) योजना, ऊंचा अधिष्ठान चबूतरा, घुमावदार स्तंभयुक्त परिक्रमा गलियारा और नागर शैली का शिखर।",
                what_to_observe: "बाहरी स्तंभों पर बने नृसिंह, नंदी के साथ शिव और आकाशचारी गंधर्वों की उत्कृष्ट मूर्तियों को ध्यान से देखें।",
                interesting_fact: "'दुर्गा मंदिर' कहे जाने के बावजूद यह देवी दुर्गा का मंदिर नहीं है; यह नाम पास की किलेबंदी की दीवार (दुर्ग) के कारण पड़ा था।"
            }
        }
    };

    return (sectionsData[demoId] && sectionsData[demoId][lang]) || {};
}

async function getDemoExamples(req, res, next) {
    try {
        // Always reload cache if needed to ensure fresh data
        const demoData = fs.readFileSync(path.join(__dirname, '..', 'data', 'demoCache.json'), 'utf8');
        demoCache = JSON.parse(demoData);

        const demoPhotos = {
            pattadakal_demo: '/monument-images/virupaksha_temple_pattadakal.jpg',
            badami_demo: '/monument-images/cave_3_badami.jpg',
            aihole_demo: '/monument-images/durga_temple_aihole.jpg'
        };

        const examples = demoCache.map(d => ({
            demo_id: d.demo_id,
            site_id: d.site_id,
            site_name: d.cached_identification.site,
            monument_name: d.cached_identification.monument,
            image_filename: d.image_filename,
            image_url: demoPhotos[d.demo_id] || `/demo-images/${d.image_filename}`
        }));
        res.json(examples);
    } catch (error) {
        next(error);
    }
}

async function getDemoResult(req, res, next) {
    try {
        const { demoId } = req.params;
        const rawLang = req.query.language || req.query.lang || 'en';
        const rawLevel = req.query.level || req.query.detailLevel || 'tourist';
        
        let language = 'en';
        if (rawLang === 'kn' || rawLang.toLowerCase() === 'kannada') language = 'kn';
        else if (rawLang === 'hi' || rawLang.toLowerCase() === 'hindi') language = 'hi';
        
        const level = rawLevel.toLowerCase();

        // Reload fresh cache
        const demoData = fs.readFileSync(path.join(__dirname, '..', 'data', 'demoCache.json'), 'utf8');
        demoCache = JSON.parse(demoData);

        const demo = demoCache.find(d => d.demo_id === demoId);
        
        if (!demo) {
            return res.status(404).json({ error: true, message: 'Demo not found' });
        }
        
        const explanations = demo.cached_explanations[language] || demo.cached_explanations['en'];
        const explanationForLevel = explanations[level] || explanations['tourist'];

        // Get additional rich structured sections for full card rendering
        const extraSections = getStructuredSections(demoId, language);

        const explanation = {
            what_am_i_looking_at: explanationForLevel,
            why_is_it_important: extraSections.why_is_it_important || null,
            historical_context: extraSections.historical_context || null,
            architectural_features: extraSections.architectural_features || null,
            what_to_observe: extraSections.what_to_observe || null,
            interesting_fact: extraSections.interesting_fact || null
        };

        // Look up monument from knowledge base to add evidence_sources
        const knowledgeService = require('../services/knowledgeService');
        const monument = knowledgeService.getMonumentById(demo.monument_id);
        const evidenceSources = monument ? monument.sources : ['Archaeological Survey of India', 'UNESCO World Heritage Records'];
        
        const demoPhotos = {
            pattadakal_demo: '/monument-images/virupaksha_temple_pattadakal.jpg',
            badami_demo: '/monument-images/cave_3_badami.jpg',
            aihole_demo: '/monument-images/durga_temple_aihole.jpg'
        };

        res.json({
            identification: {
                ...demo.cached_identification,
                site_id: demo.site_id
            },
            explanation,
            evidence_sources: evidenceSources,
            language,
            level,
            is_cached: true,
            confidence_label: "Prepared Heritage Grounding (Demo Fallback)",
            image_filename: demo.image_filename,
            image_url: demoPhotos[demoId] || `/demo-images/${demo.image_filename}`,
            monument_id: demo.monument_id
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDemoExamples,
    getDemoResult
};
