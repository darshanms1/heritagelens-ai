import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { getSites, getMonuments } from '../../services/api';
import { getMonumentImage } from '../../utils/imageRegistry';

export const ManualSelector = ({ onSelect, language = 'en' }) => {
  const [sites, setSites] = useState([]);
  const [monuments, setMonuments] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true);
      const res = await getSites();
      if (!res.error) setSites(res);
      else setError("Failed to load heritage sites");
      setLoading(false);
    };
    fetchSites();
  }, []);

  const handleSiteSelect = async (site) => {
    setSelectedSite(site);
    setLoading(true);
    const res = await getMonuments(site.site_id);
    if (!res.error) setMonuments(res);
    else setError("Failed to load monuments");
    setLoading(false);
  };

  const getSiteName = (site) => {
    if (!site) return '';
    if (language !== 'en' && site.language_adaptations?.[language]?.site_name) {
      return site.language_adaptations[language].site_name;
    }
    return site.site_name;
  };

  const getSiteSummary = (site) => {
    if (!site) return '';
    if (language !== 'en' && site.language_adaptations?.[language]?.summary) {
      return site.language_adaptations[language].summary;
    }
    return site.summary;
  };

  if (loading) {
    return (
      <div className="text-center p-12 text-heritage-textSecondary">
        <div className="w-8 h-8 border-3 border-heritage-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading verified heritage catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
        <p className="font-medium text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedSite ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sites.map(site => {
            const displayName = getSiteName(site);
            const displaySummary = getSiteSummary(site);
            const imgData = getMonumentImage(site.site_id);

            return (
              <Card 
                key={site.site_id} 
                hoverable 
                onClick={() => handleSiteSelect(site)} 
                className="overflow-hidden border-heritage-border group cursor-pointer"
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-stone-900">
                  <img
                    src={imgData.path}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {site.site_id === 'pattadakal' && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400 text-stone-950">
                      UNESCO World Heritage
                    </span>
                  )}
                  
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-serif text-xl font-bold text-white drop-shadow">
                      {displayName}
                    </h4>
                    <p className="text-xs text-white/80">
                      {site.period} • {site.dynasty}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white space-y-2">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {displaySummary}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-heritage-primary">
                    <span>
                      {language === 'kn' ? '3 ಪ್ರಮುಖ ಸ್ಮಾರಕಗಳನ್ನು ನೋಡಿ' : language === 'hi' ? '3 प्रमुख स्मारक देखें' : 'Explore 3 Key Monuments'}
                    </span>
                    <span>→</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={() => setSelectedSite(null)}
              className="text-xs font-semibold text-heritage-primary hover:underline flex items-center space-x-1 py-1 min-h-[36px]"
            >
              <span>←</span>
              <span>
                {language === 'kn' ? 'ಎಲ್ಲಾ ತಾಣಗಳಿಗೆ ಹಿಂದಿರುಗಿ' : language === 'hi' ? 'सभी स्थलों पर वापस' : 'Back to All Sites'}
              </span>
            </button>
            <span className="text-xs uppercase font-bold text-heritage-textMuted tracking-wider">
              {getSiteName(selectedSite)} Complex
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {monuments.map(monument => {
              const localizedName = (language !== 'en' && monument.language_adaptations?.[language]?.monument_name)
                ? monument.language_adaptations[language].monument_name
                : monument.monument_name;
              const subName = language !== 'en'
                ? monument.monument_name
                : (monument.language_adaptations?.kn?.monument_name || '');
              const imgData = getMonumentImage(monument.monument_id);

              return (
                <Card 
                  key={monument.monument_id} 
                  hoverable 
                  onClick={() => onSelect(selectedSite.site_id, monument.monument_id)} 
                  className="overflow-hidden border-heritage-border group cursor-pointer"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-stone-900">
                    <img
                      src={imgData.path}
                      alt={localizedName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white capitalize">
                      {monument.architectural_style}
                    </span>
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h5 className="font-serif font-bold text-base leading-tight drop-shadow">
                        {localizedName}
                      </h5>
                      {subName && (
                        <p className="text-[11px] text-amber-200">
                          {subName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-white space-y-1.5">
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {(language !== 'en' && monument.language_adaptations?.[language]?.summary)
                        ? monument.language_adaptations[language].summary
                        : monument.historical_context}
                    </p>
                    <div className="pt-1.5 flex items-center justify-between text-xs font-semibold text-heritage-primary">
                      <span>
                        {language === 'kn' ? 'ಮಾಹಿತಿ ವೀಕ್ಷಿಸಿ' : language === 'hi' ? 'गाइड देखें' : 'View Grounded Guide'}
                      </span>
                      <span>→</span>
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
