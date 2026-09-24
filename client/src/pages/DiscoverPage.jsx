import { useState, useEffect } from 'react';
import { getSites, getAllMonuments } from '../services/api';
import { Card } from '../components/ui/Card';
import { markMonumentExplored, getPassportData } from '../services/passportService';
import { t } from '../utils/translations';
import { getMonumentImage } from '../utils/imageRegistry';

export const DiscoverPage = ({ onExploreMonument, initialSiteId = 'all', language = 'en' }) => {
  const [sites, setSites] = useState([]);
  const [monuments, setMonuments] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(initialSiteId);
  const [searchQuery, setSearchQuery] = useState('');
  const [passport, setPassport] = useState(getPassportData());
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [sitesRes, monumentsRes] = await Promise.all([
        getSites(),
        getAllMonuments()
      ]);
      if (!sitesRes.error) setSites(sitesRes);
      if (!monumentsRes.error) setMonuments(monumentsRes);
      setLoading(false);
    }
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToggleVisited = (monumentId, monumentName, e) => {
    e.stopPropagation();
    const isAlready = passport.visitedMonuments?.includes(monumentId);
    let updated;
    if (isAlready) {
      const current = getPassportData();
      current.visitedMonuments = current.visitedMonuments.filter(id => id !== monumentId);
      localStorage.setItem('heritagelens_passport_v1', JSON.stringify(current));
      updated = current;
      showToast(language === 'kn' ? 'ಪಾಸ್‌ಪೋರ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ' : language === 'hi' ? 'पासपोर्ट से हटाया गया' : 'Removed from Passport');
    } else {
      updated = markMonumentExplored(monumentId);
      showToast(
        language === 'kn'
          ? `${monumentName} ಪಾಸ್‌ಪೋರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ! 🏛️`
          : language === 'hi'
          ? `${monumentName} पासपोर्ट में जोड़ा गया! 🏛️`
          : `Stamped ${monumentName || 'monument'} into Passport! 🏛️`
      );
    }
    setPassport({ ...updated });
  };

  const filteredMonuments = monuments.filter(m => {
    const matchesSite = selectedSiteId === 'all' || m.site_id === selectedSiteId;
    const locName = (m.language_adaptations?.[language]?.monument_name || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || 
      m.monument_name.toLowerCase().includes(q) ||
      locName.includes(q) ||
      (m.architectural_style && m.architectural_style.toLowerCase().includes(q)) ||
      (m.patron && m.patron.toLowerCase().includes(q));
    return matchesSite && matchesQuery;
  });

  const currentSite = sites.find(s => s.site_id === selectedSiteId);

  const getSiteDisplayName = (site) => {
    if (!site) return '';
    if (language !== 'en' && site.language_adaptations?.[language]?.site_name) {
      return site.language_adaptations[language].site_name;
    }
    return site.site_name;
  };

  // Regional distinct accent colors
  const getClusterAccent = (siteId) => {
    switch (siteId) {
      case 'pattadakal':
        return {
          tag: 'UNESCO World Heritage',
          color: 'bg-[#C88A42] text-[#231915] border-[#7E5700]/30',
          border: 'border-l-4 border-l-[#C88A42]'
        };
      case 'badami':
        return {
          tag: 'Rock-Cut Monoliths',
          color: 'bg-[#923C13] text-white border-white/20',
          border: 'border-l-4 border-l-[#923C13]'
        };
      case 'aihole':
        return {
          tag: 'Cradle of Architecture',
          color: 'bg-[#2C5D67] text-white border-white/20',
          border: 'border-l-4 border-l-[#2C5D67]'
        };
      default:
        return {
          tag: 'Chalukya Heritage',
          color: 'bg-[#231915] text-white border-white/20',
          border: 'border-l-4 border-l-[#923C13]'
        };
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 py-3 sm:py-6 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#231915] text-[#FAF5F0] px-5 py-3 rounded-2xl shadow-xl border border-[#C88A42]/50 text-sm flex items-center space-x-2.5 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-[#E5A84F] font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editorial Header Banner */}
      <div className="text-center space-y-3.5 max-w-3xl mx-auto px-2">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F5E8D8] text-[#923C13] border border-[#C88A42]/30 uppercase tracking-wider">
          <span>🏛️</span>
          <span>{t('discover_badge', language)}</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#231915] tracking-tight">
          {t('discover_title', language)}
        </h1>
        
        <p className="text-[#5A463C] text-sm sm:text-base md:text-lg leading-relaxed font-sans">
          {t('discover_subtitle', language)}
        </p>

        {/* Catalog summary count stats */}
        <div className="pt-2 flex items-center justify-center space-x-6 text-xs text-[#7A6A60]">
          <span className="flex items-center space-x-1.5">
            <strong className="text-[#923C13] font-bold">9</strong> Verified Monuments
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <strong className="text-[#7E5700] font-bold">3</strong> Regional Clusters
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <strong className="text-[#2C5D67] font-bold">100%</strong> ASI Historical Grounding
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8DDD0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Site Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedSiteId('all')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[42px] ${
              selectedSiteId === 'all'
                ? 'bg-[#923C13] text-white shadow-xs font-bold'
                : 'bg-[#FAF5F0] hover:bg-[#F5E8D8] text-[#4A3B32]'
            }`}
          >
            {t('filter_all_sites', language)}
          </button>
          
          {sites.map(site => {
            const displayName = getSiteDisplayName(site);
            const isSelected = selectedSiteId === site.site_id;
            return (
              <button
                key={site.site_id}
                onClick={() => setSelectedSiteId(site.site_id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 min-h-[42px] ${
                  isSelected
                    ? 'bg-[#923C13] text-white shadow-xs font-bold'
                    : 'bg-[#FAF5F0] hover:bg-[#F5E8D8] text-[#4A3B32]'
                }`}
              >
                <span>{displayName}</span>
                {site.site_id === 'pattadakal' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isSelected ? 'bg-white text-[#923C13]' : 'bg-[#C88A42] text-[#231915]'
                  }`}>
                    UNESCO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder={t('search_placeholder', language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E8DDD0] focus:outline-none focus:ring-2 focus:ring-[#923C13]/30 bg-[#FAF5F0]/60 min-h-[42px]"
          />
          <span className="absolute left-3 top-3 text-sm text-[#7A6A60]">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-[#7A6A60] hover:text-[#231915] p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Regional Cluster Spotlight Card */}
      {currentSite && (
        <div className="relative rounded-3xl overflow-hidden border border-[#E8DDD0] shadow-md bg-white">
          <div className="grid md:grid-cols-2">
            <div className="h-60 sm:h-72 md:h-auto relative overflow-hidden bg-stone-900">
              <img
                src={getMonumentImage(currentSite.site_id).path}
                alt={getSiteDisplayName(currentSite)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-6">
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#C88A42] text-[#231915] mb-1 shadow-xs">
                    {currentSite.unesco_status}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow">
                    {getSiteDisplayName(currentSite)}
                  </h2>
                  <p className="text-xs text-white/80 font-sans">
                    {currentSite.period} • {currentSite.dynasty}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-white">
              <div className="space-y-3">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#923C13]">
                  {t('site_significance', language)}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A463C] leading-relaxed">
                  {(language !== 'en' && currentSite.language_adaptations?.[language]?.summary)
                    ? currentSite.language_adaptations[language].summary
                    : currentSite.summary}
                </p>
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-[#923C13] uppercase tracking-wider mb-1.5">
                    {t('visitor_tips', language)}
                  </h4>
                  <ul className="text-xs text-[#5A463C] space-y-1.5 list-disc list-inside">
                    {currentSite.visitor_tips?.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DDD0] text-[11px] text-[#7A6A60] flex flex-wrap items-center justify-between gap-2">
                <span>Sources: {currentSite.sources?.join(', ')}</span>
                <span className="font-mono bg-[#FAF5F0] px-2 py-0.5 rounded border border-[#E8DDD0]">
                  Lat: {currentSite.geo?.lat}, Lng: {currentSite.geo?.lng}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monuments Grid — Museum-Grade Collection Cards */}
      {loading ? (
        <div className="text-center py-20 text-[#7A6A60] space-y-3">
          <div className="w-8 h-8 border-3 border-[#923C13] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">{t('loading', language)}</p>
        </div>
      ) : filteredMonuments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E8DDD0] p-8 space-y-3">
          <span className="text-3xl">🏛️</span>
          <p className="text-[#231915] font-serif text-xl font-bold">{t('no_monuments_found', language)}</p>
          <button
            onClick={() => { setSelectedSiteId('all'); setSearchQuery(''); }}
            className="mt-2 px-5 py-2.5 bg-[#923C13] hover:bg-[#6B2A0A] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            {t('reset_filters', language)}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {filteredMonuments.map((monument) => {
            const isVisited = passport.visitedMonuments?.includes(monument.monument_id);
            const localizedName = (language !== 'en' && monument.language_adaptations?.[language]?.monument_name)
              ? monument.language_adaptations[language].monument_name
              : monument.monument_name;
            const subtitleName = language !== 'en' 
              ? monument.monument_name 
              : (monument.language_adaptations?.kn?.monument_name || '');
            const localizedSummary = (language !== 'en' && monument.language_adaptations?.[language]?.summary)
              ? monument.language_adaptations[language].summary
              : monument.historical_context;
            const imgData = getMonumentImage(monument.monument_id);
            const cluster = getClusterAccent(monument.site_id);

            return (
              <Card
                key={monument.monument_id}
                className={`overflow-hidden flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(146,60,19,0.12)] transition-all duration-300 group border-[#E8DDD0] bg-white rounded-3xl ${cluster.border}`}
              >
                <div>
                  {/* Authentic Real Photography Container */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-stone-900">
                    <img
                      src={imgData.path}
                      alt={imgData.alt}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    
                    {/* Regional Cluster Badge */}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${cluster.color}`}>
                      {monument.site_id}
                    </span>

                    {/* Visited Status / Passport Stamp Trigger */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleVisited(monument.monument_id, localizedName, e)}
                      title={isVisited ? 'Explored in Passport' : 'Stamp into Passport'}
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm min-h-[30px] ${
                        isVisited 
                          ? 'bg-emerald-600 text-white font-bold' 
                          : 'bg-white/90 hover:bg-white text-[#231915]'
                      }`}
                    >
                      <span>{isVisited ? '✓ Stamped' : '+ Stamp'}</span>
                    </button>

                    {/* Monument Name and Kannada/English subtitle overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-serif text-xl font-bold leading-tight drop-shadow-md">
                        {localizedName}
                      </h3>
                      {subtitleName && (
                        <p className="text-xs text-[#F5E8D8] drop-shadow font-serif">
                          {subtitleName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body Content with Architectural Metadata */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#F5E8D8] text-[#923C13] border border-[#C88A42]/30">
                        {monument.architectural_style}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#FAF5F0] text-[#5A463C] border border-[#E8DDD0]">
                        {monument.period}
                      </span>
                      {monument.patron && (
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-50 text-[#7E5700] border border-amber-200">
                          {monument.patron}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#5A463C] line-clamp-3 leading-relaxed font-sans">
                      {localizedSummary}
                    </p>

                    {/* Key Architectural Highlight */}
                    <div className="pt-2.5 border-t border-[#E8DDD0] text-[11px] text-[#7A6A60] leading-relaxed">
                      <strong className="text-[#923C13] font-semibold">{t('highlight_label', language)}: </strong>
                      <span>{monument.interesting_facts?.[0] || monument.cultural_significance}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 sm:p-6 pt-0 space-y-2">
                  <button
                    onClick={() => {
                      markMonumentExplored(monument.monument_id);
                      onExploreMonument(monument.site_id, monument.monument_id);
                    }}
                    className="w-full py-3 px-4 bg-[#923C13] hover:bg-[#6B2A0A] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center space-x-2 min-h-[44px]"
                  >
                    <span>{t('btn_interpret', language)}</span>
                    <span>→</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
