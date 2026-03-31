import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center text-center">
      {/* Subtle background decoration (optional, but keeps it jony ive-esque) */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-slate-50/50 to-transparent -z-10 pointer-events-none rounded-b-[100px]" />
      
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/50 mb-8 backdrop-blur-sm">
        <span className="flex w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">Delivering in your area</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 max-w-4xl leading-[1.1] mb-8">
        Daily Newspapers <br className="hidden md:block" /> 
        <span className="text-slate-400">Delivered to Your Doorstep</span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-500 max-w-2xl font-light leading-relaxed mb-12">
        Experience the simplicity of managing your daily reading. Reliable delivery, flexible scheduling, and completely transparent billing.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          href="#publications" 
          className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium tracking-wide hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10"
        >
          Browse Publications
        </Link>
        <Link 
          href="/how-it-works" 
          className="px-8 py-4 bg-transparent text-slate-600 rounded-full font-medium tracking-wide hover:bg-slate-50 transition-all"
        >
          Learn More
        </Link>
      </div>
    </section>
  );
}
