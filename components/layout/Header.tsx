import Link from 'next/link';
import { cookies } from 'next/headers';
import HeaderActions from './HeaderActions';
import { Suspense } from 'react';
import HeaderSearch from './HeaderSearch';

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
          <Suspense fallback={<div className="w-48 h-9 bg-slate-100/50 rounded-full animate-pulse hidden sm:block"></div>}>
            <HeaderSearch />
          </Suspense>
          
          <div className="flex items-center gap-4">
            <HeaderActions isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>
    </header>
  );
}
