import { useState, useEffect, useCallback } from 'react';

const langMap = {
  'en': 'en-US',
  'kn': 'kn-IN',
  'hi': 'hi-IN'
};

export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      // Pre-load voices
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text, lang = 'en') => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = langMap[lang] || 'en-US';
    utterance.lang = targetLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === targetLang) || 
                         voices.find(v => v.lang && v.lang.startsWith(targetLang.substring(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { speaking, supported, speak, stop };
};
