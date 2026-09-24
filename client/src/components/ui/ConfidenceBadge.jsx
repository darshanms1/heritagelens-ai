export const ConfidenceBadge = ({ confidence_label, label, is_cached, is_live_ai, identification_method }) => {
  // Case 1: Prepared Demo Mode Identification
  if (is_cached || (label && label.toLowerCase().includes('demo'))) {
    return (
      <div className="flex flex-col items-end">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-heritage-primary text-white shadow-sm flex items-center space-x-1">
          <span>📌</span>
          <span>Prepared Demo Identification</span>
        </span>
        <span className="text-[11px] text-heritage-textMuted mt-1 font-medium">
          Verified Grounding (Deterministic)
        </span>
      </div>
    );
  }

  // Case 2: Manual Selection Guide
  if (label && label.toLowerCase().includes('manual')) {
    return (
      <div className="flex flex-col items-end">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-heritage-surface border border-heritage-primary text-heritage-primary shadow-sm">
          Manual Selection
        </span>
        <span className="text-[11px] text-heritage-textMuted mt-1">
          Curated Knowledge Guide
        </span>
      </div>
    );
  }

  // Case 3: Live AI Visual Identification (Strict Qualitative Labels Only)
  const normLabel = (confidence_label || '').toLowerCase();
  let badgeText = 'Unknown / Ambiguous';
  let colorClass = 'bg-stone-500 text-white';

  if (normLabel === 'high') {
    badgeText = 'High Confidence';
    colorClass = 'bg-emerald-600 text-white';
  } else if (normLabel === 'medium') {
    badgeText = 'Medium Confidence';
    colorClass = 'bg-amber-600 text-white';
  } else if (normLabel === 'low') {
    badgeText = 'Low Confidence';
    colorClass = 'bg-rose-600 text-white';
  }

  let methodLabel = 'Live AI Identification';
  if (identification_method === 'qwen3.8-27b-vlm' || identification_method === 'groq-qwen-vlm') {
    methodLabel = 'Qwen 3.8 27B VLM (Groq)';
  } else if (identification_method === 'exact-hash') {
    methodLabel = 'Exact Image Match (SHA-256)';
  } else if (identification_method === 'perceptual-hash') {
    methodLabel = 'Perceptual Image Match';
  } else if (identification_method === 'local_visual_matching' || identification_method === 'local-clip') {
    methodLabel = 'Local Visual Matching (CLIP)';
  } else if (identification_method === 'local_vision_fallback') {
    methodLabel = 'Visual Matching (Resilient Fallback)';
  } else if (identification_method === 'multimodal_vision_reasoning' || identification_method === 'multimodal-ai') {
    methodLabel = 'Multimodal Reasoning (AI Vision)';
  }

  return (
    <div className="flex flex-col items-end">
      <span className={`px-3.5 py-1 rounded-full text-xs font-semibold shadow-sm ${colorClass}`}>
        {badgeText}
      </span>
      <span className="text-[11px] text-heritage-primary font-medium mt-1 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
        <span>{methodLabel}</span>
      </span>
    </div>
  );
};
