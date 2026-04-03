"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dpLogout } from "../actions";

export default function DeliveryHeader({ title }: { title: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
      <div className="w-full px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
        
        {/* Left: NAAS Logo / Brand with badge */}
        <div className="flex items-center gap-3">
          <Link href="/staff/dp" className="text-2xl font-bold tracking-tighter text-slate-900 transition-opacity hover:opacity-80">
            NAAS.
          </Link>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-500">
            Delivery
          </span>
        </div>

        {/* Center: Page Title */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
          <h1 className="text-sm font-medium tracking-wide text-slate-900">{title}</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 relative">
           
           {/* Minimal Sign Out Button */}
           <button 
             onClick={async () => await dpLogout()} 
             className="text-xs font-medium text-slate-400 hover:text-black transition-colors hidden sm:block mr-1"
           >
             Sign Out
           </button>

           {/* Profile Avatar connecting directly to Profile Page (Matches Customer Style exactly) */}
           <Link 
             href="/staff/dp/profile"
             className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
               pathname === '/staff/dp/profile'
                 ? "bg-slate-200 text-black border-slate-300" 
                 : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-black border-slate-200/50"
             }`}
             aria-label="Delivery Profile"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
               <circle cx="12" cy="7" r="4" />
             </svg>
           </Link>

        </div>
      </div>
      
      {/* Mobile Title row (since absolute center hides on very small screens) */}
      <div className="sm:hidden px-6 pb-4 pt-1">
         <h1 className="text-lg font-medium tracking-tight text-slate-900">{title}</h1>
      </div>
    </header>
  );
}
