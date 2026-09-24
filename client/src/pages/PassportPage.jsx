import { useState, useEffect } from 'react';
import { 
  getPassportData, 
  computeBadges, 
  ASI_QUIZ_QUESTIONS, 
  recordQuizResult, 
  markMonumentExplored 
} from '../services/passportService';
import { getAllMonuments } from '../services/api';
import { Card } from '../components/ui/Card';
import { t } from '../utils/translations';
import { getMonumentImage } from '../utils/imageRegistry';

export const PassportPage = ({ onSelectMonument, language = 'en' }) => {
  const [passport, setPassport] = useState(getPassportData());
  const [monuments, setMonuments] = useState([]);
  const [activeTab, setActiveTab] = useState('badges'); // 'badges' | 'quiz' | 'stamps'
  const [stampNotice, setStampNotice] = useState(null);

  // Step-by-step Quiz State Machine
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answeredHistory, setAnsweredHistory] = useState([]);

  useEffect(() => {
    async function loadMonuments() {
      const res = await getAllMonuments();
      if (!res.error) setMonuments(res);
    }
    loadMonuments();
  }, []);

  const badges = computeBadges(passport, language);
  const visitedCount = passport.visitedMonuments?.length || 0;

  // Toggle or add monument stamp
  const handleToggleVisited = (monumentId, monumentName) => {
    const isAlready = passport.visitedMonuments.includes(monumentId);
    let updated;
    if (isAlready) {
      const current = getPassportData();
      current.visitedMonuments = current.visitedMonuments.filter(id => id !== monumentId);
      localStorage.setItem('heritagelens_passport_v1', JSON.stringify(current));
      updated = current;
      showToast(language === 'kn' ? 'ಪಾಸ್‌ಪೋರ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ' : language === 'hi' ? 'पासपोर्ट से हटाया गया' : `Removed ${monumentName || 'monument'} from Passport`);
    } else {
      updated = markMonumentExplored(monumentId);
      showToast(
        language === 'kn'
          ? `${monumentName || 'ಸ್ಮಾರಕ'} ಪಾಸ್‌ಪೋರ್ಟ್‌ಗೆ ಮುದ್ರೆಯೊತ್ತಲಾಗಿದೆ! 🏛️`
          : language === 'hi'
          ? `${monumentName || 'स्मारक'} पासपोर्ट में मुहरबंद किया गया! 🏛️`
          : `Stamped ${monumentName || 'monument'} into Passport! 🏛️`
      );
    }
    setPassport({ ...updated });
  };

  const showToast = (msg) => {
    setStampNotice(msg);
    setTimeout(() => setStampNotice(null), 3500);
  };

  // Quiz: Select option
  const handleSelectOption = (optIdx) => {
    if (isAnswerSubmitted) return;
    setSelectedOpt(optIdx);
  };

  // Quiz: Submit Answer for current question
  const handleSubmitAnswer = () => {
    if (selectedOpt === null || isAnswerSubmitted) return;
    const currentQ = ASI_QUIZ_QUESTIONS[quizIndex];
    const isCorrect = selectedOpt === currentQ.correctIndex;
    const newScore = isCorrect ? userScore + 1 : userScore;
    setUserScore(newScore);
    setIsAnswerSubmitted(true);
    setAnsweredHistory(prev => [
      ...prev,
      {
        questionId: currentQ.id,
        question: currentQ.question,
        selectedOpt,
        correctIndex: currentQ.correctIndex,
        isCorrect,
        explanation: currentQ.explanation
      }
    ]);
  };

  // Quiz: Next Question or Finish
  const handleNextQuestion = () => {
    if (quizIndex < ASI_QUIZ_QUESTIONS.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      const updated = recordQuizResult(userScore, ASI_QUIZ_QUESTIONS.length);
      setPassport({ ...updated });
    }
  };

  // Quiz: Retake Quiz
  const handleRetakeQuiz = () => {
    setQuizIndex(0);
    setSelectedOpt(null);
    setIsAnswerSubmitted(false);
    setUserScore(0);
    setQuizFinished(false);
    setAnsweredHistory([]);
  };

  const currentQ = ASI_QUIZ_QUESTIONS[quizIndex];
  const qText = language === 'kn' ? (currentQ.question_kn || currentQ.question) : language === 'hi' ? (currentQ.question_hi || currentQ.question) : currentQ.question;
  const qOpts = language === 'kn' ? (currentQ.options_kn || currentQ.options) : language === 'hi' ? (currentQ.options_hi || currentQ.options) : currentQ.options;
  const qExpl = language === 'kn' ? (currentQ.explanation_kn || currentQ.explanation) : language === 'hi' ? (currentQ.explanation_hi || currentQ.explanation) : currentQ.explanation;

  return (
    <div className="space-y-8 sm:space-y-10 py-4 sm:py-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300 overflow-x-hidden">
      
      {/* Toast Notification */}
      {stampNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-amber-500/40 text-sm flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-amber-400">✓</span>
          <span>{stampNotice}</span>
        </div>
      )}

      {/* Passport Header — Museum Credential Style */}
      <div className="bg-gradient-to-br from-[#1C120D] via-[#2A1810] to-[#150D0A] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_12px_40px_rgba(146,60,19,0.2)] relative overflow-hidden border border-[#C88A42]/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C88A42]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#C88A42]/20 text-[#E5A84F] border border-[#C88A42]/40 uppercase tracking-wider">
              <span>📜</span>
              <span>Official Archaeological Credential • 540–757 CE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Chalukyan Heritage Passport
            </h1>
            <p className="text-[#D6C5B8] text-xs sm:text-sm md:text-base max-w-xl font-sans leading-relaxed">
              Earn official digital archaeological seals across Pattadakal, Badami, and Aihole. Validate your knowledge against verified ASI records to achieve Master Explorer status.
            </p>
          </div>

          {/* Certificate Progress Seal */}
          <div className="bg-white/10 backdrop-blur-md border border-[#C88A42]/40 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto sm:min-w-48 shadow-inner">
            <span className="text-[10px] font-mono text-[#E5A84F] uppercase tracking-wider block font-bold">
              Exploration Seal
            </span>
            <div className="text-3xl sm:text-4xl font-bold font-serif text-[#F5E8D8] my-1">
              {visitedCount} / 9
            </div>
            <div className="text-[11px] uppercase font-semibold text-white/90 tracking-wider">
              {t('stat_monuments_explored', language)}
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#C88A42] to-[#E5A84F] h-full rounded-full transition-all duration-700"
                style={{ width: `${(visitedCount / 9) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center px-2">
        <div className="inline-flex bg-[#F6ECE8] p-1.5 rounded-2xl border border-[#E4D5CE] shadow-inner max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 min-h-[42px] ${
              activeTab === 'badges'
                ? 'bg-[#923C13] text-white shadow-sm font-bold'
                : 'text-[#5A463C] hover:text-[#923C13]'
            }`}
          >
            <span>🏅</span>
            <span>{t('tab_visitor_badges', language)} ({badges.filter(b => b.unlocked).length}/4)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 min-h-[42px] ${
              activeTab === 'quiz'
                ? 'bg-[#923C13] text-white shadow-sm font-bold'
                : 'text-[#5A463C] hover:text-[#923C13]'
            }`}
          >
            <span>📜</span>
            <span>{t('tab_asi_quiz', language)} {passport.quizScore !== null ? `(${passport.quizScore}/5)` : ''}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stamps')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 min-h-[42px] ${
              activeTab === 'stamps'
                ? 'bg-[#923C13] text-white shadow-sm font-bold'
                : 'text-[#5A463C] hover:text-[#923C13]'
            }`}
          >
            <span>🏛️</span>
            <span>{t('tab_passport_stamps', language)} ({visitedCount}/9)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VISITOR BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {badges.map((badge) => (
              <Card
                key={badge.id}
                className={`p-5 sm:p-6 border transition-all ${
                  badge.unlocked
                    ? 'border-amber-300 bg-gradient-to-br from-amber-50/60 to-white shadow-md'
                    : 'border-heritage-border bg-stone-50/50 opacity-80'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm shrink-0 ${
                    badge.unlocked ? 'bg-amber-100 border border-amber-200' : 'bg-stone-200 text-stone-400'
                  }`}>
                    {badge.unlocked ? badge.icon : '🔒'}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-heritage-text">
                        {badge.title}
                      </h3>
                      <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        badge.unlocked 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {badge.unlocked ? t('badge_unlocked', language) : t('badge_locked', language)}
                      </span>
                    </div>

                    <p className="text-xs text-heritage-textSecondary leading-relaxed">
                      {badge.description}
                    </p>

                    <div className="pt-2 text-xs font-mono text-heritage-primary">
                      {t('badge_status', language)}: {badge.progress}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STEP-BY-STEP INTERACTIVE QUIZ */}
      {activeTab === 'quiz' && (
        <div className="bg-white p-4 sm:p-8 md:p-10 rounded-3xl border border-heritage-border shadow-sm space-y-6">
          
          {!quizFinished ? (
            <div className="space-y-6">
              {/* Question Header & Progress Bar */}
              <div className="space-y-3 border-b border-heritage-border/60 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-heritage-primary">
                    {language === 'kn' ? `ಪ್ರಶ್ನೆ ${quizIndex + 1} / ${ASI_QUIZ_QUESTIONS.length}` : language === 'hi' ? `प्रश्न ${quizIndex + 1} / ${ASI_QUIZ_QUESTIONS.length}` : `Question ${quizIndex + 1} of ${ASI_QUIZ_QUESTIONS.length}`}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    {language === 'kn' ? `ಪ್ರಸ್ತುತ ಅಂಕ: ${userScore}` : language === 'hi' ? `वर्तमान स्कोर: ${userScore}` : `Current Score: ${userScore}`}
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-heritage-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((quizIndex + 1) / ASI_QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                <h3 className="font-serif text-lg sm:text-2xl font-bold text-heritage-text pt-2 leading-snug">
                  {qText}
                </h3>
              </div>

              {/* Options List */}
              <div className="space-y-3">
                {qOpts.map((opt, optIdx) => {
                  let btnStyle = 'bg-heritage-surface/60 border-heritage-border text-stone-800 hover:bg-stone-100';
                  
                  if (isAnswerSubmitted) {
                    if (optIdx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                    } else if (selectedOpt === optIdx) {
                      btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                    } else {
                      btnStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                    }
                  } else if (selectedOpt === optIdx) {
                    btnStyle = 'bg-heritage-primary text-white border-heritage-primary font-semibold shadow-xs ring-2 ring-heritage-primary/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between min-h-[48px] ${btnStyle}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          selectedOpt === optIdx && !isAnswerSubmitted
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-stone-700 border border-stone-200'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswerSubmitted && optIdx === currentQ.correctIndex && (
                        <span className="text-emerald-700 font-bold text-xs sm:text-sm shrink-0 ml-2">✓ Correct</span>
                      )}
                      {isAnswerSubmitted && selectedOpt === optIdx && optIdx !== currentQ.correctIndex && (
                        <span className="text-rose-700 font-bold text-xs sm:text-sm shrink-0 ml-2">✕ Incorrect</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Historical Explanation Box */}
              {isAnswerSubmitted && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                    <span>📖</span>
                    <span>{language === 'kn' ? 'ಪುರಾತತ್ವ ಇಲಾಖೆಯ ಐತಿಹಾಸಿಕ ಸಾಕ್ಷ್ಯ' : language === 'hi' ? 'पुरातत्वीय ऐतिहासिक प्रमाण' : 'Archaeological Survey of India Evidence'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {qExpl}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-heritage-border/60 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  {!isAnswerSubmitted ? 'Select an answer and click Submit.' : 'Review historical evidence above, then proceed.'}
                </span>

                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedOpt === null}
                    onClick={handleSubmitAnswer}
                    className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px] ${
                      selectedOpt !== null
                        ? 'bg-heritage-primary hover:bg-heritage-dark text-white cursor-pointer transform hover:-translate-y-0.5'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {t('btn_submit_answer', language)}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-6 sm:px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center space-x-2 min-h-[44px]"
                  >
                    <span>{quizIndex < ASI_QUIZ_QUESTIONS.length - 1 ? t('btn_next_question', language) : t('btn_view_final_score', language)}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Final Score & Review Screen */
            <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 border-2 border-amber-300 text-3xl sm:text-4xl flex items-center justify-center mx-auto shadow-sm">
                {userScore >= 4 ? '👑' : '📜'}
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-heritage-primary">
                  {t('quiz_complete_title', language)}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-heritage-text">
                  Your Score: {userScore} / {ASI_QUIZ_QUESTIONS.length}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {userScore >= 4
                    ? (language === 'kn' ? 'ಅದ್ಭುತ ಸಾಧನೆ! ನಿಮ್ಮ ಉತ್ತರಗಳು ಭಾರತೀಯ ಪುರಾತತ್ವ ಇಲಾಖೆಯ ಅಧಿಕೃತ ದಾಖಲೆಗಳೊಂದಿಗೆ ನಿಖರವಾಗಿ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತವೆ.' : language === 'hi' ? 'उत्कृष्ट प्रदर्शन! आपके उत्तर भारतीय पुरातत्व सर्वेक्षण के प्रमाणित रिकॉर्ड से पूरी तरह मेल खाते हैं।' : 'Outstanding! Your answers align with Archaeological Survey of India historical records. Your credential has been certified.')
                    : (language === 'kn' ? 'ಉತ್ತಮ ಪ್ರಯತ್ನ! ಅನ್ವೇಷಕ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಹೆಚ್ಚಿನ ಸ್ಮಾರಕಗಳನ್ನು ನೋಡಿ ಮತ್ತೆ ರಸಪ್ರಶ್ನೆ ತೆಗೆದುಕೊಳ್ಳಿ.' : language === 'hi' ? 'अच्छा प्रयास! अधिक स्मारकों का अन्वेषण करें और पूर्ण प्रमाणन के लिए पुनः प्रयास करें।' : 'Good attempt! Explore more monuments in the Explorer tab and retake the quiz to achieve full Chalukyan Master certification.')}
                </p>
              </div>

              {/* Badges Progress Update */}
              <div className="p-4 bg-heritage-surface rounded-2xl border border-heritage-border max-w-md mx-auto text-xs text-stone-600">
                <strong>Passport Status: </strong> 
                {visitedCount >= 9 && userScore >= 4 
                  ? 'Bagalkot Heritage Master Badge Unlocked! 👑' 
                  : `Monuments: ${visitedCount}/9 • Quiz: ${userScore}/5`}
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRetakeQuiz}
                  className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors min-h-[40px]"
                >
                  {t('btn_retake_quiz', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stamps')}
                  className="px-6 py-2.5 bg-heritage-primary hover:bg-heritage-dark text-white rounded-xl text-xs font-semibold transition-colors shadow-xs min-h-[40px]"
                >
                  {t('btn_view_stamps', language)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PASSPORT STAMPS */}
      {activeTab === 'stamps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {monuments.map((m) => {
              const isExplored = passport.visitedMonuments?.includes(m.monument_id);
              const localizedName = (language !== 'en' && m.language_adaptations?.[language]?.monument_name)
                ? m.language_adaptations[language].monument_name
                : m.monument_name;
              const imgData = getMonumentImage(m.monument_id);

              return (
                <Card
                  key={m.monument_id}
                  className={`overflow-hidden border transition-all ${
                    isExplored
                      ? 'border-emerald-300 bg-white shadow-md'
                      : 'border-heritage-border bg-stone-50/60'
                  }`}
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-stone-900">
                    <img
                      src={imgData.path}
                      alt={imgData.alt}
                      className={`w-full h-full object-cover transition-all ${isExplored ? '' : 'grayscale opacity-60'}`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Stamp Seal */}
                    <div className="absolute top-3 right-3">
                      {isExplored ? (
                        <span className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-white">
                          ✓
                        </span>
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-black/60 text-white/70 text-xs flex items-center justify-center border border-white/20">
                          ○
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {m.site_id}
                      </span>
                      <h4 className="font-serif font-bold text-sm leading-tight">
                        {localizedName}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {(language !== 'en' && m.language_adaptations?.[language]?.summary)
                        ? m.language_adaptations[language].summary
                        : (m.cultural_significance || m.historical_context)}
                    </p>

                    <div className="pt-2 border-t border-heritage-border/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleVisited(m.monument_id, localizedName)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] ${
                          isExplored
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {isExplored ? t('stamped_btn', language) : t('stamp_btn', language)}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectMonument(m.site_id, m.monument_id)}
                        className="text-xs font-semibold text-heritage-primary hover:underline py-1"
                      >
                        Interpret →
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
