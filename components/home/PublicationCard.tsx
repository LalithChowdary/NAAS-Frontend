'use client';

import { useCart } from '../cart/CartProvider';

interface Publication {
  id: number;
  name: string;
  type: string;
  price: number;
  description: string;
  frequency?: string;
  enabled: boolean;
}

export default function PublicationCard({ publication }: { publication: Publication }) {
  const isAvailable = publication.enabled;
  const { addToCart } = useCart();

  return (
    <div className="group flex flex-col p-6 rounded-[2rem] border border-slate-100 bg-white hover:shadow-xl hover:shadow-slate-200/20 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <span className="px-3 py-1 rounded-full bg-slate-50 text-[10px] font-semibold uppercase tracking-widest text-slate-500 border border-slate-100">
          {publication.type}
        </span>
        <div className="flex flex-col items-end">
          <span className="text-lg font-semibold text-slate-900">₹{publication.price.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium">{publication.frequency ? publication.frequency.toUpperCase() : (publication.type === 'NEWSPAPER' ? 'DAILY' : 'MONTHLY')}</span>
        </div>
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">
        {publication.name}
      </h3>
      
      <p className="text-sm text-slate-500 font-light leading-relaxed mb-8 flex-grow">
        {publication.description || "Daily delivery included. Easy to pause or cancel anytime."}
      </p>

      <div className="flex items-center gap-4 mt-auto">
        <button 
          disabled={!isAvailable}
          className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
            isAvailable 
              ? 'bg-slate-900 text-white hover:bg-black active:scale-[0.98]' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
          {isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
        </button>
      </div>
    </div>
  );
}
