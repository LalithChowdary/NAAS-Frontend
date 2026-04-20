'use client';

import Link from 'next/link';
import { useCart } from '../cart/CartProvider';
// We can't import server actions directly in a way that executes them inline effortlessly as forms sometimes,
// Wait, we CAN just use a form action inside a client component if we pass the action as a prop or import it directly.
// Actually, `logout` is a server action, it works perfectly fine in a Client Component form.
import { logout } from '@/app/actions/auth'; 

export default function HeaderActions({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { cartCount, jiggle, items } = useCart();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-5">
        {/* Cart Icon & Mini-cart Dropdown */}
        <div className="relative group">
          <Link href="/cart" className={`relative text-slate-600 hover:text-black transition-colors flex items-center p-1 ${jiggle ? 'animate-wiggle' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {/* Cart badge indicator */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mini-cart Dropdown Popup */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_12px_40px_rgb(0,0,0,0.12)] rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 origin-top-right transform group-hover:scale-100 scale-95 pointer-events-none group-hover:pointer-events-auto">
            {/* Arrow pointing up */}
            <div className="absolute -top-1.5 right-2.5 w-3 h-3 bg-white border-t border-l border-slate-200/60 transform rotate-45"></div>
            
            <div className="relative z-10">
              <h4 className="text-[13px] font-semibold text-slate-900 tracking-tight mb-3">Cart Summary</h4>
              
              {items.length === 0 ? (
                 <p className="text-xs text-slate-400 font-light text-center py-4">Your cart is empty</p>
              ) : (
                 <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                   {items.map(item => (
                      <div key={item.id} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                         <div className="flex flex-col max-w-[70%]">
                           <span className="font-medium text-slate-800 line-clamp-1">{item.name}</span>
                           <span className="text-[10px] text-slate-400">{item.quantity} x {item.frequency || 'Monthly'}</span>
                         </div>
                         <span className="font-semibold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                   ))}
                 </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-slate-100">
                 <Link href="/cart" className="flex items-center justify-center w-full bg-slate-900 text-white text-[13px] font-medium py-2.5 rounded-xl hover:bg-black transition-all hover:shadow-md active:scale-[0.98]">
                    Checkout Now
                 </Link>
              </div>
            </div>
          </div>
        </div>

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
