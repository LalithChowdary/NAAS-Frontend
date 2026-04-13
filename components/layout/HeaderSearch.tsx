'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setValue(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value.trim()) {
        router.push(`/?search=${encodeURIComponent(value.trim())}#publications`);
      } else {
        router.push('/#publications');
      }
    }
  };

  return (
    <div className="relative hidden sm:block group">
      {/* Elegant tiny search input */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-slate-900 transition-colors">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <input 
        type="search" 
        placeholder="Search publications..." 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleSearch}
        className="pl-9 pr-4 py-2 bg-slate-100/50 hover:bg-slate-100 focus:bg-white text-sm rounded-full outline-none border border-transparent focus:border-slate-200 focus:ring-4 focus:ring-slate-100 transition-all w-48 focus:w-64 placeholder-slate-400"
      />
    </div>
  );
}