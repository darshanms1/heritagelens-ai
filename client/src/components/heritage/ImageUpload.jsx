import { useRef, useState } from 'react';

export const ImageUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all duration-300 cursor-pointer focus:outline-none focus:ring-3 focus:ring-[#923C13]/30 ${
        dragActive 
          ? 'border-[#923C13] bg-[#F5E8D8]/70 scale-[1.01]' 
          : 'border-[#D9C8BE] hover:border-[#923C13] bg-[#FFFDFB] hover:bg-[#FAF5F0] shadow-sm hover:shadow-md'
      }`}
      role="button"
      tabIndex={0}
      aria-label="Upload Monument Image"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input 
        ref={inputRef}
        type="file" 
        accept="image/jpeg,image/png,image/webp" 
        className="hidden" 
        onChange={handleChange}
      />
      <input 
        ref={cameraInputRef}
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        onChange={handleChange}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Visual Camera/Lens Icon with subtle pulsating rings */}
        <div className="relative">
          <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-[#F5E8D8] to-[#EBDCD6] border border-[#C88A42]/30 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner group-hover:scale-105 transition-transform duration-300">
            📸
          </div>
          <span className="absolute -top-1.5 -right-1.5 bg-[#923C13] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-xs uppercase tracking-wider">
            AI Lens
          </span>
        </div>

        <div className="space-y-1.5 max-w-sm">
          <p className="text-lg sm:text-xl font-serif font-bold text-[#231915]">
            Point or Upload Monument Photo
          </p>
          <p className="text-xs sm:text-sm text-[#5A463C] leading-relaxed">
            Drag and drop your temple photograph, or tap below to browse your gallery
          </p>
        </div>

        {/* Action Buttons: Choose File & Direct Camera */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-5 py-2.5 bg-[#923C13] hover:bg-[#6B2A0A] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-[0_2px_8px_rgba(146,60,19,0.25)] hover:shadow-md transition-all flex items-center space-x-1.5 min-h-[40px]"
          >
            <span>📁</span>
            <span>Select from Files</span>
          </button>
          
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="px-5 py-2.5 bg-white hover:bg-[#F5E8D8]/50 text-[#5A3800] border border-[#C88A42]/50 font-semibold text-xs sm:text-sm rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5 min-h-[40px]"
          >
            <span>📷</span>
            <span>Open Camera</span>
          </button>
        </div>

        {/* Verification badges footer */}
        <div className="pt-3 border-t border-[#E8DDD0]/80 w-full max-w-xs flex items-center justify-between text-[11px] text-[#8A7A70]">
          <span>JPG • PNG • WebP</span>
          <span>•</span>
          <span className="text-[#2D7D46] font-semibold">✓ Exact & AI Matching Active</span>
        </div>
      </div>
    </div>
  );
};
