import { LANGUAGES } from '../../utils/constants';

export const LanguageSelector = ({ currentLanguage, onChange }) => {
  return (
    <div className="inline-flex rounded-lg border border-heritage-border p-1 bg-heritage-surface">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onChange(lang.code)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentLanguage === lang.code
              ? 'bg-heritage-primary text-white shadow-sm'
              : 'text-heritage-textSecondary hover:bg-heritage-accentLight/50'
          }`}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  );
};
