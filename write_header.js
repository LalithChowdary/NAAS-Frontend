const fs = require('fs');
const content = `'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../cart/CartProvider';
import { logout } from '@/app/actions/auth';

export default function HeaderActions({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { cartCount, jiggle } = useCart();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentE   ent.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="flex items-center gap-5">
      {/* Theme Toggle Icon */}
      <button 
        onClick={toggleTheme} 
        aria-label="Toggle Theme"
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-all dark:hover:text-white dark:hover:bg-slate-800"
      >
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {isAuthenticated ? (
        <>
          {/* Cart Icon */}
          <Link href="/cart" className={\`relative text-slate-600 hover:text-black dark:text-slate-300 dark:hover:text-white transition-colors \${jiggle ? 'animate-wiggle' : ''}\`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {/* Cart badge indicator */}
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile Avatar connecting to Dashboard */}
          <Link 
            href="/customer" 
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white transition-all border border-slate-200/50 dark:border-slate-700"
            aria-label="Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          
          {/* Simplified Sign Out */}
          <form action={logout}>
            <button 
              type="submit"
              className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </form>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="text-sm font-medium px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:bg-black dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-sm"
          >
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}
\`;

fs.writeFileSync('components/layout/HeaderActions.tsx', content);
