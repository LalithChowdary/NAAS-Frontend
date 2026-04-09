import Link from 'next/link';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';
import ProfileCardClient from './ProfileCardClient';
import AddressListCard from '@/components/customer/AddressListCard';

async function fetchWithToken(endpoint: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store' // Ensure we get fresh dashboard data always
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export default async function CustomerDashboard() {
  const [user, profile, subscriptions, bills, deliveries, addresses] = await Promise.all([
    fetchWithToken('/api/auth/me'),
    fetchWithToken('/api/customer/profile'),
    fetchWithToken('/api/customer/subscriptions'),
    fetchWithToken('/api/customer/bills'),
    fetchWithToken('/api/delivery/customer'),
    fetchWithToken('/api/customer/addresses')
  ]);

  const activeSubsCount = subscriptions?.filter((s: any) => s.status === 'ACTIVE' || s.status === 'SUSPENDED').length || 0;
  const latestBill = bills && bills.length > 0 ? bills[bills.length - 1] : null;

  return (
    <div className="flex-1 bg-slate-50 flex flex-col font-sans text-slate-900 pb-24">
      
      {/* Main Dashboard Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
          Welcome back{profile?.name ? `, ${profile.name}` : user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-slate-500 font-light mb-12 text-lg">
          Manage your subscriptions, view invoices, and update settings here.
        </p>

        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Subscriptions */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Active Subscriptions</h3>
            <p className="text-4xl font-semibold text-slate-800 mb-6">{activeSubsCount}</p>
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1">
              Browse Publications <span>&rarr;</span>
            </Link>
          </div>

          {/* Card 2: Billing */}
          <Link href="/customer/deliveries" className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-slate-900">Most Recent Bill</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-slate-600 transition-colors group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
              {latestBill ? (
                <>
                  <p className="text-4xl font-semibold text-slate-800 mb-2">
                    &#8377;{latestBill.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500 mb-4 font-light">For {latestBill.billingMonth}</p>
                </>
              ) : (
                <div className="mt-4 mb-6">
                  <p className="text-slate-500 text-sm font-light">No billing history available yet.</p>
                </div>
              )}
            </div>
            <div>
              {latestBill ? (
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                  latestBill.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {latestBill.status}
                </span>
              ) : (
                <span className="text-sm font-medium text-slate-400 border-b border-slate-200 pb-1 uppercase tracking-widest text-[10px]">
                  Up to date
                </span>
              )}
            </div>
          </Link>

          <ProfileCardClient profile={profile} fallbackEmail={user?.email} />

          {/* Card 4: Saved Addresses */}
          <AddressListCard addresses={addresses || []} />
        </div>

        {/* Subscriptions Management Area */}
        <DashboardClient subscriptions={subscriptions || []} />
        
      </main>
    </div>
  );
}
