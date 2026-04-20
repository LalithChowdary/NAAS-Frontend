export default function FeaturesSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 md:py-32">
      <div className="flex flex-col text-center mb-16 md:mb-24">
        <h2 className="text-4xl md:text-[56px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
          Designed for your daily routine. <br className="hidden md:block" />
          <span className="text-slate-400">Zero friction included.</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Bento Box 1: Large Span */}
        <div className="md:col-span-2 group relative p-10 md:p-14 rounded-[40px] bg-slate-900 overflow-hidden flex flex-col items-start justify-end min-h-[400px]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-slate-700/40 to-transparent blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
          <div className="relative z-10 text-white max-w-2xl">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </div>
            <h3 className="text-3xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">
              Uncompromising Reliability.
            </h3>
            <p className="text-lg text-slate-400 font-light leading-relaxed">
              We process and dispatch thousands of subscriptions automatically every single morning. Your paper arrives exactly when it should, perfectly protected from the weather.
            </p>
          </div>
        </div>

        {/* Bento Box 2 */}
        <div className="group relative p-10 md:p-12 rounded-[40px] bg-slate-50 border border-slate-100 overflow-hidden flex flex-col justify-between min-h-[360px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-700">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 mb-8 group-hover:-translate-y-1 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="14" y="4" width="4" height="16" rx="1"></rect>
              <rect x="6" y="4" width="4" height="16" rx="1"></rect>
            </svg>
          </div>
          <div>
            <h3 className="text-2xl md:text-[28px] font-semibold text-slate-900 tracking-tight mb-3">
              Pause Instantly.
            </h3>
            <p className="text-[15px] text-slate-500 font-normal leading-relaxed">
              Heading out for a vacation? Tap once on your dashboard to pause your deliveries. You'll never be billed for the days you aren't home to read them.
            </p>
          </div>
        </div>

        {/* Bento Box 3 */}
        <div className="group relative p-10 md:p-12 rounded-[40px] bg-slate-50 border border-slate-100 overflow-hidden flex flex-col justify-between min-h-[360px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-700">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 mb-8 group-hover:-translate-y-1 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
          <div>
            <h3 className="text-2xl md:text-[28px] font-semibold text-slate-900 tracking-tight mb-3">
              Absolute Transparency.
            </h3>
            <p className="text-[15px] text-slate-500 font-normal leading-relaxed">
              We ditched archaic billing methods. Control your subscriptions digitally, view automated monthly statements, and alter your plan effortlessly without ever calling support.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
