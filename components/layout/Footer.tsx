import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-between">
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="text-xl font-bold tracking-tighter text-slate-800">
              NAAS.
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">
              Daily newspapers and magazines delivered fresh to your doorstep. Flexible, transparent, and reliable.
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                About & Contact
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Newspaper Agency Automation System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
