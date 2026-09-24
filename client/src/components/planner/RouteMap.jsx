import { useState } from 'react';

/**
 * RouteMap.jsx
 * Interactive SVG Route Geometry & Corridor Map for the Bagalkot Heritage Circuit.
 * Depicts Bagalkote gateway, Badami rock-cut caves, UNESCO Pattadakal, and Aihole,
 * along with the winding Malaprabha river, highway connections, and active itinerary stops.
 */
export const RouteMap = ({ 
  stops = [], 
  activeStopIndex = null, 
  onSelectStop = null, 
  origin = 'bagalkote',
  transportMode = 'car',
  totalKm = 0,
  language = 'en'
}) => {
  const [hoveredWaypoint, setHoveredWaypoint] = useState(null);
  const [showCulinaryPins, setShowCulinaryPins] = useState(true);

  // Key circuit waypoints with map coordinates
  const WAYPOINTS = [
    {
      id: 'bagalkote',
      name: language === 'kn' ? 'ಬಾಗಲಕೋಟೆ' : language === 'hi' ? 'बागलकोट' : 'Bagalkote',
      subtitle: language === 'kn' ? 'ಪ್ರವೇಶ ನಗರ' : language === 'hi' ? 'प्रवेश द्वार शहर' : 'Gateway City',
      x: 340,
      y: 75,
      type: 'gateway',
      icon: '🏙️'
    },
    {
      id: 'badami',
      name: language === 'kn' ? 'ಬಾದಾಮಿ' : language === 'hi' ? 'बादामी' : 'Badami',
      subtitle: language === 'kn' ? 'ಗುಹಾಂತರ ದೇಗುಲಗಳು' : language === 'hi' ? 'रॉक-कट गुफाएं' : 'Cave Shrines & Fort',
      x: 190,
      y: 310,
      type: 'monument',
      icon: '🏛️'
    },
    {
      id: 'pattadakal',
      name: language === 'kn' ? 'ಪಟ್ಟದಕಲ್ಲು' : language === 'hi' ? 'पट्टदकल' : 'Pattadakal',
      subtitle: language === 'kn' ? 'ಯುನೆಸ್ಕೋ ವಿಶ್ವ ಪರಂಪರೆ' : language === 'hi' ? 'यूनेस्को विश्व धरोहर' : 'UNESCO World Heritage',
      x: 470,
      y: 285,
      type: 'unesco',
      icon: '👑'
    },
    {
      id: 'aihole',
      name: language === 'kn' ? 'ಐಹೊಳೆ' : language === 'hi' ? 'ऐहोल' : 'Aihole',
      subtitle: language === 'kn' ? 'ವಾಸ್ತುಶಿಲ್ಪ ತೊಟ್ಟಿಲು' : language === 'hi' ? 'वास्तुकला का पालना' : 'Temple Cradle (120+ Temples)',
      x: 640,
      y: 195,
      type: 'monument',
      icon: '🛕'
    }
  ];

  // Map active stops to locations
  const mappedStops = stops.map((stop, idx) => {
    let x = 400;
    let y = 200;
    const isCulinary = stop.type === 'culinary';
    
    if (stop.site?.toLowerCase().includes('badami') || stop.monument?.toLowerCase().includes('badami') || stop.culinaryId === 'badami_girmit') {
      x = isCulinary ? 230 : 190 + (idx % 2 === 0 ? -15 : 15);
      y = isCulinary ? 335 : 310 + (idx * 5 - 10);
    } else if (stop.site?.toLowerCase().includes('pattadakal') || stop.monument?.toLowerCase().includes('pattadakal')) {
      x = 470 + (idx % 2 === 0 ? -12 : 12);
      y = 285 + (idx * 4 - 8);
    } else if (stop.site?.toLowerCase().includes('aihole') || stop.monument?.toLowerCase().includes('aihole')) {
      x = 640 + (idx % 2 === 0 ? -10 : 10);
      y = 195 + (idx * 4 - 8);
    } else if (stop.culinaryId === 'jolada_rotti') {
      x = 350;
      y = 300;
    } else if (stop.type === 'transit') {
      x = 300 + (idx * 60) % 250;
      y = 180 + (idx * 40) % 100;
    }

    return { ...stop, mapX: x, mapY: y, originalIndex: idx };
  });

  return (
    <div className="bg-stone-900 border border-amber-900/40 rounded-2xl p-4 sm:p-6 text-stone-100 shadow-md relative overflow-hidden space-y-3">
      
      {/* Top Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 text-sm">📍</span>
            <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base">
              {language === 'kn' ? 'ಮಲಪ್ರಭಾ ಕಣಿವೆ ಪಾರಂಪರಿಕ ಮಾರ್ಗ ನಕ್ಷೆ' : language === 'hi' ? 'मलप्रभा घाटी हेरिटेज रूट मैप' : 'Malaprabha Valley Circuit Geometry'}
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
              {totalKm} km • {transportMode.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {language === 'kn' ? 'ಬಾಗಲಕೋಟೆ, ಬಾದಾಮಿ, ಪಟ್ಟದಕಲ್ಲು ಮತ್ತು ಐಹೊಳೆ ನಡುವಿನ ರಸ್ತೆ ಸಂಪರ್ಕ ಮತ್ತು ನಿಲುಗಡೆಗಳು' :
             language === 'hi' ? 'बागलकोट, बादामी, पट्टदकल और ऐहोल के बीच सड़क संपर्क व पड़ाव' :
             'Direct road connections along the historic 6th–8th century Chalukyan royal corridor'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowCulinaryPins(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1 ${
              showCulinaryPins 
                ? 'bg-amber-600/30 text-amber-300 border-amber-500/60' 
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
          >
            <span>🍲</span>
            <span>{language === 'kn' ? 'ಆಹಾರ ನಿಲುಗಡೆ' : language === 'hi' ? 'खानपान पड़ाव' : 'Food Stops'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] max-h-[380px] bg-stone-950/80 rounded-xl border border-stone-800/80 overflow-hidden">
        <svg 
          viewBox="0 0 800 420" 
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Sandstone Terrain Gradients */}
            <linearGradient id="corridorRoad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
            </linearGradient>

            {/* Glowing marker filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Pattern */}
          <g stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="420" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} />
            ))}
          </g>

          {/* Malaprabha River Path */}
          <path
            d="M 120 380 Q 280 340 440 295 T 620 210 T 780 150"
            fill="none"
            stroke="url(#riverGradient)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <text x="560" y="240" fill="#38bdf8" opacity="0.6" fontSize="10" fontStyle="italic" fontWeight="600" letterSpacing="1">
            ~ Malaprabha River ~
          </text>

          {/* Circuit Highway Network */}
          {/* Bagalkote -> Badami (SH-57) */}
          <path
            d="M 340 75 Q 230 180 190 310"
            fill="none"
            stroke="url(#corridorRoad)"
            strokeWidth="4"
            strokeDasharray="6,4"
          />
          <text x="235" y="180" fill="#d97706" opacity="0.8" fontSize="10" fontWeight="600">
            SH-57 (35 km)
          </text>

          {/* Badami -> Pattadakal (SH-14) */}
          <path
            d="M 190 310 Q 330 330 470 285"
            fill="none"
            stroke="url(#corridorRoad)"
            strokeWidth="4"
          />
          <text x="315" y="325" fill="#f59e0b" opacity="0.8" fontSize="10" fontWeight="600">
            SH-14 (22 km)
          </text>

          {/* Pattadakal -> Aihole */}
          <path
            d="M 470 285 Q 560 250 640 195"
            fill="none"
            stroke="url(#corridorRoad)"
            strokeWidth="4"
          />
          <text x="555" y="260" fill="#f59e0b" opacity="0.8" fontSize="10" fontWeight="600">
            13.5 km
          </text>

          {/* Aihole -> Bagalkote Return Highway */}
          <path
            d="M 640 195 Q 520 110 340 75"
            fill="none"
            stroke="#78716c"
            strokeWidth="2.5"
            strokeDasharray="4,4"
            opacity="0.6"
          />
          <text x="510" y="115" fill="#a8a29e" opacity="0.8" fontSize="9" fontWeight="600">
            42 km Return
          </text>

          {/* Regional Hub Waypoint Nodes */}
          {WAYPOINTS.map((wp) => {
            const isOrigin = origin === wp.id;
            const isHovered = hoveredWaypoint === wp.id;

            return (
              <g 
                key={wp.id} 
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredWaypoint(wp.id)}
                onMouseLeave={() => setHoveredWaypoint(null)}
              >
                {/* Glowing ring for Origin or Hover */}
                {(isOrigin || isHovered) && (
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r="24"
                    fill="none"
                    stroke={isOrigin ? '#10b981' : '#f59e0b'}
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                    className="animate-spin"
                    style={{ transformOrigin: `${wp.x}px ${wp.y}px` }}
                  />
                )}

                {/* Base Marker Circle */}
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r="14"
                  fill={wp.type === 'unesco' ? '#78350f' : wp.type === 'gateway' ? '#1e293b' : '#451a03'}
                  stroke={wp.type === 'unesco' ? '#f59e0b' : wp.type === 'gateway' ? '#38bdf8' : '#fb923c'}
                  strokeWidth="2.5"
                />

                <text 
                  x={wp.x} 
                  y={wp.y + 4} 
                  textAnchor="middle" 
                  fontSize="12"
                >
                  {wp.icon}
                </text>

                {/* Node Label */}
                <text
                  x={wp.x}
                  y={wp.y + (wp.y > 250 ? 28 : -20)}
                  textAnchor="middle"
                  fill="#fef3c7"
                  fontSize="12"
                  fontWeight="bold"
                  className="drop-shadow-md"
                >
                  {wp.name}
                </text>

                <text
                  x={wp.x}
                  y={wp.y + (wp.y > 250 ? 40 : -8)}
                  textAnchor="middle"
                  fill="#a8a29e"
                  fontSize="9"
                >
                  {wp.subtitle}
                </text>
              </g>
            );
          })}

          {/* Numbered Itinerary Stop Pins */}
          {mappedStops.map((stop, i) => {
            if (stop.type === 'transit') return null;
            if (stop.type === 'culinary' && !showCulinaryPins) return null;

            const isCurrent = activeStopIndex === stop.originalIndex;
            const isCulinary = stop.type === 'culinary';

            return (
              <g 
                key={`stop-pin-${i}`}
                className="cursor-pointer group"
                onClick={() => onSelectStop && onSelectStop(stop.originalIndex)}
              >
                <circle
                  cx={stop.mapX}
                  cy={stop.mapY}
                  r={isCurrent ? 12 : 9}
                  fill={isCulinary ? '#f97316' : '#22c55e'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-300"
                  filter="url(#glow)"
                />
                <text
                  x={stop.mapX}
                  y={stop.mapY + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {isCulinary ? '🍲' : i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Interactive Tooltip */}
        {hoveredWaypoint && (
          <div className="absolute bottom-3 left-3 bg-stone-900/95 border border-amber-600/40 p-2.5 rounded-xl shadow-lg text-xs max-w-xs backdrop-blur-sm z-20">
            <span className="font-bold text-amber-300 block">
              {WAYPOINTS.find(w => w.id === hoveredWaypoint)?.name}
            </span>
            <span className="text-stone-300 text-[11px]">
              {WAYPOINTS.find(w => w.id === hoveredWaypoint)?.subtitle}
            </span>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-300 pt-1 gap-2 border-t border-stone-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Heritage Stop</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span>Culinary Experience</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span>Malaprabha River</span>
          </span>
        </div>
        <span className="text-stone-400 font-mono text-[10px]">
          ASI Protected • Bagalkot Chalukya Belt
        </span>
      </div>
    </div>
  );
};
