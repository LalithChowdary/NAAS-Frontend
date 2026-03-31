import PublicationCard from './PublicationCard';

interface Publication {
  id: number;
  name: string;
  type: string;
  price: number;
  description: string;
  enabled: boolean;
}

export default function FeaturedPublications({ publications }: { publications: Publication[] }) {
  if (!publications || publications.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="p-12 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-4">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
            <path d="M18 14h-8"></path>
            <path d="M15 18h-5"></path>
            <path d="M10 6h8v4h-8V6Z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No publications found</h3>
          <p className="text-slate-500 font-light">Check back later for newly added newspapers and magazines.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="publications" className="w-full max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
            Featured Publications
          </h2>
          <p className="text-slate-500 font-light max-w-xl">
            Choose from our curated selection of top-tier daily newspapers and monthly magazines.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Optional filter pills visual mockup */}
          <span className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer">All</span>
          <span className="px-4 py-2 rounded-full bg-transparent border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors">Newspapers</span>
          <span className="px-4 py-2 rounded-full bg-transparent border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors">Magazines</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {publications.map((pub) => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
      </div>
    </section>
  );
}
