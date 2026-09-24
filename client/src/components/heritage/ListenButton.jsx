import { useSpeech } from '../../hooks/useSpeech';

export const ListenButton = ({ text, language = 'en' }) => {
  const { speaking, supported, speak, stop } = useSpeech();

  if (!supported) {
    return (
      <span className="text-xs text-heritage-textMuted flex items-center space-x-1">
        <span>🔇</span>
        <span>{language === 'kn' ? 'ಧ್ವನಿ ಬೆಂಬಲವಿಲ್ಲ' : language === 'hi' ? 'आवाज़ समर्थित नहीं' : 'Voice not supported'}</span>
      </span>
    );
  }

  if (speaking) {
    return (
      <button 
        type="button"
        onClick={stop}
        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm min-h-[40px]"
      >
        <span>⏹️</span>
        <span>{language === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : language === 'hi' ? 'रोकें' : 'Stop Listening'}</span>
      </button>
    );
  }

  return (
    <button 
      type="button"
      onClick={() => speak(text, language)}
      className="flex items-center space-x-2 px-4 py-2 bg-heritage-primary text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-heritage-dark transition-colors shadow-sm min-h-[40px]"
    >
      <span>🔊</span>
      <span>{language === 'kn' ? 'ವಿವರಣೆ ಕೇಳಿ' : language === 'hi' ? 'विवरण सुनें' : 'Listen to Explanation'}</span>
    </button>
  );
};
