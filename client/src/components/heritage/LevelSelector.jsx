import { LEVELS } from '../../utils/constants';

export const LevelSelector = ({ currentLevel, onChange, language = 'en' }) => {
  const getLevelName = (level) => {
    if (language === 'kn') {
      if (level.code === 'quick') return 'ಸಂಕ್ಷಿಪ್ತ';
      if (level.code === 'tourist') return 'ಪ್ರವಾಸಿ';
      if (level.code === 'student') return 'ವಿದ್ಯಾರ್ಥಿ';
      if (level.code === 'detailed') return 'ವಿವರವಾದ';
    }
    if (language === 'hi') {
      if (level.code === 'quick') return 'संक्षिप्त';
      if (level.code === 'tourist') return 'पर्यटक';
      if (level.code === 'student') return 'छात्र';
      if (level.code === 'detailed') return 'विस्तृत';
    }
    return level.name;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {LEVELS.map((level) => {
        const isActive = currentLevel === level.code;
        return (
          <button
            key={level.code}
            type="button"
            onClick={() => onChange(level.code)}
            title={level.description}
            className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all min-h-[44px] ${
              isActive
                ? 'border-heritage-primary bg-heritage-primary/10 text-heritage-primary font-bold shadow-xs'
                : 'border-heritage-border bg-heritage-surface text-heritage-textSecondary hover:border-heritage-accent hover:bg-heritage-accentLight/20 font-medium'
            }`}
          >
            <span className="text-lg sm:text-xl mb-0.5">{level.icon}</span>
            <span className="text-xs sm:text-sm">{getLevelName(level)}</span>
          </button>
        );
      })}
    </div>
  );
};
