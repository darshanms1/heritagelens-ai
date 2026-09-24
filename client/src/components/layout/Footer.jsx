export const Footer = ({ language = 'en' }) => {
  return (
    <footer className="bg-[#150D0A] text-[#D6C5B8] border-t border-[#33221B] py-10 sm:py-14 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
        
        {/* Top Row: Brand & Accreditation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#923C13] to-[#6B2A0A] flex items-center justify-center text-white text-base shadow-xs border border-[#C88A42]/30">
                🏛️
              </div>
              <span className="font-serif font-bold text-white text-xl tracking-tight">
                HeritageLens <span className="text-[#E5A84F] font-serif italic">AI</span>
              </span>
              <span className="text-[10px] bg-[#C88A42]/20 text-[#E5A84F] border border-[#C88A42]/40 px-2 py-0.5 rounded-full font-mono font-bold">
                Bagalkot 2026
              </span>
            </div>
            <p className="text-xs text-[#A8988E] max-w-md leading-relaxed font-sans">
              {language === 'kn'
                ? 'ಪಟ್ಟದಕಲ್ಲು, ಬಾದಾಮಿ ಮತ್ತು ಐಹೊಳೆಯ ಸಾಕ್ಷ್ಯ-ಆಧಾರಿತ ದೃಶ್ಯ ಮಾರ್ಗದರ್ಶಿ • ಭಾರತೀಯ ಪುರಾತತ್ವ ಇಲಾಖೆಯ ಅಧಿಕೃತ ದಾಖಲೆಗಳು.'
                : language === 'hi'
                ? 'पट्टदकल, बादामी और ऐहोल के लिए प्रमाण-आधारित दृश्य मार्गदर्शिका • भारतीय पुरातत्व सर्वेक्षण के प्रमाणित रिकॉर्ड।'
                : 'Evidence-Grounded Visual Intelligence for Pattadakal, Badami, & Aihole. Grounded strictly in Archaeological Survey of India (ASI) verified records.'}
            </p>
          </div>

          <div className="text-xs text-[#A8988E] space-y-1.5 text-center md:text-right max-w-md">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[11px] text-[#E5A84F]">
              <span>✓</span>
              <span>ASI Historical Epigraphical Documentation</span>
            </div>
            <p className="text-[11px] text-[#7A6A60] pt-1">
              Photographs licensed under Creative Commons via Wikimedia Commons contributors. Built for Karnataka Heritage Tourism.
            </p>
          </div>
        </div>

        {/* Bottom UNESCO Clusters & Copyright */}
        <div className="pt-6 border-t border-[#261711] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#7A6A60]">
          <p>© 2026 HeritageLens AI • "Ask the Monument" • Early Chalukyan Heritage Circuit</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-serif">
            <span className="text-[#D6C5B8]">Pattadakal (UNESCO 1987)</span>
            <span>•</span>
            <span className="text-[#D6C5B8]">Badami (UNESCO Tentative List)</span>
            <span>•</span>
            <span className="text-[#D6C5B8]">Aihole (UNESCO Tentative List)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
