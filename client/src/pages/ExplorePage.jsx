import { useState } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { IdentificationCard } from '../components/heritage/IdentificationCard';
import { ExplanationPanel } from '../components/heritage/ExplanationPanel';
import { LanguageSelector } from '../components/heritage/LanguageSelector';
import { LevelSelector } from '../components/heritage/LevelSelector';
import { FollowUpChat } from '../components/heritage/FollowUpChat';
import { ListenButton } from '../components/heritage/ListenButton';
import { ManualSelector } from '../components/heritage/ManualSelector';
import { getPassportData, markMonumentExplored } from '../services/passportService';
import { t } from '../utils/translations';
import { getMonumentImage } from '../utils/imageRegistry';

export const ExplorePage = ({
  result,
  currentImage,
  loading,
  error,
  language = 'en',
  level = 'tourist',
  followUpHistory,
  onLanguageChange,
  onLevelChange,
  onFollowUpAsk,
  onManualSelect,
  onBack
}) => {
  const [passport, setPassport] = useState(getPassportData());
  const [toastMessage, setToastMessage] = useState(null);

  const monumentId = result?.monument_id;
  const isStamped = monumentId && passport.visitedMonuments?.includes(monumentId);

  const handleTogglePassport = () => {
    if (!monumentId) return;
    if (isStamped) {
      const current = getPassportData();
      current.visitedMonuments = current.visitedMonuments.filter(id => id !== monumentId);
      localStorage.setItem('heritagelens_passport_v1', JSON.stringify(current));
      setPassport({ ...current });
      showToast(language === 'kn' ? 'ಪಾಸ್‌ಪೋರ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ' : language === 'hi' ? 'पासपोर्ट से हटाया गया' : 'Removed from Passport');
    } else {
      const updated = markMonumentExplored(monumentId);
      setPassport({ ...updated });
      showToast(
        language === 'kn' 
          ? 'ಸ್ಮಾರಕ ಪಾಸ್‌ಪೋರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ! 🏛️ (+1 ಪ್ರಗತಿ)' 
          : language === 'hi' 
          ? 'स्मारक पासपोर्ट में मुहरबंद किया गया! 🏛️ (+1 प्रगति)' 
          : 'Monument Stamped in Passport! 🏛️ (+1 Progress)'
      );
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-xs text-stone-500 font-medium animate-pulse">
          {language === 'kn' ? 'ಭಾರತೀಯ ಪುರಾತತ್ವ ಇಲಾಖೆಯ ಅಧಿಕೃತ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...' : language === 'hi' ? 'भारतीय पुरातत्व सर्वेक्षण का प्रामाणिक ज्ञान प्राप्त किया जा रहा है...' : 'Retrieving Archaeological Survey of India evidence...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 py-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-heritage-primary hover:text-heritage-dark bg-white border border-heritage-border px-3.5 py-2 rounded-xl shadow-xs min-h-[38px]"
          >
            <span>←</span>
            <span>{t('back', language)}</span>
          </button>
        )}
        <div className="bg-amber-50 border border-amber-300 text-stone-800 p-6 rounded-2xl text-center space-y-3 shadow-xs">
          <div className="text-3xl mb-1">⚠️</div>
          <h3 className="font-bold text-lg text-heritage-primary">Live Identification Notice</h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">{error}</p>
        </div>
        <div className="pt-6 border-t border-heritage-border text-center space-y-4">
          <h4 className="font-serif text-2xl text-heritage-primary">Continue With Verified Heritage Guide</h4>
          <p className="text-xs sm:text-sm text-heritage-textSecondary max-w-lg mx-auto">
            Select any of Bagalkot's 9 documented monuments below to explore historical context, architecture, and voice narration:
          </p>
          <ManualSelector onSelect={onManualSelect} language={language} />
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { identification, explanation, evidence_sources, low_confidence, is_cached } = result;

  // Resolve display image
  const displayImage = currentImage || result.image_url || (monumentId ? getMonumentImage(monumentId).path : (result.image_filename ? `/demo-images/${result.image_filename}` : null));

  // Text for TTS
  const speakText = explanation ? Object.values(explanation).filter(Boolean).join('. ') : '';

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 animate-in fade-in duration-300 max-w-4xl mx-auto w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-amber-500/40 text-sm flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-amber-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar: Back and Stamp */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-heritage-primary hover:text-heritage-dark bg-white border border-heritage-border px-3.5 py-2 rounded-xl shadow-xs transition-colors min-h-[38px]"
        >
          <span>←</span>
          <span>{t('back', language)}</span>
        </button>

        {monumentId && (
          <button
            type="button"
            onClick={handleTogglePassport}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all flex items-center space-x-1.5 shadow-xs min-h-[38px] ${
              isStamped 
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200' 
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <span>{isStamped ? t('btn_stamped_passport', language) : t('btn_stamp_passport', language)}</span>
          </button>
        )}
      </div>

      {/* Visual Monument Image Target */}
      {displayImage && (
        <div className="relative w-full rounded-2xl overflow-hidden border border-heritage-border shadow-md bg-stone-900 aspect-[16/9] md:aspect-[21/9] max-h-80 group">
          <img 
            src={displayImage} 
            alt={identification?.monument || 'Heritage monument target'} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end p-4 sm:p-6">
            <div className="text-white space-y-1">
              <div className="flex items-center space-x-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-400 text-stone-950 tracking-wide uppercase">
                  {t('verified_visual_target', language)}
                </span>
                {is_cached && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-black/60 text-amber-200 border border-amber-300/30">
                    {t('prepared_demo_grounding', language)}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white drop-shadow">
                {identification?.monument}
              </h2>
              <p className="text-xs sm:text-sm text-stone-200">
                📍 {identification?.site}, Bagalkot District, Karnataka
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode / Grounding Transparency Banner */}
      {is_cached && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs md:text-sm text-amber-950 shadow-xs">
          <div className="flex items-center space-x-2">
            <span>📌</span>
            <span className="font-medium">
              {t('demo_grounding_notice', language)}
            </span>
          </div>
          <span className="text-[11px] bg-white px-2 py-0.5 rounded font-mono font-semibold text-heritage-primary border border-amber-200 hidden sm:inline-block">
            Deterministic Grounding
          </span>
        </div>
      )}

      {/* Identification Header */}
      <IdentificationCard 
        identification={identification} 
        isLowConfidence={low_confidence} 
        is_verification={result.is_verification}
        candidates={result.candidates}
        is_cached={is_cached}
        is_live_ai={result.is_live_ai}
        matchMethod={result.matchMethod || identification?.matchMethod}
        matchedReference={result.matchedReference || identification?.matchedReference}
        distance={result.distance ?? identification?.distance}
        debug={result.debug}
        message={result.message}
        onSelectCandidate={onManualSelect}
      />

      {low_confidence ? (
        <div className="mt-8 pt-8 border-t border-heritage-border space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-2xl text-heritage-primary">
              Select Monument Manually
            </h3>
            <p className="text-xs sm:text-sm text-heritage-textSecondary max-w-lg mx-auto">
              Select any of Bagalkot's 9 documented monuments below to explore historical context, architecture, and voice narration:
            </p>
          </div>
          <ManualSelector onSelect={onManualSelect} language={language} />
        </div>
      ) : (
        <div id="monument-guide" className="space-y-6 sm:space-y-8 scroll-mt-24">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-heritage-border shadow-sm sticky top-[72px] z-40">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-heritage-textMuted uppercase tracking-wider block">
                Language
              </label>
              <LanguageSelector currentLanguage={language} onChange={onLanguageChange} />
            </div>
            
            <div className="space-y-1 w-full sm:w-auto overflow-x-auto">
               <label className="text-[11px] font-bold text-heritage-textMuted uppercase tracking-wider block">
                 Detail Level
               </label>
               <LevelSelector currentLevel={level} onChange={onLevelChange} language={language} />
            </div>

            <div className="pt-2 sm:pt-0 w-full sm:w-auto flex justify-end">
               <ListenButton text={speakText} language={language} />
            </div>
          </div>

          {/* Explanation Content */}
          <ExplanationPanel 
            explanation={explanation} 
            evidenceSources={evidence_sources} 
          />

          {/* Follow-up Q&A */}
          <div className="pt-6">
            <h3 className="text-2xl font-serif text-heritage-primary mb-4 flex items-center space-x-2">
              <span>💬</span>
              <span>{t('ask_monument_heading', language)}</span>
            </h3>
            <FollowUpChat 
              monumentId={result.monument_id}
              language={language}
              history={followUpHistory}
              onAsk={onFollowUpAsk}
            />
          </div>
        </div>
      )}
    </div>
  );
};
