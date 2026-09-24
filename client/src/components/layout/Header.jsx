import { useState } from 'react';
import { LANGUAGES } from '../../utils/constants';
import { t } from '../../utils/translations';

export const Header = ({ 
  view, 
  onNavigate, 
  language = 'en', 
  onLanguageChange 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav_home', language), icon: '🏛️' },
    { id: 'discover', label: t('nav_discover', language), icon: '🔍' },
    { id: 'plan', label: t('nav_plan', language), icon: '🗺️' },
    { id: 'passport', label: t('nav_passport', language), icon: '📜' }
  ];

  const handleNav = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDFB]/95 backdrop-blur-md border-b border-[#E8DDD0] shadow-[0_2px_12px_-4px_rgba(146,60,19,0.06)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
        
        {/* Brand Logo with Chalukya Motif */}
        <div 
          className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer group select-none min-w-0"
          onClick={() => handleNav('home')}
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#923C13] to-[#6B2A0A] flex items-center justify-center text-white text-base sm:text-xl shadow-[0_4px_12px_rgba(146,60,19,0.25)] border border-[#C88A42]/30 group-hover:scale-105 transition-all duration-300 shrink-0">
            🏛️
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <h1 className="font-serif text-base sm:text-2xl font-bold text-[#923C13] tracking-tight leading-none truncate">
                HeritageLens
              </h1>
              <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider bg-[#F5E8D8] text-[#7E5700] px-2 py-0.5 rounded-full border border-[#C88A42]/40 shrink-0">
                Bagalkot
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#7A6A60] font-serif italic truncate hidden lg:block">
              {t('app_tagline', language)} • 540–757 CE
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 shrink min-w-0">
          {navItems.map((item) => {
            const isActive = view === item.id || (item.id === 'home' && view === 'vision');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`px-2.5 py-1.5 lg:px-3.5 lg:py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[#923C13] text-white shadow-[0_2px_8px_rgba(146,60,19,0.25)] font-bold'
                    : 'text-[#4A3B32] hover:text-[#923C13] hover:bg-[#F5E8D8]/60 font-medium'
                }`}
              >
                <span className="text-xs sm:text-sm">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}

          {/* Yatra AI Planner External Link */}
          <a
            href="https://jocular-griffin-4d7a57.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 lg:px-3.5 lg:py-2 rounded-xl text-xs font-semibold tracking-wide transition-all inline-flex items-center space-x-1.5 text-[#5A3800] bg-[#FFF8E8] hover:bg-[#FDF0D0] border border-[#E5B54F]/70 shadow-2xs hover:shadow-xs group shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C88A42]/40"
            aria-label="Open Yatra AI Planner in new tab"
            title="Yatra AI Planner (opens in new tab)"
          >
            <span className="text-xs sm:text-sm group-hover:rotate-12 transition-transform duration-300">🧭</span>
            <span className="whitespace-nowrap font-semibold">Yatra AI Planner</span>
            <span className="text-[10px] text-[#7E5700] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
          </a>
        </nav>

        {/* Right Section: Language Toggle & Mobile Hamburger */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          {/* Language Selector */}
          <div className="flex items-center bg-[#F8F3ED] border border-[#E8DDD0] rounded-xl p-0.5 sm:p-1 text-xs font-medium shadow-2xs">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onLanguageChange && onLanguageChange(lang.code)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                  language === lang.code
                    ? 'bg-white font-bold text-[#923C13] shadow-xs border border-[#E8DDD0]/80'
                    : 'text-[#6A5A50] hover:text-[#923C13]'
                }`}
                title={lang.name}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-[#E8DDD0] bg-white text-[#4A3B32] hover:bg-[#F8F3ED] text-sm leading-none min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors shadow-2xs"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DDD0] bg-[#FFFDFB] px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = view === item.id || (item.id === 'home' && view === 'vision');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center space-x-3 min-h-[44px] ${
                    isActive
                      ? 'bg-[#923C13] text-white shadow-xs font-bold'
                      : 'text-[#4A3B32] hover:bg-[#F5E8D8]/70'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Mobile Yatra AI Planner */}
            <a
              href="https://jocular-griffin-4d7a57.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between min-h-[44px] bg-[#FFF8E8] hover:bg-[#FDF0D0] text-[#5A3800] border border-[#E5B54F]/80 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#C88A42]/40"
              aria-label="Open Yatra AI Planner in new tab"
            >
              <div className="flex items-center space-x-3">
                <span className="text-base">🧭</span>
                <span className="font-semibold">Yatra AI Planner</span>
              </div>
              <span className="text-[11px] bg-white text-[#7E5700] px-2.5 py-0.5 rounded-lg border border-[#E5B54F]/60 font-bold flex items-center space-x-1 shadow-2xs">
                <span>External</span>
                <span className="text-[9px]">↗</span>
              </span>
            </a>
          </div>

          {/* Mobile Language Selector Row */}
          <div className="pt-3 border-t border-[#E8DDD0] flex items-center justify-between px-2">
            <span className="text-xs text-[#7A6A60] font-semibold uppercase tracking-wider">
              {t('select_language', language)}:
            </span>
            <div className="flex space-x-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange && onLanguageChange(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs min-h-[36px] font-semibold transition-all ${
                    language === lang.code
                      ? 'bg-[#923C13] text-white shadow-xs'
                      : 'bg-[#F5E8D8]/60 text-[#4A3B32] hover:bg-[#F5E8D8]'
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
