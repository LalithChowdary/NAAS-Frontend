"use client";

import { useState } from 'react';
import PublicationCard from './PublicationCard';

interface Publication {
  id: number;
  name: string;
  type: string;
  price: number;
  description: string;
  imageUrl?: string;
  enabled: boolean;
}

export default function FeaturedPublications({ publications }: { publications: Publication[] }) {
  const [filter, setFilter] = useState<'All' | 'Newspapers' | 'Magazines'>('All');

  if (!publications || publications.length === 0) {
    return (
      <section className="w-full max-w-screen-2xl mx-auto px-6 py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-6">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
            <path d="M18 14h-8"></path>
            <path d="M15 18h-5"></path>
            <path d="M10 6h8v4h-8V6Z"></path>
          </svg>
          <h3 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">No publications found</h3>
          <p className="text-lg text-slate-500 font-light max-w-md">Our shelves are currently empty. Check back later for newly added print.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-8">
        
        {/* Massive Store Header */}
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-[5rem] font-semibold tracking-[-0.04em] text-slate-900 leading-[0.9] mb-6">
            Store. <br />
            <span className="text-slate-400">Your daily dose of print.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed tracking-tight">
            Curated and delivered. Explore our complete selection of trusted daily news and monthly magazines.
          </p>
        </div>

        {/* Apple-esque Frosted Quick Filters */}
        <div className="flex bg-slate-200/50 backdrop-blur-3xl p-1.5 rounded-full shadow-inner border border-white/50">
          <button 
            onClick={() => setFilter('All')}
            className={`px-6 py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ease-out ${filter === 'All' ? 'bg-white text-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
          >
            All Prints
          </button>
          <button 
            onClick={() => setFilter('Newspapers')}
            className={`px-6 py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ease-out ${filter === 'Newspapers' ? 'bg-white text-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
          >
            Newspapers
          </button>
          <button 
            onClick={() => setFilter('Magazines')}
            className={`px-6 py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ease-out ${filter === 'Magazines' ? 'bg-white text-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
          >
            Magazines
          </button>
        </div>
      </div>
      
      {/* Dynamic Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {publications
          .filter(pub => {
            if (filter === 'All') return true;
            if (filter === 'Newspapers') return pub.type.toUpperCase() === 'NEWSPAPER';
            if (filter === 'Magazines') return pub.type.toUpperCase() === 'MAGAZINE';
            return true;
          })
          .map((pub) => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
      </div>
    </section>
  );
}
