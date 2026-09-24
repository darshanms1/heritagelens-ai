import { useState, useRef, useEffect } from 'react';
import { 
  generateItinerary, 
  replanItinerary, 
  getJudgeDemoScenario, 
  recommendVisit,
  ORIGINS_METADATA,
  TRANSPORT_MODES,
  VERIFIED_ACCOMMODATIONS
} from '../services/plannerService';
import { RouteMap } from '../components/planner/RouteMap';
import { Card } from '../components/ui/Card';
import { t } from '../utils/translations';

export const PlanJourneyPage = ({ onSelectMonument, language = 'en' }) => {
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'recommend'

  // Expanded parameter states matching Yatra AI
  const [origin, setOrigin] = useState('bagalkote');
  const [startPoint, setStartPoint] = useState('badami');
  const [duration, setDuration] = useState('1day');
  const [pace, setPace] = useState('balanced');
  const [interest, setInterest] = useState('architecture');
  const [transportMode, setTransportMode] = useState('car');
  const [groupSize, setGroupSize] = useState(3);
  const [budget, setBudget] = useState(2500);
  const [selectedStay, setSelectedStay] = useState('none');

  // Active generated itinerary state
  const [generatedItinerary, setGeneratedItinerary] = useState(() => 
    generateItinerary({ 
      origin: 'bagalkote',
      startPoint: 'badami', 
      duration: '1day', 
      pace: 'balanced', 
      interest: 'architecture',
      transportMode: 'car',
      groupSize: 3,
      budget: 2500,
      selectedStay: 'none',
      language 
    })
  );
  const [hasGenerated, setHasGenerated] = useState(false);
  const [replanNotice, setReplanNotice] = useState('');
  const [activeStopIndex, setActiveStopIndex] = useState(null);
  const itineraryResultRef = useRef(null);

  // Personalized visit quiz state (Preserved 100%)
  const [quizTime, setQuizTime] = useState('fullday');
  const [quizCompanion, setQuizCompanion] = useState('enthusiast');
  const [quizVibe, setQuizVibe] = useState('architecture');

  // Active recommendations state
  const [activeRecommendations, setActiveRecommendations] = useState(() => 
    recommendVisit({ timeAvailable: 'fullday', companion: 'enthusiast', primaryVibe: 'architecture', language })
  );
  const [hasSearchedMatches, setHasSearchedMatches] = useState(false);
  const matchesResultRef = useRef(null);

  // Re-generate in the active language when language changes
  useEffect(() => {
    setGeneratedItinerary(prev => generateItinerary({
      origin: prev.origin || origin,
      startPoint: prev.startPoint || startPoint,
      duration: prev.duration || duration,
      pace: prev.pace || pace,
      interest: prev.interest || interest,
      transportMode: prev.transportMode || transportMode,
      groupSize: prev.groupSize || groupSize,
      budget: prev.budget || budget,
      selectedStay: prev.selectedStay || selectedStay,
      language
    }));
    setActiveRecommendations(recommendVisit({
      timeAvailable: quizTime,
      companion: quizCompanion,
      primaryVibe: quizVibe,
      language
    }));
  }, [language]);

  // Handle Generate Itinerary
  const handleGenerateJourney = () => {
    const result = generateItinerary({ 
      origin,
      startPoint, 
      duration, 
      pace, 
      interest,
      transportMode,
      groupSize,
      budget,
      selectedStay,
      language 
    });
    setGeneratedItinerary(result);
    setHasGenerated(true);
    setReplanNotice('');
    setTimeout(() => {
      itineraryResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle 1-Click Judge Demo Scenario Preset
  const handleJudgeDemoPreset = () => {
    setOrigin('bagalkote');
    setStartPoint('badami');
    setDuration('1day');
    setPace('balanced');
    setInterest('architecture');
    setTransportMode('car');
    setGroupSize(3);
    setBudget(2500);
    setSelectedStay('none');

    const demoPlan = getJudgeDemoScenario(language);
    setGeneratedItinerary(demoPlan);
    setHasGenerated(true);
    setReplanNotice(
      language === 'kn'
        ? '⭐ ಜಡ್ಜ್ ಡೆಮೊ ಸನ್ನಿವೇಶ ಸಕ್ರಿಯವಾಗಿದೆ: ಬಾಗಲಕೋಟೆ ಪ್ರವೇಶ • 3 ಸದಸ್ಯರ ಕುಟುಂಬ • ಕಾರು • ₹2,500 ಬಜೆಟ್'
        : language === 'hi'
        ? '⭐ जज डेमो प्रीसेट सक्रिय: बागलकोट गेटवे • 3 का परिवार • कार • ₹2,500 बजट'
        : '⭐ Judge Demo Benchmark Active: Bagalkote Gateway • Family of 3 • Private Car • ₹2,500 Target Budget'
    );
    setTimeout(() => {
      itineraryResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle Smart 1-Click Replanning Actions
  const handleSmartReplan = (action) => {
    const replanned = replanItinerary(generatedItinerary, action, { language });
    setGeneratedItinerary(replanned);
    setReplanNotice(replanned.replanNotice);
    setTransportMode(replanned.transportMode);
    setPace(replanned.pace);
    setDuration(replanned.duration);
    setInterest(replanned.interest);
    if (replanned.selectedStay) setSelectedStay(replanned.selectedStay);
  };

  // Handle Reset Planner
  const handleResetPlanner = () => {
    setOrigin('bagalkote');
    setStartPoint('badami');
    setDuration('1day');
    setPace('balanced');
    setInterest('architecture');
    setTransportMode('car');
    setGroupSize(3);
    setBudget(2500);
    setSelectedStay('none');
    setReplanNotice('');
    const defaultResult = generateItinerary({
      origin: 'bagalkote',
      startPoint: 'badami',
      duration: '1day',
      pace: 'balanced',
      interest: 'architecture',
      transportMode: 'car',
      groupSize: 3,
      budget: 2500,
      selectedStay: 'none',
      language
    });
    setGeneratedItinerary(defaultResult);
    setHasGenerated(false);
  };

  // Toggle Stay Selection
  const handleToggleStay = (stayId) => {
    const newStay = selectedStay === stayId ? 'none' : stayId;
    setSelectedStay(newStay);
    const updated = generateItinerary({
      origin,
      startPoint,
      duration,
      pace,
      interest,
      transportMode,
      groupSize,
      budget,
      selectedStay: newStay,
      language
    });
    setGeneratedItinerary(updated);
  };

  // Handle Find Matches (Mode 2)
  const handleFindMatches = () => {
    const results = recommendVisit({
      timeAvailable: quizTime,
      companion: quizCompanion,
      primaryVibe: quizVibe,
      language
    });
    setActiveRecommendations(results);
    setHasSearchedMatches(true);
    setTimeout(() => {
      matchesResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getStartPointLabel = (id) => {
    if (id === 'badami') return language === 'kn' ? 'ಬಾದಾಮಿ (ಗುಹಾಂತರ ದೇಗುಲಗಳು)' : language === 'hi' ? 'बादामी (रॉक-कट गुफाएं)' : 'Badami (Cliff Shrines)';
    if (id === 'pattadakal') return language === 'kn' ? 'ಪಟ್ಟದಕಲ್ಲು (ಪಟ್ಟಾಭಿಷೇಕ ತಾಣ)' : language === 'hi' ? 'पट्टदकल (राज्याभिषेक स्थल)' : 'Pattadakal (Coronation City)';
    return language === 'kn' ? 'ಐಹೊಳೆ (ವಾಸ್ತುಶಿಲ್ಪ ಕಾರ್ಯಾಗಾರ)' : language === 'hi' ? 'ऐहोल (वास्तुकला कार्यशाला)' : 'Aihole (Temple Workshop)';
  };

  return (
    <div className="space-y-8 sm:space-y-10 py-4 sm:py-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300 overflow-x-hidden">
      
      {/* Header */}
      <div className="text-center space-y-3.5 max-w-3xl mx-auto px-2">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F5E8D8] text-[#923C13] border border-[#C88A42]/30 uppercase tracking-wider">
          <span>🧭</span>
          <span>{t('planner_badge', language)}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#231915]">
          Your Chalukyan Heritage Route
        </h1>
        <p className="text-[#5A463C] text-sm sm:text-base md:text-lg leading-relaxed font-sans">
          {t('planner_subtitle', language)}
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex justify-center px-2">
        <div className="inline-flex bg-[#F6ECE8] p-1.5 rounded-2xl border border-[#E4D5CE] shadow-inner max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 min-h-[42px] ${
              activeTab === 'itinerary'
                ? 'bg-[#923C13] text-white shadow-sm font-bold'
                : 'text-[#5A463C] hover:text-[#923C13]'
            }`}
          >
            <span>🗺️</span>
            <span>{t('tab_smart_planner', language)}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recommend')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 min-h-[42px] ${
              activeTab === 'recommend'
                ? 'bg-[#923C13] text-white shadow-sm font-bold'
                : 'text-[#5A463C] hover:text-[#923C13]'
            }`}
          >
            <span>✨</span>
            <span>{t('tab_visit_match', language)}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: INTEGRATED YATRA + HERITAGELENS ITINERARY PLANNER */}
      {activeTab === 'itinerary' && (
        <div className="space-y-8">

          {/* Judge Demo Banner & Quick External App Link */}
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <span className="text-3xl sm:text-4xl">🏆</span>
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center space-x-2">
                  <span>{t('btn_judge_preset', language)}</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded uppercase">
                    Yatra AI Benchmark
                  </span>
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {t('judge_preset_desc', language)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleJudgeDemoPreset}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center space-x-1.5"
              >
                <span>⚡</span>
                <span>Auto-Load Judge Scenario</span>
              </button>
              <a
                href="https://jocular-griffin-4d7a57.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-xl font-medium text-xs shadow-2xs hover:shadow-xs transition-all whitespace-nowrap"
                title="Open deployed Yatra AI external reference"
              >
                {t('external_yatra_btn', language)}
              </a>
            </div>
          </div>
          
          {/* Controls Bar */}
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-heritage-border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-heritage-border/60 pb-3 gap-2">
              <div>
                <h3 className="font-serif font-bold text-heritage-primary text-lg sm:text-xl">
                  {t('config_params_title', language)}
                </h3>
                <p className="text-xs text-stone-500">
                  {t('config_params_desc', language)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetPlanner}
                className="text-xs text-stone-500 hover:text-heritage-primary font-medium flex items-center space-x-1 py-1"
              >
                <span>↺</span>
                <span>{t('btn_reset_defaults', language)}</span>
              </button>
            </div>

            {/* Row 1: Regional Gateways, Transport Mode, Group Size, Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Origin Gateway */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('label_gateway_origin', language)}
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs sm:text-sm font-medium bg-heritage-surface/50 focus:ring-2 focus:ring-heritage-primary/40 focus:outline-none min-h-[42px]"
                >
                  {Object.values(ORIGINS_METADATA).map(org => (
                    <option key={org.id} value={org.id}>
                      {org.icon} {language === 'kn' ? org.name_kn : language === 'hi' ? org.name_hi : org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transport Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('label_transport_mode', language)}
                </label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs sm:text-sm font-medium bg-heritage-surface/50 focus:ring-2 focus:ring-heritage-primary/40 focus:outline-none min-h-[42px]"
                >
                  {Object.values(TRANSPORT_MODES).map(tm => (
                    <option key={tm.id} value={tm.id}>
                      {tm.icon} {language === 'kn' ? tm.name_kn : language === 'hi' ? tm.name_hi : tm.name} (₹{tm.ratePerKm}/km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Travelers / Group Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('label_travelers', language)}
                </label>
                <select
                  value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs sm:text-sm font-medium bg-heritage-surface/50 focus:ring-2 focus:ring-heritage-primary/40 focus:outline-none min-h-[42px]"
                >
                  <option value={1}>1 Solo Explorer</option>
                  <option value={2}>2 Travelers (Duo / Couple)</option>
                  <option value={3}>3 Travelers (Small Family)</option>
                  <option value={4}>4 Travelers (Family of 4)</option>
                  <option value={6}>6+ Travelers (Group Tour)</option>
                </select>
              </div>

              {/* Budget Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('label_budget', language)}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-heritage-border text-xs sm:text-sm font-bold bg-heritage-surface/50 focus:ring-2 focus:ring-heritage-primary/40 focus:outline-none min-h-[42px]"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Starting Site, Duration, Pace, Interest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 border-t border-heritage-border/40">
              
              {/* Start Point */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('label_starting_base', language)}
                </label>
                <select
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs sm:text-sm font-medium bg-heritage-surface/50 focus:ring-2 focus:ring-heritage-primary/40 focus:outline-none min-h-[42px]"
                >
                  <option value="badami">{getStartPointLabel('badami')}</option>
                  <option value="pattadakal">{getStartPointLabel('pattadakal')}</option>
                  <option value="aihole">{getStartPointLabel('aihole')}</option>
                </select>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('label_duration', language)}
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs sm:text-sm font-medium bg-heritage-surface/50 focus:ring-2 focus:ring-heritage-primary/40 focus:outline-none min-h-[42px]"
                >
                  <option value="halfday">{t('opt_halfday', language)}</option>
                  <option value="1day">{t('opt_fullday', language)}</option>
                  <option value="2day">{t('opt_twoday', language)}</option>
                </select>
              </div>

              {/* Pace */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('label_pace', language)}
                </label>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs sm:text-sm font-medium bg-heritage-surface/50 focus:ring-2 focus:ring-heritage-primary/40 focus:outline-none min-h-[42px]"
                >
                  <option value="relaxed">{t('opt_relaxed', language)}</option>
                  <option value="balanced">{t('opt_balanced', language)}</option>
                  <option value="comprehensive">{t('opt_comprehensive', language)}</option>
                </select>
              </div>

              {/* Focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('label_interest', language)}
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border text-xs sm:text-sm font-medium bg-heritage-surface/50 focus:ring-2 focus:ring-heritage-primary/40 focus:outline-none min-h-[42px]"
                >
                  <option value="architecture">{t('opt_architecture', language)}</option>
                  <option value="sculpture">{t('opt_sculptures', language)}</option>
                  <option value="photography">{t('opt_photography', language)}</option>
                  <option value="history">{t('opt_history', language)}</option>
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-heritage-border/60">
              <span className="text-xs text-stone-500 text-center sm:text-left">
                Highway transit rates & entry fees calibrated to official ASI & KSRTC rates.
              </span>
              
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleGenerateJourney}
                  className="w-full sm:w-auto px-8 py-3 bg-heritage-primary hover:bg-heritage-dark text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 min-h-[44px]"
                >
                  <span>✨</span>
                  <span>{t('btn_generate_journey', language)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Plan Container */}
          <div ref={itineraryResultRef} id="itinerary-results" className="scroll-mt-24 space-y-6">
            
            {/* KPI Summary Dashboard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Card 1: Total Cost */}
              <div className="bg-white p-3.5 rounded-xl border border-heritage-border shadow-xs text-center space-y-1">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider block">
                  {t('stat_total_cost', language)}
                </span>
                <span className="text-base sm:text-lg font-bold text-heritage-primary font-mono block">
                  ₹{generatedItinerary.budgetBreakdown.totalCost}
                </span>
                <span className="text-[10px] text-stone-500 font-medium block">
                  ₹{generatedItinerary.budgetBreakdown.costPerPerson}/pax
                </span>
              </div>

              {/* Card 2: Route Distance */}
              <div className="bg-white p-3.5 rounded-xl border border-heritage-border shadow-xs text-center space-y-1">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider block">
                  {t('stat_route_distance', language)}
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-800 font-mono block">
                  {generatedItinerary.totalRouteKm} km
                </span>
                <span className="text-[10px] text-stone-500 font-medium block">
                  Corridor Loop
                </span>
              </div>

              {/* Card 3: Drive Time */}
              <div className="bg-white p-3.5 rounded-xl border border-heritage-border shadow-xs text-center space-y-1">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider block">
                  {t('stat_drive_time', language)}
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-800 font-mono block">
                  {Math.floor(generatedItinerary.totalDriveTimeMin / 60)}h {generatedItinerary.totalDriveTimeMin % 60}m
                </span>
                <span className="text-[10px] text-stone-500 font-medium block capitalize">
                  via {generatedItinerary.transportMode}
                </span>
              </div>

              {/* Card 4: Monuments Visited */}
              <div className="bg-white p-3.5 rounded-xl border border-heritage-border shadow-xs text-center space-y-1">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider block">
                  Monuments
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-800 font-mono block">
                  {generatedItinerary.stops.filter(s => s.monumentId).length} Sites
                </span>
                <span className="text-[10px] text-stone-500 font-medium block">
                  ASI Protected
                </span>
              </div>

              {/* Card 5: Carbon Footprint */}
              <div className="bg-white p-3.5 rounded-xl border border-heritage-border shadow-xs text-center space-y-1">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider block">
                  {t('stat_eco_rating', language)}
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-700 font-mono block">
                  {generatedItinerary.ecoRating.carbonKg} kg
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium inline-block">
                  {generatedItinerary.ecoRating.category} Eco
                </span>
              </div>

              {/* Card 6: AI Score */}
              <div className="bg-white p-3.5 rounded-xl border border-heritage-border shadow-xs text-center space-y-1">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider block">
                  {t('stat_ai_score', language)}
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-600 font-mono block">
                  {generatedItinerary.aiRecommendationScore.score}/100
                </span>
                <span className="text-[10px] text-amber-700 font-medium block">
                  Optimized
                </span>
              </div>
            </div>

            {/* Smart 1-Click Replanning Chips Bar */}
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                  <span>⚡</span>
                  <span>{t('replan_bar_title', language)}</span>
                </span>
                <span className="text-[10px] text-stone-500">
                  Instant recalibration of dwell times, budget, & transit
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'reduce_cost', label: t('replan_reduce_cost', language), color: 'hover:border-emerald-500' },
                  { id: 'shorten_trip', label: t('replan_shorten', language), color: 'hover:border-blue-500' },
                  { id: 'add_food', label: t('replan_food', language), color: 'hover:border-orange-500' },
                  { id: 'add_heritage', label: t('replan_heritage', language), color: 'hover:border-amber-500' },
                  { id: 'add_nature', label: t('replan_nature', language), color: 'hover:border-teal-500' },
                  { id: 'family_friendly', label: t('replan_family', language), color: 'hover:border-purple-500' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleSmartReplan(chip.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-700 shadow-2xs hover:shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Replanning Notice */}
              {replanNotice && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs px-3 py-2 rounded-xl flex items-center justify-between animate-in fade-in">
                  <span className="font-medium">✓ {replanNotice}</span>
                  <button
                    type="button"
                    onClick={() => setReplanNotice('')}
                    className="text-stone-400 hover:text-stone-600 text-sm ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Generated Plan Header */}
            <div className="bg-gradient-to-r from-heritage-primary to-stone-900 text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {language === 'kn' ? 'ನಿಖರ ಪ್ರವಾಸ ಅನುಕ್ರಮ' : language === 'hi' ? 'सटीक यात्रा क्रम' : 'Optimal Sequenced Itinerary'}
                </span>
                {hasGenerated && (
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-medium">
                    {t('custom_journey_ready', language)}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold">
                {generatedItinerary.title}
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                {generatedItinerary.summary}
              </p>
            </div>

            {/* Interactive SVG Route Geometry Map */}
            <RouteMap 
              stops={generatedItinerary.stops}
              activeStopIndex={activeStopIndex}
              onSelectStop={(idx) => setActiveStopIndex(idx)}
              origin={generatedItinerary.origin}
              transportMode={generatedItinerary.transportMode}
              totalKm={generatedItinerary.totalRouteKm}
              language={language}
            />

            {/* Stops Timeline (Enriched with Culinary & Transit Legs) */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-heritage-border before:hidden md:before:block">
              {generatedItinerary.stops.map((stop, index) => {
                const isCulinary = stop.type === 'culinary';
                const isTransit = stop.type === 'transit';
                const isHighlighted = activeStopIndex === index;

                return (
                  <div 
                    key={index} 
                    className={`relative flex flex-col md:flex-row items-start gap-4 sm:gap-6 group transition-all ${
                      isHighlighted ? 'scale-[1.01]' : ''
                    }`}
                  >
                    
                    {/* Timeline Badge */}
                    <div className={`hidden md:flex items-center justify-center w-16 h-16 rounded-2xl border-2 font-bold text-lg shadow-sm z-10 shrink-0 ${
                      isCulinary
                        ? 'bg-amber-50 border-orange-500 text-orange-600'
                        : isTransit
                        ? 'bg-stone-50 border-stone-400 text-stone-500 text-sm'
                        : 'bg-white border-heritage-primary text-heritage-primary'
                    }`}>
                      {isCulinary ? '🍲' : isTransit ? '🛣️' : index + 1}
                    </div>

                    {/* Stop Card */}
                    <Card className={`flex-1 overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow w-full ${
                      isCulinary
                        ? 'border-orange-300 bg-orange-50/20'
                        : isTransit
                        ? 'border-stone-200 bg-stone-50/40'
                        : 'border-heritage-border'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-3">
                        {/* Image */}
                        <div className="h-44 sm:h-52 md:h-full relative overflow-hidden bg-stone-900">
                          <img
                            src={stop.image}
                            alt={stop.monument}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/70 text-white">
                            {stop.time}
                          </span>
                          {isCulinary && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">
                              Culinary Stop
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-4 sm:p-5 md:col-span-2 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold uppercase tracking-wider ${
                                isCulinary ? 'text-orange-700' : 'text-heritage-primary'
                              }`}>
                                {stop.site}
                              </span>
                              <div className="flex items-center space-x-2">
                                {stop.entryFee !== undefined && stop.entryFee > 0 && (
                                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                                    Ticket: ₹{stop.entryFee}/person
                                  </span>
                                )}
                                {stop.costPerPerson && (
                                  <span className="text-[11px] bg-orange-100 text-orange-900 font-semibold px-2 py-0.5 rounded">
                                    ₹{stop.costPerPerson}/thali
                                  </span>
                                )}
                                <span className="text-xs text-stone-500 font-mono">
                                  ~{stop.durationMin} mins
                                </span>
                              </div>
                            </div>

                            <h3 className="font-serif text-lg sm:text-xl font-bold text-heritage-text">
                              {stop.monument}
                            </h3>
                            
                            <div className="space-y-1.5 pt-1 text-xs">
                              <div>
                                <strong className="text-heritage-primary">{t('why_this_order', language)}: </strong>
                                <span className="text-heritage-textSecondary">{stop.whyThisOrder}</span>
                              </div>
                              <div>
                                <strong className={isCulinary ? 'text-orange-700' : 'text-emerald-700'}>
                                  {isCulinary ? 'Culinary Highlights: ' : `${t('what_to_observe', language)}: `}
                                </strong>
                                <span className="text-stone-700">{stop.keyObservation}</span>
                              </div>
                            </div>
                          </div>

                          {/* Interpret Link */}
                          {stop.monumentId && (
                            <div className="pt-2 border-t border-heritage-border/50 flex justify-end">
                              <button
                                type="button"
                                onClick={() => onSelectMonument(
                                  stop.monumentId.includes('pattadakal') ? 'pattadakal' :
                                  stop.monumentId.includes('aihole') ? 'aihole' : 'badami',
                                  stop.monumentId
                                )}
                                className="text-xs font-bold text-heritage-primary hover:text-heritage-dark flex items-center space-x-1.5 py-1.5 min-h-[36px]"
                              >
                                <span>{t('btn_open_guide', language)}</span>
                                <span>→</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Transparent Multi-Item Budget Engine Card */}
            <div className="bg-white border border-heritage-border rounded-2xl p-5 sm:p-6 md:p-8 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-heritage-border/60 pb-3 gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="font-serif font-bold text-heritage-primary text-lg sm:text-xl">
                      {t('budget_card_title', language)}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Multi-factor deterministic cost ledger based on official ASI rates, transit mode, & meals
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    generatedItinerary.budgetBreakdown.isUnderBudget
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {generatedItinerary.budgetBreakdown.isUnderBudget ? '✓ Within Budget' : 'Budget Extended'}
                  </span>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-stone-700">
                  <span>Total Cost: ₹{generatedItinerary.budgetBreakdown.totalCost}</span>
                  <span>Target Budget: ₹{generatedItinerary.budgetBreakdown.userBudget}</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      generatedItinerary.budgetBreakdown.isUnderBudget ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (generatedItinerary.budgetBreakdown.totalCost / generatedItinerary.budgetBreakdown.userBudget) * 100)}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>Per Person: ₹{generatedItinerary.budgetBreakdown.costPerPerson} ({generatedItinerary.groupSize} travelers)</span>
                  <span className="font-semibold text-emerald-700">
                    {generatedItinerary.budgetBreakdown.isUnderBudget 
                      ? `${t('budget_remaining', language)}: ₹${generatedItinerary.budgetBreakdown.balance}` 
                      : `${t('budget_over', language)}: ₹${Math.abs(generatedItinerary.budgetBreakdown.balance)}`}
                  </span>
                </div>
              </div>

              {/* 4 Itemized Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="bg-heritage-surface/60 p-3.5 rounded-xl border border-heritage-border/70 space-y-1">
                  <span className="text-xs font-bold text-stone-700 block">🏛️ {t('budget_breakdown_entry', language)}</span>
                  <span className="text-base font-bold text-heritage-primary font-mono block">₹{generatedItinerary.budgetBreakdown.monumentEntryCost}</span>
                  <span className="text-[10px] text-stone-500 block">₹{generatedItinerary.budgetBreakdown.monumentEntryPerPerson}/person ASI tickets</span>
                </div>

                <div className="bg-heritage-surface/60 p-3.5 rounded-xl border border-heritage-border/70 space-y-1">
                  <span className="text-xs font-bold text-stone-700 block">🍲 {t('budget_breakdown_food', language)}</span>
                  <span className="text-base font-bold text-heritage-primary font-mono block">₹{generatedItinerary.budgetBreakdown.foodCost}</span>
                  <span className="text-[10px] text-stone-500 block">Jolada Rotti thali & Badami snacks</span>
                </div>

                <div className="bg-heritage-surface/60 p-3.5 rounded-xl border border-heritage-border/70 space-y-1">
                  <span className="text-xs font-bold text-stone-700 block">🚗 {t('budget_breakdown_transport', language)}</span>
                  <span className="text-base font-bold text-heritage-primary font-mono block">₹{generatedItinerary.budgetBreakdown.transportCost}</span>
                  <span className="text-[10px] text-stone-500 block">{generatedItinerary.totalRouteKm} km via {generatedItinerary.transportMode}</span>
                </div>

                <div className="bg-heritage-surface/60 p-3.5 rounded-xl border border-heritage-border/70 space-y-1">
                  <span className="text-xs font-bold text-stone-700 block">🏨 {t('budget_breakdown_stay', language)}</span>
                  <span className="text-base font-bold text-heritage-primary font-mono block">₹{generatedItinerary.budgetBreakdown.stayCost}</span>
                  <span className="text-[10px] text-stone-500 block">{generatedItinerary.selectedStay !== 'none' ? 'Verified Stay Added' : 'Optional day trip'}</span>
                </div>
              </div>
            </div>

            {/* Verified Heritage Accommodations Section */}
            <div className="bg-white border border-heritage-border rounded-2xl p-5 sm:p-6 md:p-8 space-y-5 shadow-sm">
              <div className="flex items-center space-x-2.5 border-b border-heritage-border/60 pb-3">
                <span className="text-2xl">🏨</span>
                <div>
                  <h3 className="font-serif font-bold text-heritage-primary text-lg sm:text-xl">
                    {t('stays_section_title', language)}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Curated authentic stays in Badami and the Malaprabha countryside with transparent nightly tariffs
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedItinerary.recommendedStays.map(stay => {
                  const isSelected = selectedStay === stay.id;
                  return (
                    <div 
                      key={stay.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20' 
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            {stay.type}
                          </span>
                          <span className="text-xs font-bold text-stone-800">
                            ★ {stay.rating}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-stone-900 text-sm">
                          {language === 'kn' ? stay.name_kn : language === 'hi' ? stay.name_hi : stay.name}
                        </h4>

                        <span className="text-base font-bold text-heritage-primary font-mono block">
                          ₹{stay.pricePerNight} <span className="text-xs text-stone-500 font-sans font-normal">/ night</span>
                        </span>

                        <p className="text-[11px] text-stone-600">
                          📍 {stay.location}
                        </p>

                        <div className="pt-1 flex flex-wrap gap-1">
                          {stay.features.slice(0, 2).map((feat, fIdx) => (
                            <span key={fIdx} className="text-[9px] bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-600">
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStay(stay.id)}
                          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {isSelected ? t('btn_remove_stay', language) : t('btn_select_stay', language)}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sustainability & Responsible Tourism Card */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 sm:p-6 md:p-8 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌿</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-emerald-950">
                  {t('sustainable_banner_title', language)}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {generatedItinerary.sustainabilityTips.map((tip, i) => {
                  const [heading, desc] = tip.split(': ');
                  return (
                    <div key={i} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                        {heading}
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: PERSONALIZED VISIT (PLAN MY VISIT QUIZ - 100% PRESERVED) */}
      {activeTab === 'recommend' && (
        <div className="space-y-8">
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-heritage-border shadow-sm space-y-6">
            <div className="border-b border-heritage-border/60 pb-3">
              <h3 className="font-serif font-bold text-heritage-primary text-lg sm:text-xl">
                {t('quiz_match_title', language)}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('quiz_match_desc', language)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Question 1 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('q1_title', language)}
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'quick', label: t('q1_opt_quick', language) },
                    { id: 'fullday', label: t('q1_opt_full', language) },
                    { id: 'multiday', label: t('q1_opt_multi', language) }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setQuizTime(opt.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all min-h-[42px] ${
                        quizTime === opt.id
                          ? 'bg-heritage-primary text-white border-heritage-primary shadow-xs font-semibold'
                          : 'bg-heritage-surface border-heritage-border text-heritage-text hover:bg-stone-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('q2_title', language)}
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'solo', label: t('q2_opt_solo', language) },
                    { id: 'family', label: t('q2_opt_family', language) },
                    { id: 'enthusiast', label: t('q2_opt_enthusiast', language) }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setQuizCompanion(opt.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all min-h-[42px] ${
                        quizCompanion === opt.id
                          ? 'bg-heritage-primary text-white border-heritage-primary shadow-xs font-semibold'
                          : 'bg-heritage-surface border-heritage-border text-heritage-text hover:bg-stone-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-heritage-textMuted uppercase tracking-wider block">
                  {t('q3_title', language)}
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'architecture', label: t('q3_opt_arch', language) },
                    { id: 'sculptures', label: t('q3_opt_sculpt', language) },
                    { id: 'scenic', label: t('q3_opt_scenic', language) }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setQuizVibe(opt.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all min-h-[42px] ${
                        quizVibe === opt.id
                          ? 'bg-heritage-primary text-white border-heritage-primary shadow-xs font-semibold'
                          : 'bg-heritage-surface border-heritage-border text-heritage-text hover:bg-stone-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Find Matches CTA */}
            <div className="pt-3 border-t border-heritage-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                Click Find My Matches to rank all 9 monuments for your selected trip profile.
              </span>
              <button
                type="button"
                onClick={handleFindMatches}
                className="w-full sm:w-auto px-8 py-3 bg-heritage-primary hover:bg-heritage-dark text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <span>🔍</span>
                <span>{t('btn_find_matches', language)}</span>
              </button>
            </div>
          </div>

          {/* Scored Recommendations */}
          <div ref={matchesResultRef} id="match-results" className="scroll-mt-24 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-heritage-primary">
                  {t('tailored_matches_title', language)} ({activeRecommendations.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Ranked by suitability for your profile: <span className="font-semibold text-stone-700 capitalize">{quizCompanion} • {quizTime} • {quizVibe}</span>
                </p>
              </div>
              {hasSearchedMatches && (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold border border-emerald-300 self-start sm:self-center">
                  ✓ Matches Updated
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRecommendations.map((item, index) => (
                <Card
                  key={item.id}
                  className="overflow-hidden flex flex-col justify-between border-heritage-border hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="aspect-[16/10] relative overflow-hidden bg-stone-900">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400 text-stone-950">
                        Rank #{index + 1}
                      </span>
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white capitalize">
                        {item.site}
                      </span>
                      <h4 className="absolute bottom-3 left-3 right-3 font-serif font-bold text-white text-base drop-shadow">
                        {item.name}
                      </h4>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-heritage-surface text-heritage-textSecondary border border-heritage-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed bg-heritage-accentLight/30 p-2.5 rounded-lg border border-heritage-accent/20">
                        <strong className="text-heritage-primary">{t('why_matches_label', language)}: </strong>{item.matchReason}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => onSelectMonument(item.site.toLowerCase(), item.id)}
                      className="w-full py-2.5 bg-heritage-primary hover:bg-heritage-dark text-white rounded-xl text-xs font-semibold transition-colors shadow-xs min-h-[40px]"
                    >
                      Interpret & Narration →
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
