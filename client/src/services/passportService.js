/**
 * passportService.js
 * Visitor progress tracking, badge achievements, and verified ASI Chalukya quiz
 * persisted in browser localStorage with full multilingual localization (EN, KN, HI).
 */

const STORAGE_KEY = 'heritagelens_passport_v1';

export const ASI_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Who commissioned the grand Virupaksha Temple at Pattadakal circa 740 CE?',
    question_kn: 'ಸುಮಾರು ಕ್ರಿ.ಶ. 740 ರಲ್ಲಿ ಪಟ್ಟದಕಲ್ಲಿನ ಭವ್ಯ ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯವನ್ನು ಯಾರು ನಿರ್ಮಿಸಿದರು?',
    question_hi: 'लगभग 740 ईस्वी में पट्टदकल के भव्य विरूपाक्ष मंदिर का निर्माण किसने करवाया था?',
    options: [
      'King Pulakeshin II',
      'Queen Lokamahadevi',
      'King Vikramaditya I',
      'Queen Trailokyadevi'
    ],
    options_kn: [
      'ಇಮ್ಮಡಿ ಪುಲಕೇಶಿ',
      'ರಾಣಿ ಲೋಕಮಹಾದೇವಿ',
      'ವಿಕ್ರಮಾದಿತ್ಯ I',
      'ರಾಣಿ ತ್ರೈಲೋಕ್ಯಮಹಾದೇವಿ'
    ],
    options_hi: [
      'राजा पुलकेशिन द्वितीय',
      'रानी लोकमहादेवी',
      'राजा विक्रमादित्य प्रथम',
      'रानी त्रैलोक्यमहादेवी'
    ],
    correctIndex: 1,
    explanation: 'Queen Lokamahadevi commissioned the Virupaksha Temple to commemorate King Vikramaditya II’s victory over the Pallavas of Kanchipuram.',
    explanation_kn: 'ಕಾಂಚೀಪುರದ ಪಲ್ಲವರ ಮೇಲಿನ ವಿಕ್ರಮಾದಿತ್ಯ II ರ ವಿಜಯದ ಸವಿನೆನಪಿಗಾಗಿ ರಾಣಿ ಲೋಕಮಹಾದೇವಿಯು ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯವನ್ನು ನಿರ್ಮಿಸಿದಳು.',
    explanation_hi: 'कांचीपुरम के पल्लवों पर राजा विक्रमादित्य द्वितीय की विजय के उपलक्ष्य में रानी लोकमहादेवी ने विरूपाक्ष मंदिर का निर्माण करवाया था।'
  },
  {
    id: 2,
    question: 'What rare plan distinguishes the famous Durga Temple at Aihole?',
    question_kn: 'ಐಹೊಳೆಯ ಪ್ರಸಿದ್ಧ ದುರ್ಗಾ ದೇವಾಲಯವನ್ನು ಪ್ರತ್ಯೇಕಿಸುವ ಅಪರೂಪದ ನೆಲವಿನ್ಯಾಸ ಯಾವುದು?',
    question_hi: 'ऐहोल के प्रसिद्ध दुर्गा मंदिर को कौन सी दुर्लभ योजना अलग बनाती है?',
    options: [
      'Multi-tiered star-shaped sanctum',
      'Apsidal (horseshoe / chaitya-inspired) curved plan',
      'Octagonal double-story gallery',
      'Pyramidal underground chamber'
    ],
    options_kn: [
      'ಬಹು-ಹಂತದ ನಕ್ಷತ್ರಾಕಾರದ ಗರ್ಭಗುಡಿ',
      'ಗಜಪೃಷ್ಠಾಕಾರದ (ಅರ್ಧವೃತ್ತ / ಚೈತ್ಯ ಮಾದರಿಯ) ವಕ್ರ ಯೋಜನೆ',
      'ಎಂಟು ಮೂಲೆಗಳ ಎರಡಂತಸ್ತಿನ ಗ್ಯಾಲರಿ',
      'ಪಿರಮಿಡ್ ಆಕಾರದ ಭೂಗತ ಕೋಣೆ'
    ],
    options_hi: [
      'बहुस्तरीय तारा-आकार गर्भगृह',
      'गजपृष्ठाकार (घोड़े की नाल / चैत्य-प्रेरित) वक्र योजना',
      'अष्टकोणीय दो मंजिला गैलरी',
      'पिरामिडनुमा भूमिगत कक्ष'
    ],
    correctIndex: 1,
    explanation: 'The Durga Temple features a rare apsidal (horseshoe) plan with an open pillared peristyle gallery, demonstrating early Chalukyan experimentation.',
    explanation_kn: 'ದುರ್ಗಾ ದೇವಾಲಯವು ತೆರೆದ ಕಂಬಗಳ ಪ್ರದಕ್ಷಿಣಾಪಥದೊಂದಿಗೆ ಅಪರೂಪದ ಗಜಪೃಷ್ಠಾಕಾರದ (ಅರ್ಧವೃತ್ತಾಕಾರ) ವಿನ್ಯಾಸವನ್ನು ಹೊಂದಿದೆ.',
    explanation_hi: 'दुर्गा मंदिर में खुले स्तंभयुक्त प्रदक्षिणा मार्ग के साथ एक दुर्लभ गजपृष्ठाकार (अर्धवृत्ताकार) योजना है।'
  },
  {
    id: 3,
    question: 'Badami Cave 3 contains a royal epigraph definitively dating its excavation to which year?',
    question_kn: 'ಬಾದಾಮಿ ಗುಹೆ 3 ರ ಕೆತ್ತನೆಯನ್ನು ನಿಖರವಾಗಿ ಯಾವ ವರ್ಷಕ್ಕೆ ಗುರುತಿಸುವ ರಾಜಶಾಸನವಿದೆ?',
    question_hi: 'बादामी गुफा 3 में एक शाही शिलालेख है जो इसके निर्माण को किस वर्ष का प्रमाणित करता है?',
    options: [
      '490 CE',
      '578 CE',
      '634 CE',
      '740 CE'
    ],
    options_kn: [
      'ಕ್ರಿ.ಶ. 490',
      'ಕ್ರಿ.ಶ. 578',
      'ಕ್ರಿ.ಶ. 634',
      'ಕ್ರಿ.ಶ. 740'
    ],
    options_hi: [
      '490 ईस्वी',
      '578 ईस्वी',
      '634 ईस्वी',
      '740 ईस्वी'
    ],
    correctIndex: 1,
    explanation: 'A celebrated pillar inscription by King Mangalesha securely dates Badami Cave 3 to 578 CE, making it a critical anchor for Indian art history.',
    explanation_kn: 'ಮಂಗಲೇಶ ರಾಜನ ಐತಿಹಾಸಿಕ ಕಂಬದ ಶಾಸನವು ಬಾದಾಮಿ ಗುಹೆ 3 ನ್ನು ಕ್ರಿ.ಶ. 578 ಕ್ಕೆ ನಿಖರವಾಗಿ ದಾಖಲಿಸುತ್ತದೆ.',
    explanation_hi: 'राजा मंगलेश का एक प्रसिद्ध स्तंभ शिलालेख बादामी गुफा 3 को 578 ईस्वी का प्रमाणित करता है।'
  },
  {
    id: 4,
    question: 'Which classical Sanskrit poet is explicitly named in the 634 CE Aihole Prashasti at Meguti Temple?',
    question_kn: 'ಮೇಗುತಿ ದೇವಾಲಯದಲ್ಲಿರುವ ಕ್ರಿ.ಶ. 634 ರ ಐಹೊಳೆ ಪ್ರಶಸ್ತಿಯಲ್ಲಿ ಯಾವ ಶಾಸ್ತ್ರೀಯ ಸಂಸ್ಕೃತ ಕವಿಯನ್ನು ಹೆಸರಿಸಲಾಗಿದೆ?',
    question_hi: 'मेगुती मंदिर के 634 ईस्वी के ऐहोल प्रशस्ति में किस शास्त्रीय संस्कृत कवि का स्पष्ट उल्लेख है?',
    options: [
      'Kalidasa',
      'Banabhatta',
      'Dandin',
      'Bhavabhuti'
    ],
    options_kn: [
      'ಕಾಳಿದಾಸ',
      'ಬಾಣಭಟ್ಟ',
      'ದಂಡಿನ್',
      'ಭವಭೂತಿ'
    ],
    options_hi: [
      'कालिदास',
      'बाणभट्ट',
      'दंडी',
      'भवभूति'
    ],
    correctIndex: 0,
    explanation: 'Poet Ravikirti composed the 634 CE Meguti inscription and compared his poetic genius to Kalidasa and Bharavi, providing crucial dating evidence for Kalidasa.',
    explanation_kn: 'ರವಿಕೀರ್ತಿ ಕವಿಯು 634 ರ ಮೇಗುತಿ ಶಾಸನದಲ್ಲಿ ತನ್ನ ಕಾವ್ಯ ಪ್ರತಿಭೆಯನ್ನು ಕಾಳಿದಾಸ ಮತ್ತು ಭಾರವಿಗೆ ಹೋಲಿಸಿಕೊಂಡಿದ್ದಾನೆ.',
    explanation_hi: 'कवि रविकीर्ति ने 634 ईस्वी के मेगुती शिलालेख में अपनी प्रतिभा की तुलना कालिदास और भारवि से की थी।'
  },
  {
    id: 5,
    question: 'The picturesque Bhutanatha Temples in Badami extend directly into the waters of which sacred lake?',
    question_kn: 'ಬಾದಾಮಿಯ ಸುಂದರ ಭೂತನಾಥ ದೇವಾಲಯಗಳು ಯಾವ ಪವಿತ್ರ ಸರೋವರದ ನೀರಿನೊಳಗೆ ವಿಸ್ತರಿಸಿವೆ?',
    question_hi: 'बादामी के सुंदर भूतनाथ मंदिर किस पवित्र झील के जल में सीधे फैले हुए हैं?',
    options: [
      'Pampa Sarovar',
      'Agastya Lake (Agastya Tirtha)',
      'Unkal Lake',
      'Almatti Reservoir'
    ],
    options_kn: [
      'ಪಂಪಾ ಸರೋವರ',
      'ಅಗಸ್ತ್ಯ ಸರೋವರ (ಅಗಸ್ತ್ಯ ತೀರ್ಥ)',
      'ಉಣಕಲ್ ಕೆರೆ',
      'ಆಲಮಟ್ಟಿ ಜಲಾಶಯ'
    ],
    options_hi: [
      'पंपा सरोवर',
      'अगस्त्य झील (अगस्त्य तीर्थ)',
      'उनकल झील',
      'आलमट्टी जलाशय'
    ],
    correctIndex: 1,
    explanation: 'The Bhutanatha complex is situated on the eastern shoreline of the historic Agastya Lake, surrounded by red sandstone cliffs.',
    explanation_kn: 'ಭೂತನಾಥ ದೇವಾಲಯ ಸಂಕೀರ್ಣವು ಕೆಂಪು ಮರಳುಗಲ್ಲಿನ ಬಂಡೆಗಳಿಂದ ಸುತ್ತುವರೆದಿರುವ ಐತಿಹಾಸಿಕ ಅಗಸ್ತ್ಯ ಸರೋವರದ ಪೂರ್ವ ದಂಡೆಯಲ್ಲಿದೆ.',
    explanation_hi: 'भूतनाथ मंदिर परिसर लाल बलुआ पत्थर की चट्टानों से घिरी ऐतिहासिक अगस्त्य झील के पूर्वी तट पर स्थित है।'
  }
];

export function getPassportData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        visitedMonuments: [],
        quizScore: null,
        quizCompleted: false,
        lastUpdated: new Date().toISOString()
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      visitedMonuments: [],
      quizScore: null,
      quizCompleted: false,
      lastUpdated: new Date().toISOString()
    };
  }
}

export function savePassportData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to save passport data', e);
  }
}

export function markMonumentExplored(monumentId) {
  if (!monumentId) return getPassportData();
  const current = getPassportData();
  if (!current.visitedMonuments.includes(monumentId)) {
    current.visitedMonuments.push(monumentId);
    savePassportData(current);
  }
  return current;
}

export function recordQuizResult(score, total) {
  const current = getPassportData();
  current.quizScore = score;
  current.quizCompleted = true;
  savePassportData(current);
  return current;
}

export function computeBadges(passportData, language = 'en') {
  const visited = passportData.visitedMonuments || [];
  const score = passportData.quizScore || 0;

  // Determine site coverage
  const hasBadami = visited.some(id => id.includes('badami'));
  const hasPattadakal = visited.some(id => id.includes('pattadakal'));
  const hasAihole = visited.some(id => id.includes('aihole'));
  const sitesCount = (hasBadami ? 1 : 0) + (hasPattadakal ? 1 : 0) + (hasAihole ? 1 : 0);

  const titles = {
    beginner: { en: 'Heritage Novice', kn: 'ಪರಂಪರೆ ನವಶಿಕ್ಷು', hi: 'धरोहर नौसिखिया' },
    explorer: { en: 'Chalukyan Explorer', kn: 'ಚಾಲುಕ್ಯ ಅನ್ವೇಷಕ', hi: 'चालुक्य अन्वेषक' },
    enthusiast: { en: 'Heritage Enthusiast', kn: 'ಪರಂಪರೆ ಉತ್ಸಾಹಿ', hi: 'धरोहर उत्साही' },
    master: { en: 'Bagalkot Heritage Master', kn: 'ಬಾಗಲಕೋಟೆ ಪರಂಪರೆ ಮಹಾಗುರು', hi: 'बागलकोट धरोहर मास्टर' }
  };

  const descs = {
    beginner: {
      en: 'Explored at least 1 documented monument.',
      kn: 'ಕನಿಷ್ಠ 1 ದಾಖಲಿತ ಸ್ಮಾರಕವನ್ನು ಅನ್ವೇಷಿಸಲಾಗಿದೆ.',
      hi: 'कम से कम 1 प्रलेखित स्मारक का भ्रमण किया।'
    },
    explorer: {
      en: 'Explored monuments across at least 2 distinct heritage clusters.',
      kn: 'ಕನಿಷ್ಠ 2 ಪ್ರತ್ಯೇಕ ಪರಂಪರೆ ತಾಣಗಳ ಸ್ಮಾರಕಗಳನ್ನು ಅನ್ವೇಷಿಸಲಾಗಿದೆ.',
      hi: 'कम से कम 2 अलग-अलग धरोहर स्थलों के स्मारकों को देखा।'
    },
    enthusiast: {
      en: 'Deeply explored 6 or more Bagalkot monuments.',
      kn: '6 ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಾಗಲಕೋಟೆ ಸ್ಮಾರಕಗಳನ್ನು ಅನ್ವೇಷಿಸಲಾಗಿದೆ.',
      hi: '6 या अधिक बागलकोट स्मारकों का विस्तृत अन्वेषण किया।'
    },
    master: {
      en: 'Explored all 9 monuments and scored 4+ on the verified ASI Quiz.',
      kn: 'ಎಲ್ಲಾ 9 ಸ್ಮಾರಕಗಳ ದರ್ಶನ ಪಡೆದು ಪುರಾತತ್ವ ರಸಪ್ರಶ್ನೆಯಲ್ಲಿ 4+ ಅಂಕ ಗಳಿಸಲಾಗಿದೆ.',
      hi: 'सभी 9 स्मारकों को देखा और एएसआई क्विज़ में 4+ अंक प्राप्त किए।'
    }
  };

  return [
    {
      id: 'beginner',
      title: titles.beginner[language] || titles.beginner.en,
      description: descs.beginner[language] || descs.beginner.en,
      icon: '🥉',
      unlocked: visited.length >= 1,
      progress: `${Math.min(visited.length, 1)} / 1`
    },
    {
      id: 'explorer',
      title: titles.explorer[language] || titles.explorer.en,
      description: descs.explorer[language] || descs.explorer.en,
      icon: '🥈',
      unlocked: sitesCount >= 2,
      progress: `${sitesCount} / 2 ${language === 'kn' ? 'ತಾಣಗಳು' : language === 'hi' ? 'स्थल' : 'clusters'}`
    },
    {
      id: 'enthusiast',
      title: titles.enthusiast[language] || titles.enthusiast.en,
      description: descs.enthusiast[language] || descs.enthusiast.en,
      icon: '🥇',
      unlocked: visited.length >= 6,
      progress: `${visited.length} / 6 ${language === 'kn' ? 'ಸ್ಮಾರಕಗಳು' : language === 'hi' ? 'स्मारक' : 'monuments'}`
    },
    {
      id: 'master',
      title: titles.master[language] || titles.master.en,
      description: descs.master[language] || descs.master.en,
      icon: '👑',
      unlocked: visited.length >= 9 && score >= 4,
      progress: `${visited.length}/9 • Quiz: ${score !== null ? `${score}/5` : 'Pending'}`
    }
  ];
}
