import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { getDemoExamples } from '../../services/api';

export const DemoMode = ({ onSelect, language = 'en' }) => {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDemos = async () => {
      setLoading(true);
      const res = await getDemoExamples();
      if (!res.error) setDemos(res);
      setLoading(false);
    };
    fetchDemos();
  }, []);

  if (loading || !demos.length) return null;

  const getLocalizedMonumentName = (demo) => {
    if (language === 'kn') {
      if (demo.demo_id.includes('pattadakal')) return 'ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯ';
      if (demo.demo_id.includes('badami')) return 'ಬಾದಾಮಿ ಗುಹೆ 3';
      if (demo.demo_id.includes('aihole')) return 'ದುರ್ಗಾ ದೇವಾಲಯ';
    }
    if (language === 'hi') {
      if (demo.demo_id.includes('pattadakal')) return 'विरूपाक्ष मंदिर';
      if (demo.demo_id.includes('badami')) return 'बादामी गुफा 3';
      if (demo.demo_id.includes('aihole')) return 'दुर्गा मंदिर';
    }
    return demo.monument_name;
  };

  const getLocalizedSiteName = (demo) => {
    const s = demo.site_name || demo.site_id || '';
    if (language === 'kn') {
      if (s.toLowerCase().includes('pattadakal')) return 'ಪಟ್ಟದಕಲ್ಲು';
      if (s.toLowerCase().includes('badami')) return 'ಬಾದಾಮಿ';
      if (s.toLowerCase().includes('aihole')) return 'ಐಹೊಳೆ';
    }
    if (language === 'hi') {
      if (s.toLowerCase().includes('pattadakal')) return 'पट्टदकल';
      if (s.toLowerCase().includes('badami')) return 'बादामी';
      if (s.toLowerCase().includes('aihole')) return 'ऐहोल';
    }
    return s;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 justify-center mb-6">
        <span className="text-xl">📌</span>
        <h3 className="font-serif text-2xl text-heritage-primary text-center">
          {language === 'kn' ? 'ಡೆಮೊ ಮೋಡ್ — ಸಿದ್ಧಪಡಿಸಿದ ಉದಾಹರಣೆಗಳು' : language === 'hi' ? 'डेमो मोड — सत्यापित उदाहरण' : 'Demo Mode — Prepared Examples'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demos.map((demo) => {
          const locName = getLocalizedMonumentName(demo);
          const locSite = getLocalizedSiteName(demo);

          return (
            <Card 
              key={demo.demo_id} 
              hoverable 
              onClick={() => onSelect(demo.demo_id)}
              className="overflow-hidden group cursor-pointer border-heritage-border"
            >
              {/* Monument Image Card */}
              <div className="aspect-[4/3] relative overflow-hidden bg-heritage-surface flex items-center justify-center">
                 <img 
                   src={demo.image_url || `/demo-images/${demo.image_filename}`}
                   alt={locName}
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                 <span className="absolute bottom-3 left-3 font-serif text-white font-bold text-lg drop-shadow-md z-10">
                   {locName}
                 </span>
              </div>
              
              <div className="p-4 bg-white">
                <div className="text-xs text-heritage-primary font-semibold uppercase tracking-wider mb-1">
                  {locSite}
                </div>
                <h4 className="font-medium text-heritage-text mb-1 truncate text-sm">
                  {locName}
                </h4>
                <p className="text-xs text-heritage-textSecondary">
                  {language === 'kn' ? 'ಖಚಿತ ವಿವರಣೆ ಮತ್ತು ಆಡಿಯೊಗಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ' : language === 'hi' ? 'सत्यापित विवरण और ऑडियो के लिए क्लिक करें' : 'Click for deterministic demo & voice'}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
