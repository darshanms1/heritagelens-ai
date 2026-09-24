import { useState } from 'react';
import { Card } from '../ui/Card';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';

export const IdentificationCard = ({
  identification,
  isLowConfidence,
  is_verification,
  candidates = [],
  is_cached,
  is_live_ai,
  matchMethod,
  matchedReference,
  distance,
  debug,
  message,
  onConfirmGuess,
  onRejectGuess,
  onSelectCandidate
}) => {
  const [userRejected, setUserRejected] = useState(false);
  const [showDebug, setShowDebug] = useState(true);

  if (!identification) return null;

  const isManual = identification.confidence_label === 'Manual-selection';
  const showVerification = is_verification && !userRejected;
  const method = matchMethod || identification.matchMethod || 'local-clip';
  const refFile = matchedReference || identification.matchedReference;
  const hashDist = distance ?? identification.distance;

  const handleReject = () => {
    setUserRejected(true);
    if (onRejectGuess) onRejectGuess();
  };

  const handleExploreScroll = () => {
    if (onConfirmGuess) onConfirmGuess();
    const el = document.getElementById('monument-guide');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatMethodName = (m) => {
    switch (m) {
      case 'exact-hash':
        return 'Exact Image Match (SHA-256)';
      case 'perceptual-hash':
        return `Perceptual Image Match (pHash/dHash · Dist: ${hashDist ?? 0})`;
      case 'local-clip':
        return 'Local Vision Match (CLIP ONNX)';
      case 'qwen3.8-27b-vlm':
      case 'groq-qwen-vlm':
        return 'Qwen 3.8 27B VLM (Groq LPU)';
      case 'multimodal-ai':
        return 'Multimodal AI Vision (Gemini + Local)';
      default:
        return 'Visual Recognition Engine';
    }
  };

  return (
    <Card className="p-6 sm:p-7 relative overflow-hidden border-heritage-accent/30 shadow-md">
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-bl-full -z-10" />

      {/* Case 1: Low Confidence Notice & Suggested Matches */}
      {isLowConfidence ? (
        <div className="space-y-4">
          <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 text-sm text-stone-800 flex items-start space-x-3.5">
            <span className="text-2xl mt-0.5">🔍</span>
            <div className="space-y-1.5 flex-1">
              <span className="font-bold text-stone-900 text-base block font-serif">
                Could not confidently identify this monument
              </span>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {message || "The visual features do not match any of Bagalkot's supported monuments with decisive confidence. You can choose from the closest visual matches below or select manually."}
              </p>
            </div>
          </div>

          {candidates && candidates.length > 0 && (
            <div className="pt-2">
              <h5 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <span>Possible Matches (Based on Visual Similarity):</span>
              </h5>
              <div className="flex flex-wrap gap-2.5">
                {candidates.map((cand, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectCandidate && onSelectCandidate(cand.site_id, cand.monument_id)}
                    className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white hover:bg-amber-50 text-stone-800 border border-stone-300 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer min-h-[38px]"
                  >
                    <span>🏛️</span>
                    <span className="font-semibold">{cand.monument_name}</span>
                    <span className="text-stone-600 text-xs font-normal">({cand.site_name || cand.site_id})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Case 2: Confident or Medium Match */
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              {/* Top Status Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                  <span>✓</span>
                  <span>Monument Identified</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-300">
                  <span className="text-stone-500 mr-1">Identification method:</span> {formatMethodName(method)}
                </span>
              </div>

              {refFile && (
                <p className="text-xs text-stone-500 font-medium mb-1">
                  Matched against HeritageLens visual reference: <span className="font-mono text-stone-700 font-semibold">{refFile}</span>
                </p>
              )}

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1 mb-1">
                {identification.monument}
              </h3>
              <h4 className="text-sm sm:text-base text-stone-600 font-medium">
                📍 {identification.site}, Bagalkot District, Karnataka
              </h4>
            </div>

            <ConfidenceBadge 
              confidence_label={identification.confidence_label || 'high'}
              label={identification.confidence_label || 'high'} 
              is_cached={is_cached}
              is_live_ai={is_live_ai}
              identification_method={method}
            />
          </div>

          {/* Verification Bar for Medium Confidence */}
          {showVerification && (
            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 sm:p-5 text-stone-800 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2">
                <span className="text-lg">❓</span>
                <span className="font-bold text-sm sm:text-base text-stone-900">
                  Is this {identification.monument}?
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600">
                Visual analysis indicates strong similarity. Please confirm below:
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleExploreScroll}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer min-h-[38px] flex items-center space-x-1.5"
                >
                  <span>✓</span>
                  <span>Yes, Explore This Monument</span>
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-300 text-xs sm:text-sm font-medium rounded-xl shadow-2xs transition-colors cursor-pointer min-h-[38px]"
                >
                  No, Choose Another
                </button>
              </div>
            </div>
          )}

          {/* User Rejected Guess -> show candidate alternatives */}
          {userRejected && candidates && candidates.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wide block">
                Select from closest visual candidates:
              </span>
              <div className="flex flex-wrap gap-2">
                {candidates.map((cand, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectCandidate && onSelectCandidate(cand.site_id, cand.monument_id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-amber-50 text-stone-800 border border-stone-300 hover:border-amber-400 shadow-2xs"
                  >
                    <span>🏛️</span>
                    <span>{cand.monument_name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Debug Panel (Section 9) */}
          {debug && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 text-xs text-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[10px] text-stone-500 flex items-center space-x-1">
                  <span>🔬</span>
                  <span>Pipeline Diagnostics</span>
                </span>
                <button 
                  type="button"
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-[11px] font-medium text-amber-700 hover:underline cursor-pointer"
                >
                  {showDebug ? 'Hide' : 'Show Details'}
                </button>
              </div>

              {showDebug && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Reference Registry:</span>
                    <span className="font-semibold text-stone-800">{debug.referenceImagesCount || 9} Images</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Match Method:</span>
                    <span className="font-semibold text-stone-800">{debug.matchMethod}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Hash Distance:</span>
                    <span className="font-semibold text-stone-800">{String(debug.hashDistance)}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Best Match Ref:</span>
                    <span className="font-semibold text-stone-800 truncate block" title={debug.bestMatch}>{debug.bestMatch}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">CLIP Similarity:</span>
                    <span className="font-semibold text-stone-800">{debug.clipSimilarity}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Gemini Verification:</span>
                    <span className={`font-semibold ${String(debug.geminiVerification).includes('SUCCESS') ? 'text-emerald-700' : 'text-stone-700'}`}>
                      {debug.geminiVerification}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Why We Think So (Visual Evidence) */}
          {identification.visual_clues && identification.visual_clues.length > 0 && (
            <div className="pt-1">
              <h5 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <span>Key Visual Markers:</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {identification.visual_clues.map((clue, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-stone-700 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>{clue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Analysis Reasoning */}
          {identification.reason && (
            <div className="pt-2 border-t border-stone-200/60 text-xs text-stone-600 italic">
              "{identification.reason}"
            </div>
          )}

          {/* Explore Button for High Confidence */}
          {!showVerification && !isLowConfidence && (
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={handleExploreScroll}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer min-h-[40px]"
              >
                <span>🏛️ Explore Verified Guide</span>
                <span>↓</span>
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
