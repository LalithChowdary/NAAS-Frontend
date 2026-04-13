'use client';

import Link from 'next/link';
import { useCart } from '../cart/CartProvider';
// We can't import server actions directly in a way that executes them inline effortlessly as forms sometimes,
// Wait, we CAN just use a form action inside a client component if we pass the action as a prop or import it directly.
// Actually, `logout` is a server action, it works perfectly fine in a Client Component form.
import { logout } from '@/app/actions/auth'; 

export default function HeaderActions({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { cartCount, jiggle } = useCart();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-5">
        {/* Cart Icon */}
        <Link href="/cart" className={`relative text-slate-600 hover:text-black transition-colors ${jiggle ? 'animate-wiggle' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {/* Cart badge indicator */}
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Profile Avatar connecting to Dashboard */}
        <Link 
          href="/customer" 
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-black transition-all border border-slate-200/50"
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
            data-testid="logout-btn"
            className="text-xs font-medium text-slate-400 hover:text-black transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <Link 
        href="/login" 
        className="text-sm font-medium text-slate-600 hover:text-black transition-colors"
      >
        Sign In
      </Link>
      <Link 
        href="/signup" 
        className="text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-black transition-transform active:scale-95 shadow-sm"
      >
        Get Started
      </Link>
    </>
  );
}
