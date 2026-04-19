'use client';

import { useCart } from '../cart/CartProvider';

interface Publication {
  id: number;
  name: string;
  type: string;
  price: number;
  description: string;
  frequency?: string;
  imageUrl?: string;
  enabled: boolean;
}

export default function PublicationCard({ publication }: { publication: Publication }) {
  const isAvailable = publication.enabled;
  const { addToCart } = useCart();

  return (
    <div className="group relative flex flex-col rounded-[24px] overflow-hidden bg-white/70 backdrop-blur-3xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
      
      {/* Premium Image Header */}
      <div className="relative w-full h-64 overflow-hidden bg-[#FBFBFD] flex items-center justify-center p-6">
        {publication.imageUrl ? (
          <img 
            src={publication.imageUrl} 
            alt={publication.name}
            className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 mix-blend-multiply"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mb-2 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-widest opacity-60">No Cover Available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay"></div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-[0.2em] text-slate-900 shadow-sm transition-transform duration-300 group-hover:scale-105">
            {publication.type}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900 leading-tight">
            {publication.name}
          </h3>
          <div className="flex flex-col items-end text-right ml-4 flex-shrink-0">
            <span className="text-lg font-semibold tracking-tight text-slate-900">₹{publication.price.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{publication.frequency ? publication.frequency : (publication.type === 'NEWSPAPER' ? 'Daily' : 'Monthly')}</span>
          </div>
        </div>
        
        <p className="text-[13px] text-slate-500 font-normal leading-relaxed mb-8 flex-grow">
          {publication.description || "Daily delivery included. Minimalistic, elegant, and timely—delivered right to your door."}
        </p>

        <div className="flex items-center mt-auto">
          <button 
            disabled={!isAvailable}
            className={`w-full py-3.5 px-6 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
              isAvailable 
                ? 'bg-slate-900/95 text-white hover:bg-black hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:scale-[0.98]' 
                : 'bg-slate-100/50 text-slate-400 cursor-not-allowed'
            }`}
            onClick={() => {
              if (isAvailable) {
                addToCart({
                  id: publication.id,
                  name: publication.name,
                  price: publication.price,
                  type: publication.type,
                  frequency: publication.frequency
                });
              }
            }}
          >
            {isAvailable ? (
              <>
                <span>Add to Cart</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </>
            ) : 'Currently Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
