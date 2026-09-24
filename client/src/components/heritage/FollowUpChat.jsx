import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { useSpeech } from '../../hooks/useSpeech';

const SUGGESTIONS_BY_LANG = {
  en: [
    "What should I notice here?",
    "Who built this and why?",
    "What makes this architecture special?",
    "Explain this to a child",
    "Tell me an interesting story about this place"
  ],
  kn: [
    "ಇಲ್ಲಿ ನಾನು ಏನನ್ನು ಗಮನಿಸಬೇಕು?",
    "ಇದನ್ನು ಯಾರು ಮತ್ತು ಏಕೆ ಕಟ್ಟಿಸಿದರು?",
    "ಈ ವಾಸ್ತುಶಿಲ್ಪದ ವಿಶೇಷತೆಯೇನು?",
    "ಇದನ್ನು ಮಕ್ಕಳಿಗೆ ಸರಳವಾಗಿ ವಿವರಿಸಿ"
  ],
  hi: [
    "मुझे यहाँ क्या देखना चाहिए?",
    "इसे किसने और क्यों बनवाया?",
    "इस वास्तुकला की क्या विशेषता है?",
    "इसे बच्चों को सरल भाषा में समझाएं"
  ]
};

export const FollowUpChat = ({ monumentId, language = 'en', onAsk, history = [] }) => {
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [playingIdx, setPlayingIdx] = useState(null);
  const endRef = useRef(null);
  const { speak, stop, speaking } = useSpeech();

  const currentSuggestions = SUGGESTIONS_BY_LANG[language] || SUGGESTIONS_BY_LANG.en;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAsking]);

  useEffect(() => {
    if (!speaking) {
      setPlayingIdx(null);
    }
  }, [speaking]);

  const handleAsk = async (question) => {
    if (!question || !question.trim() || isAsking) return;
    setIsAsking(true);
    const qText = question.trim();
    setInput('');
    try {
      await onAsk(qText);
    } catch (e) {
      console.warn("Follow-up ask error:", e);
    } finally {
      setIsAsking(false);
    }
  };

  const handleReadAloud = (text, idx) => {
    if (playingIdx === idx && speaking) {
      stop();
      setPlayingIdx(null);
    } else {
      setPlayingIdx(idx);
      speak(text, language);
    }
  };

  return (
    <Card className="flex flex-col h-[540px] overflow-hidden bg-[#FFFDFB] border border-[#E8DDD0] shadow-[0_8px_30px_rgba(146,60,19,0.06)] rounded-3xl">
      
      {/* Museum Interpreter Header */}
      <div className="px-5 py-4 border-b border-[#E8DDD0] bg-gradient-to-r from-[#FAF3EC] via-[#FFFDFB] to-[#F5ECE5] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#923C13] to-[#6B2A0A] flex items-center justify-center text-white text-lg shadow-sm border border-[#C88A42]/30">
            🏛️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#231915]">
                Ask the Monument
              </h3>
              <span className="text-[10px] bg-[#F5E8D8] text-[#7E5700] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#C88A42]/30">
                Signature Feature
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#7A6A60]">
              You are talking to the history in front of you • Grounded in ASI records
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center space-x-1.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive Audio Guide</span>
        </span>
      </div>

      {/* Message Feed Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FDFBF7]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3.5 py-8 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#F5E8D8] flex items-center justify-center text-3xl shadow-inner border border-[#C88A42]/30">
              🗿
            </div>
            <div className="space-y-1.5">
              <h4 className="font-serif font-bold text-[#231915] text-lg">
                Curious about this monument?
              </h4>
              <p className="text-[#5A463C] text-xs leading-relaxed">
                Ask about architectural secrets, royal patrons, mythological carvings, or epigraphical inscriptions.
              </p>
            </div>
            <div className="text-[11px] text-[#7E5700] bg-white px-3 py-1.5 rounded-xl border border-[#E8DDD0] shadow-2xs font-medium">
              💡 Tip: Click any suggested question below to start
            </div>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className="space-y-2.5 animate-in fade-in duration-200">
              {/* User Question */}
              <div className="flex justify-end">
                <div className="bg-[#923C13] text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] text-xs sm:text-sm shadow-xs font-semibold leading-relaxed">
                  {msg.question}
                </div>
              </div>

              {/* Monument Response */}
              <div className="flex justify-start">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl rounded-tl-none p-4 max-w-[92%] sm:max-w-[88%] text-xs sm:text-sm shadow-[0_2px_10px_rgba(146,60,19,0.04)] space-y-2.5">
                  <div className="flex items-center space-x-2 text-[11px] font-serif font-bold text-[#923C13] pb-1 border-b border-[#E8DDD0]/60">
                    <span>🏛️ Monument Interpreter</span>
                  </div>

                  <p className="text-[#231915] leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.answer}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8DDD0]/80 text-[10px]">
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <span>✓</span>
                      <span>Verified Archaeological Survey Evidence</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleReadAloud(msg.answer, idx)}
                      className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 transition-colors ${
                        playingIdx === idx
                          ? 'bg-[#923C13] text-white animate-pulse'
                          : 'bg-[#FAF5F0] hover:bg-[#F5E8D8] text-[#923C13]'
                      }`}
                      title="Listen with Text-to-Speech"
                    >
                      <span>🔊</span>
                      <span>{playingIdx === idx ? 'Playing Audio...' : 'Listen'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isAsking && (
          <div className="flex justify-start">
             <div className="bg-white border border-[#E8DDD0] rounded-2xl rounded-tl-none px-4 py-3 text-xs text-[#5A463C] flex space-x-2.5 items-center shadow-xs">
               <div className="w-2 h-2 rounded-full bg-[#923C13] animate-bounce" />
               <div className="w-2 h-2 rounded-full bg-[#923C13] animate-bounce" style={{ animationDelay: '0.2s' }} />
               <div className="w-2 h-2 rounded-full bg-[#923C13] animate-bounce" style={{ animationDelay: '0.4s' }} />
               <span className="pl-1 font-medium font-serif">Consulting Archaeological Survey records...</span>
             </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input & Suggestions Footer */}
      <div className="p-3.5 sm:p-4 border-t border-[#E8DDD0] bg-white space-y-3">
        {/* Suggestion Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-[#7A6A60] uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {currentSuggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              disabled={isAsking}
              onClick={() => handleAsk(s)}
              className="text-xs bg-[#FAF5F0] hover:bg-[#923C13] hover:text-white text-[#4A3B32] px-3.5 py-1.5 rounded-full border border-[#E8DDD0] hover:border-[#923C13] transition-all font-semibold shrink-0 shadow-2xs disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAsk(input); }}
          className="flex space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'kn' ? "ಈ ಸ್ಮಾರಕದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ..." :
              language === 'hi' ? "इस स्मारक के बारे में प्रश्न पूछें..." :
              "Ask anything about this monument (e.g. Who carved this? What does it depict?)..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FAF5F0]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#923C13]/30 text-xs sm:text-sm font-sans"
            disabled={isAsking}
          />

          <button
            type="submit"
            disabled={!input.trim() || isAsking}
            className="bg-[#923C13] hover:bg-[#6B2A0A] disabled:opacity-40 disabled:hover:bg-[#923C13] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 flex items-center space-x-1.5"
          >
            <span>{isAsking ? 'Consulting...' : 'Ask'}</span>
            {!isAsking && <span>→</span>}
          </button>
        </form>
      </div>
    </Card>
  );
};
