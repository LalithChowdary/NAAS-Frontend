import Link from 'next/link';
import { cookies } from 'next/headers';
import HeaderActions from './HeaderActions';

export default async function Header() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token');
  const isAuthenticated = !!token;
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        
        {/* Brand */}
        <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900 transition-opacity hover:opacity-80">
          NAAS.
        </Link>

        {/* Search & Account Actions */}
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block group">
            {/* Elegant tiny search input */}
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search publications..." 
              className="pl-9 pr-4 py-2 bg-slate-100/50 hover:bg-slate-100 focus:bg-white text-sm rounded-full outline-none border border-transparent focus:border-slate-200 focus:ring-4 focus:ring-slate-100 transition-all w-48 focus:w-64 placeholder-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <HeaderActions isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>
    </header>
  );
}
