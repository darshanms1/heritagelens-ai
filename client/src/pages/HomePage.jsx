import { useState } from 'react';
import { ImageUpload } from '../components/heritage/ImageUpload';
import { ManualSelector } from '../components/heritage/ManualSelector';
import { DemoMode } from '../components/demo/DemoMode';
import { Card } from '../components/ui/Card';
import { t } from '../utils/translations';

export const HomePage = ({ 
  onImageUpload, 
  onManualSelect, 
  onDemoSelect, 
  onNavigate,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'demo' | 'catalog'

  const siteData = [
    {
      id: 'pattadakal',
      name: language === 'kn' ? 'ಪಟ್ಟದಕಲ್ಲು' : language === 'hi' ? 'पट्टदकल' : 'Pattadakal',
      chapter: language === 'kn' ? 'ಅಧ್ಯಾಯ ೧ : ರಾಜಮನೆತನದ ಪರಂಪರೆ' : language === 'hi' ? 'अध्याय १ : शाही विरासत' : 'Chapter I: The Royal Legacy',
      badge: language === 'kn' ? 'ಯುನೆಸ್ಕೋ ವಿಶ್ವ ಪರಂಪರೆಯ ತಾಣ' : language === 'hi' ? 'यूनेस्को विश्व धरोहर स्थल' : 'UNESCO World Heritage Site',
      badgeColor: 'bg-[#C88A42] text-[#231915] border border-[#7E5700]/30',
      image: '/monument-images/site_pattadakal.jpg',
      period: '540–757 CE • 7th–8th Century',
      style: 'Nagara & Dravida Confluence (Vesara Prototype)',
      desc: language === 'kn' 
        ? 'ರಾಜಮನೆತನದ ಪಟ್ಟಾಭಿಷೇಕದ ರಾಜಧಾನಿ; ಉತ್ತರ ಭಾರತದ ರೇಖಾ-ನಾಗರ ಮತ್ತು ದಕ್ಷಿಣದ ದ್ರಾವಿಡ ವಿಮಾನ ಶೈಲಿಗಳು ಒಟ್ಟಿಗೆ ಬೆರೆತಿರುವ 10 ಪ್ರಮುಖ ದೇವಾಲಯಗಳ ತಾಣ.'
        : language === 'hi'
        ? 'शाही राज्याभिषेक राजधानी जहाँ उत्तर भारतीय नागर और दक्षिण भारतीय द्रविड़ स्थापत्य शैलियाँ अगल-बगल विकसित हुईं।'
        : 'The sacred coronation capital featuring 10 monumental temples where northern Nagara spires and southern Dravida vimanas converge in harmonious synthesis.'
    },
    {
      id: 'badami',
      name: language === 'kn' ? 'ಬಾದಾಮಿ' : language === 'hi' ? 'बादामी' : 'Badami',
      chapter: language === 'kn' ? 'ಅಧ್ಯಾಯ ೨ : ಶಿಲಾ ಗುಹಾಂತರ ವಿಸ್ಮಯ' : language === 'hi' ? 'अध्याय २ : रॉक-कट गुफा चमत्कार' : 'Chapter II: The Rock-Cut Marvels',
      badge: language === 'kn' ? 'ಭಾರತದ ತಾತ್ಕಾಲಿಕ ಪಟ್ಟಿಯಲ್ಲಿದೆ' : language === 'hi' ? 'भारत की संभावित सूची में' : "On UNESCO Tentative List",
      badgeColor: 'bg-[#923C13] text-white border border-white/20',
      image: '/monument-images/site_badami.jpg',
      period: '543–753 CE • 6th–8th Century',
      style: 'Monolithic Rock-Cut Architecture',
      desc: language === 'kn'
        ? 'ಪ್ರಾಚೀನ ವಾತಾಪಿ, ಕೆಂಪು ಮರಳುಗಲ್ಲಿನ ಬೃಹತ್ ಕಡಿದಾದ ಬಂಡೆಗಳಲ್ಲಿ ಕೆತ್ತಲಾದ ಏಕಶಿಲಾ ಗುಹಾಂತರ ದೇವಾಲಯಗಳು ಹಾಗೂ ಪವಿತ್ರ ಅಗಸ್ತ್ಯ ತೀರ್ಥದ ಜಲಾಶಯ ತೀರ.'
        : language === 'hi'
        ? 'प्राचीन वातापी, लाल बलुआ पत्थर की खड़ी चट्टानों में तराशे गए भव्य अखंड रॉक-कट गुफा मंदिरों और पवित्र अगस्त्य तीर्थ के लिए प्रसिद्ध।'
        : 'Ancient Vatapi, the cliff-fortified capital renowned for four monumental monolithic cave temples masterfully excavated into red sandstone cliffs above Agastya Lake.'
    },
    {
      id: 'aihole',
      name: language === 'kn' ? 'ಐಹೊಳೆ' : language === 'hi' ? 'ऐहोल' : 'Aihole',
      chapter: language === 'kn' ? 'ಅಧ್ಯಾಯ ೩ : ಭಾರತೀಯ ವಾಸ್ತುಶಿಲ್ಪದ ತೊಟ್ಟಿಲು' : language === 'hi' ? 'अध्याय ३ : भारतीय वास्तुकला की प्रयोगशाला' : 'Chapter III: The Laboratory of Architecture',
      badge: language === 'kn' ? 'ಭಾರತೀಯ ವಾಸ್ತುಶಿಲ್ಪದ ತೊಟ್ಟಿಲು' : language === 'hi' ? 'भारतीय वास्तुकला का पालना' : 'Cradle of Indian Architecture',
      badgeColor: 'bg-[#2C5D67] text-white border border-white/20',
      image: '/monument-images/site_aihole.jpg',
      period: '450–1200 CE • 5th–12th Century',
      style: 'Experimental Vesara Prototypes',
      desc: language === 'kn'
        ? '120 ಕ್ಕೂ ಹೆಚ್ಚು ಶಿಲಾ ದೇವಾಲಯಗಳ ಬಯಲು ಪ್ರಯೋಗಶಾಲೆ; ಅಪೂರ್ವ ಗಜಪೃಷ್ಠಾಕಾರ (ಅಪ್ಸಿಡಲ್) ದುರ್ಗಾ ದೇವಾಲಯ ಮತ್ತು ಆರಂಭಿಕ ಶಿಖರಗಳ ಮೂಲನೆಲೆ.'
        : language === 'hi'
        ? '120 से अधिक पत्थर के मंदिरों की खुली कार्यशाला जहाँ प्राचीन वास्तुकारों ने अभिनव गजपृष्ठाकार दुर्गा मंदिर और गर्भगृह डिज़ाइनों का सफल प्रयोग किया।'
        : 'An open-air architectural laboratory of over 120 stone temples where Early Chalukyan master-craftsmen innovated apsidal sanctums, carved pillared mandapas, and curvilinear towers.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-2 sm:py-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* 1. HERO SECTION — High Impact Heritage First Impression */}
      <section className="relative rounded-3xl sm:rounded-4xl overflow-hidden border border-[#E8DDD0] shadow-[0_20px_50px_-20px_rgba(146,60,19,0.3)] bg-[#1A110D] text-white">
        {/* Background Image with Authentic Real Pattadakal Photography & Film Overlays */}
        <div className="absolute inset-0">
          <img
            src="/monument-images/site_pattadakal.jpg"
            alt="Pattadakal UNESCO World Heritage Complex at Sunset"
            className="w-full h-full object-cover opacity-45 scale-102 transition-transform duration-1000 ease-out"
          />
          {/* Subtle Stone Texture & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#150D0A] via-[#1A110D]/75 to-[#150D0A]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Content Positioning */}
        <div className="relative z-10 px-5 py-14 sm:py-20 md:py-24 md:px-12 max-w-4xl mx-auto text-center space-y-7">
          
          {/* Official Archaeological Survey Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#2D1B13]/85 backdrop-blur-md border border-[#C88A42]/50 text-[#F5E8D8] px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#E5A84F] animate-pulse" />
            <span>ASI Archaeological Survey Grounded • 540–757 CE</span>
          </div>

          {/* Main Title & Brand Identity */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.08] drop-shadow-md">
              HeritageLens <span className="text-[#E5A84F] font-serif italic">AI</span>
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl font-serif text-[#F5E8D8] italic tracking-wide">
              "Ask the Monument."
            </p>
          </div>

          {/* Core Visual Promise: Point your camera at history */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-block px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs text-[#E5A84F] font-mono text-xs sm:text-sm font-semibold tracking-wide border border-white/10">
              Point your camera at history. Let AI explain it.
            </div>
            
            <p className="text-[#D6C5B8] text-sm sm:text-base md:text-lg leading-relaxed font-sans">
              Discover the red sandstone temples, rock-cut cave sanctuaries, and architectural prototypes of 
              <strong className="text-white font-semibold"> Badami, Pattadakal, and Aihole</strong>. 
              Grounded strictly in Archaeological Survey of India (ASI) verified records.
            </p>
          </div>

          {/* Primary CTA Hierarchy */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Primary Dominant CTA */}
            <button
              onClick={() => {
                setActiveTab('upload');
                document.getElementById('ai-station')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-4 bg-gradient-to-r from-[#C88A42] to-[#923C13] hover:from-[#D49852] hover:to-[#A64516] text-white font-bold rounded-2xl text-sm sm:text-base shadow-[0_6px_25px_rgba(200,138,66,0.45)] hover:shadow-[0_8px_30px_rgba(200,138,66,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2.5 min-h-[48px] border border-[#E5B54F]/40"
            >
              <span className="text-lg">📷</span>
              <span className="tracking-wide">{t('btn_identify_ai', language)}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-sans font-medium">Free</span>
            </button>

            {/* Secondary CTA: Discover */}
            <button
              onClick={() => onNavigate('discover')}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-[#FAF5F0] border border-white/25 hover:border-white/40 font-semibold rounded-2xl text-sm sm:text-base transition-all duration-200 flex items-center space-x-2 min-h-[48px] backdrop-blur-xs"
            >
              <span>🏛️</span>
              <span>{t('btn_discover_all', language)}</span>
            </button>

            {/* Secondary CTA: Plan Journey */}
            <button
              onClick={() => onNavigate('plan')}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-[#FAF5F0] border border-white/25 hover:border-white/40 font-semibold rounded-2xl text-sm sm:text-base transition-all duration-200 flex items-center space-x-2 min-h-[48px] backdrop-blur-xs"
            >
              <span>🗺️</span>
              <span>{t('btn_plan_journey', language)}</span>
            </button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-[#BFAEA2]">
            <div className="flex items-center space-x-1.5">
              <span className="text-[#E5A84F]">✓</span>
              <span>Sub-second Hash & AI Vision</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[#E5A84F]">✓</span>
              <span>Zero Hallucination Tolerance</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[#E5A84F]">✓</span>
              <span>Audio Narration in EN • KN • HI</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE AI IDENTIFICATION EXPERIENCE — Interactive Scanner & Demo Station */}
      <section id="ai-station" className="max-w-4xl mx-auto space-y-6 scroll-mt-24">
        
        {/* Section Header with Process Walkthrough */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F5E8D8] text-[#923C13] border border-[#C88A42]/30">
            <span>⚡</span>
            <span>Multimodal Vision Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#231915]">
            Instant Visual Identification
          </h2>
          <p className="text-xs sm:text-sm text-[#5A463C] max-w-xl mx-auto leading-relaxed">
            Upload your on-site photo or choose a curated sample to test our multi-layer recognition pipeline with zero cloud lock-in.
          </p>

          {/* 4-Step Visual Flow Representation */}
          <div className="hidden sm:grid grid-cols-4 gap-2 pt-2 max-w-2xl mx-auto text-left">
            {[
              { step: '01', title: 'Upload / Camera', sub: 'Instant Normalization' },
              { step: '02', title: 'AI Identification', sub: 'Hash & Vision VLM' },
              { step: '03', title: 'Grounded Story', sub: 'ASI Verified Records' },
              { step: '04', title: 'Ask the Monument', sub: 'Conversational Voice' }
            ].map((s, idx) => (
              <div key={idx} className="bg-[#FAF5F0] border border-[#E8DDD0] rounded-xl p-2.5">
                <span className="text-[10px] font-mono font-bold text-[#923C13]">{s.step}</span>
                <p className="text-xs font-bold text-[#231915] mt-0.5">{s.title}</p>
                <p className="text-[10px] text-[#7A6A60]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex justify-center px-2">
          <div className="inline-flex bg-[#F6ECE8] p-1.5 rounded-2xl border border-[#E4D5CE] shadow-inner max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'upload'
                  ? 'bg-[#923C13] text-white shadow-sm font-bold'
                  : 'text-[#5A463C] hover:text-[#923C13]'
              }`}
            >
              <span>📷</span>
              <span>{t('tab_live_upload', language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'demo'
                  ? 'bg-[#923C13] text-white shadow-sm font-bold'
                  : 'text-[#5A463C] hover:text-[#923C13]'
              }`}
            >
              <span>🎯</span>
              <span>{t('tab_demo_mode', language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'catalog'
                  ? 'bg-[#923C13] text-white shadow-sm font-bold'
                  : 'text-[#5A463C] hover:text-[#923C13]'
              }`}
            >
              <span>🏛️</span>
              <span>{t('tab_select_monument', language)}</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="bg-[#FFFDFB] p-5 sm:p-7 md:p-9 rounded-3xl border border-[#E8DDD0] shadow-[0_8px_30px_rgba(146,60,19,0.06)]">
          {activeTab === 'upload' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#923C13]">
                  {t('upload_title', language)}
                </h3>
                <p className="text-xs text-[#7A6A60]">
                  Grounded with Exact Hash + Perceptual Match + Groq Qwen 3.8-27B & Gemini Vision
                </p>
              </div>
              <ImageUpload onUpload={onImageUpload} />
            </div>
          )}

          {activeTab === 'demo' && (
            <DemoMode onSelect={onDemoSelect} language={language} />
          )}

          {activeTab === 'catalog' && (
            <ManualSelector onSelect={onManualSelect} language={language} />
          )}
        </div>
      </section>

      {/* 3. SIGNATURE BRAND FEATURE: "ASK THE MONUMENT" */}
      <section className="bg-gradient-to-br from-[#FFF8F6] via-[#FAF3EC] to-[#F5ECE5] rounded-3xl sm:rounded-4xl p-6 sm:p-10 md:p-12 border border-[#E8DDD0] relative overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand Story */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-[#923C13]/10 border border-[#923C13]/25 text-[#923C13] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>🏛️</span>
              <span>Signature Conversational Feature</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#231915] leading-tight">
              You are talking to the history in front of you.
            </h2>
            
            <p className="text-sm sm:text-base text-[#5A463C] leading-relaxed">
              Unlike generic chatbot interfaces, <strong className="text-[#231915] font-semibold">"Ask the Monument"</strong> is 
              modeled after premier museum audio-guides and archaeological interpreters. Ask about sculptural iconography, 
              construction engineering, dynastic inscriptions, or mythological narratives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-2xl border border-[#E8DDD0] space-y-1">
                <span className="text-xs font-bold text-[#923C13]">✓ Evidence Grounded</span>
                <p className="text-xs text-[#5A463C]">Answers drawn strictly from ASI archaeological survey corpora.</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-[#E8DDD0] space-y-1">
                <span className="text-xs font-bold text-[#7E5700]">✓ Trilingual Audio</span>
                <p className="text-xs text-[#5A463C]">Listen hands-free in English, Kannada (ಕನ್ನಡ), or Hindi (हिन्दी).</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('demo');
                  document.getElementById('ai-station')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 bg-[#923C13] hover:bg-[#6B2A0A] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs inline-flex items-center space-x-2"
              >
                <span>💬</span>
                <span>Try "Ask the Monument" via Demo</span>
              </button>
            </div>
          </div>

          {/* Right Column: Simulated Museum Audio/Chat Preview */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E8DDD0] shadow-md space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD0]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#923C13] text-white flex items-center justify-center text-sm font-serif font-bold">
                  B1
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#231915]">Badami Cave 1 Interpreter</h4>
                  <p className="text-[10px] text-[#7A6A60]">578 CE • Shaivite Monolith</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Active Guide
              </span>
            </div>

            {/* Question Bubble */}
            <div className="flex justify-end">
              <div className="bg-[#923C13] text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] font-medium shadow-2xs">
                "Why does the Nataraja carving have 18 arms?"
              </div>
            </div>

            {/* Answer Bubble */}
            <div className="flex justify-start">
              <div className="bg-[#FAF5F0] border border-[#E8DDD0] text-xs text-[#231915] p-3.5 rounded-2xl rounded-tl-none max-w-[92%] space-y-1.5 shadow-2xs">
                <p className="leading-relaxed">
                  The 18 arms depict 81 Bharatanatyam mudras. Depending on how you pair the arms, the posture dynamically shifts between peaceful cosmic rhythm and fierce destruction.
                </p>
                <div className="pt-1.5 border-t border-[#E8DDD0]/80 flex items-center justify-between text-[10px] text-[#7E5700] font-semibold">
                  <span>✓ ASI Epigraphical Record No. 42</span>
                  <span>🔊 Voice Narration Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE 3 REGIONAL CHAPTERS: PATTADAKAL • BADAMI • AIHOLE */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#923C13] bg-[#F5E8D8] px-3.5 py-1 rounded-full border border-[#C88A42]/30">
            {t('clusters_badge', language)}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#231915]">
            Three Chapters of One Sacred Journey
          </h2>
          <p className="text-[#5A463C] text-xs sm:text-sm md:text-base leading-relaxed">
            {t('clusters_desc', language)}
          </p>
        </div>

        {/* 3 Storytelling Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {siteData.map((site) => (
            <Card
              key={site.id}
              className="overflow-hidden border-[#E8DDD0] group flex flex-col justify-between hover:shadow-[0_12px_35px_rgba(146,60,19,0.12)] transition-all duration-300 bg-white rounded-3xl"
            >
              <div>
                {/* Photo with Chapter Overlay */}
                <div className="aspect-[16/11] relative overflow-hidden bg-stone-900">
                  <img
                    src={site.image}
                    alt={site.name}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A110D] via-[#1A110D]/30 to-transparent" />
                  
                  {/* Badge */}
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${site.badgeColor}`}>
                    {site.badge}
                  </span>

                  {/* Chapter title overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                    <p className="text-[11px] font-mono text-[#F5E8D8] uppercase tracking-wider font-semibold">
                      {site.chapter}
                    </p>
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                      {site.name}
                    </h3>
                    <p className="text-xs text-white/80">
                      {site.period}
                    </p>
                  </div>
                </div>

                {/* Body Specs */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="text-[11px] font-semibold text-[#7E5700] uppercase tracking-wide">
                    Style: {site.style}
                  </div>
                  <p className="text-xs sm:text-sm text-[#5A463C] leading-relaxed">
                    {site.desc}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 sm:p-6 pt-0">
                <button
                  type="button"
                  onClick={() => onNavigate('discover', site.id)}
                  className="w-full py-3 bg-[#FAF5F0] hover:bg-[#923C13] hover:text-white text-[#231915] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs min-h-[42px] border border-[#E8DDD0] hover:border-[#923C13] flex items-center justify-center space-x-1.5"
                >
                  <span>{t('btn_explore_cluster', language, { site: site.name })}</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. VISITOR STORYTELLING JOURNEY — 6-Step Visual Workflow */}
      <section className="bg-[#FAF5F0] rounded-3xl p-6 sm:p-8 md:p-12 border border-[#E8DDD0] space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#923C13]">
            {t('why_badge', language)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#231915]">
            Engineered Specifically for Cultural Heritage
          </h2>
          <p className="text-xs sm:text-sm text-[#5A463C]">
            Combining edge-first visual matching, zero-hallucination grounding, and intelligent route synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { 
              icon: '🔍', 
              title: t('why_f1_title', language), 
              desc: t('why_f1_desc', language),
              tag: 'ASI Grounded'
            },
            { 
              icon: '⚡', 
              title: t('why_f2_title', language), 
              desc: t('why_f2_desc', language),
              tag: 'Dual VLM Engine'
            },
            { 
              icon: '🌐', 
              title: t('why_f3_title', language), 
              desc: t('why_f3_desc', language),
              tag: 'Trilingual UI'
            },
            { 
              icon: '🔊', 
              title: t('why_f4_title', language), 
              desc: t('why_f4_desc', language),
              tag: 'Audio Synthesis'
            }
          ].map((f, i) => (
            <div key={i} className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DDD0] space-y-2.5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{f.icon}</span>
                <span className="text-[10px] font-mono font-bold bg-[#F5E8D8] text-[#7E5700] px-2 py-0.5 rounded-full">
                  {f.tag}
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-[#231915]">
                {f.title}
              </h3>
              <p className="text-xs text-[#5A463C] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TRAVEL SMART & YATRA JOURNEY ROUTE BANNER */}
      <section className="bg-gradient-to-r from-[#1C3B42] via-[#244C55] to-[#1A110D] text-white rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-[#2C5D67]/40">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            <span>🧭</span>
            <span>{t('eco_badge', language)}</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold">
            Plan Your Sustainable Heritage Route
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Generate optimal 1-day or 2-day itineraries balancing peak afternoon heat, walking distances, and culinary stops across Bagalkot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('plan')}
            className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2 min-h-[44px]"
          >
            <span>🗺️</span>
            <span>{t('btn_view_itineraries', language)}</span>
          </button>
        </div>
      </section>

      {/* 7. DIGITAL PASSPORT CALLOUT */}
      <section className="border border-[#E8DDD0] rounded-3xl p-6 sm:p-8 bg-white text-center space-y-4">
        <div className="inline-block text-3xl">📜</div>
        <div className="max-w-xl mx-auto space-y-1">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#231915]">
            Chalukyan Heritage Passport & ASI Quiz
          </h3>
          <p className="text-xs sm:text-sm text-[#5A463C]">
            Collect digital archaeological seals at each monument you explore, test your knowledge against official ASI questions, and earn the Curator of Vatapi badge.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('passport')}
          className="px-6 py-2.5 bg-[#FAF5F0] hover:bg-[#923C13] hover:text-white text-[#923C13] border border-[#E8DDD0] hover:border-[#923C13] rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center space-x-2"
        >
          <span>🎖️</span>
          <span>View My Heritage Passport</span>
        </button>
      </section>

    </div>
  );
};
