import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-screen-2xl mx-auto min-h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden px-6">
      
      {/* Immersive Glowing Mesh Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-slate-200/50 via-slate-100/40 to-slate-200/50 blur-3xl opacity-60 rounded-full -z-10 animate-pulse transition-all duration-1000"></div>

      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-900/10 backdrop-blur-md mb-8 animate-fade-in-up">
        <span className="relative flex w-2.5 h-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-bold text-slate-800 tracking-[0.2em] uppercase">Now Delivering Worldwide</span>
      </div>

      <h1 className="text-6xl sm:text-7xl md:text-[9rem] font-semibold tracking-[-0.04em] text-slate-900 leading-[0.9] mb-8 select-none">
        Read <br className="hidden md:block" /> 
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600">Differently.</span>
      </h1>
      
      <p className="text-lg md:text-2xl text-slate-500 max-w-2xl font-normal leading-relaxed mb-12 tracking-tight">
        Immersive formats. Absolute clarity. Experience the most trusted <br className="hidden md:block" /> publications elegantly curated for your daily routine.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Link 
          href="#publications" 
          className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-full text-sm font-semibold tracking-wide hover:bg-black hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all duration-300"
        >
          Explore the Store
        </Link>
        <Link 
          href="/how-it-works" 
          className="w-full sm:w-auto px-10 py-5 bg-white/60 backdrop-blur-xl border border-slate-200 text-slate-900 rounded-full text-sm font-semibold tracking-wide hover:bg-white hover:shadow-lg transition-all duration-300"
        >
          Discover How It Works
        </Link>
      </div>
    </section>
  );
}
