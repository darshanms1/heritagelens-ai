import { useEffect, useState } from 'react';

const messages = [
  "Analyzing the monument...",
  "Identifying architectural features...",
  "Grounding the explanation...",
  "Retrieving Archaeological Survey of India evidence..."
];

export const LoadingSpinner = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 bg-[#C88A42]/20 rounded-3xl animate-ping" style={{ animationDuration: '2.5s' }} />
        <div className="absolute inset-2 bg-[#F5E8D8] rounded-2xl border border-[#C88A42]/40" />
        <div className="absolute inset-4 bg-gradient-to-br from-[#923C13] to-[#6B2A0A] rounded-2xl shadow-md flex items-center justify-center border border-[#C88A42]/50">
          <span className="text-3xl">🏛️</span>
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-[#923C13] font-serif text-lg font-bold tracking-wide">
          {messages[msgIdx]}
        </p>
        <p className="text-[11px] text-[#7A6A60] font-mono">
          Multi-layer VLM & ASI Grounding Active
        </p>
      </div>
    </div>
  );
};
