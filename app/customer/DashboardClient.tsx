'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelSubscriptionAction, suspendSubscriptionAction } from '../actions/subscription';

type Subscription = {
  id: number;
  publicationName: string;
  status: string;
  startDate: string;
  endDate: string | null;
  suspendStartDate: string | null;
  suspendEndDate: string | null;
  createdAt: string;
};

export default function DashboardClient({ subscriptions }: { subscriptions: Subscription[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<{ type: 'PAUSE' | 'CANCEL' | null; subId: number | null }>({ type: null, subId: null });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Min date must be 8 days from now based on backend logic
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 8);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!modal.subId) return;
    setLoading(true);
    setError('');

    let res;
    if (modal.type === 'PAUSE') {
      res = await suspendSubscriptionAction(modal.subId, startDate, endDate);
    } else {
      res = await cancelSubscriptionAction(modal.subId, startDate);
    }

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setModal({ type: null, subId: null });
      setLoading(false);
      router.refresh(); // Refresh Sever Component automatically
    }
  };

  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'SUSPENDED');
  const pastSubs = subscriptions.filter(s => s.status === 'CANCELLED');

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Your Subscriptions</h2>
      </div>

      {activeSubs.length === 0 ? (
        <div className="p-12 rounded-[2rem] bg-white border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 font-light mb-4">You have no active newspaper or magazine orders.</p>
          <button onClick={() => router.push('/')} className="text-sm font-medium text-slate-900 hover:text-black hover:underline">
            Browse Publications &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeSubs.map(sub => (
            <div key={sub.id} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
              {sub.status === 'SUSPENDED' && (
                <div className="absolute top-0 inset-x-0 h-1 bg-amber-400"></div>
              )}
              {sub.status === 'ACTIVE' && (
                <div className="absolute top-0 inset-x-0 h-1 bg-emerald-400"></div>
              )}
              
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3 ${
                    sub.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {sub.status}
                  </span>
                  <h3 className="text-xl font-medium tracking-tight text-slate-900">{sub.publicationName || "Mixed Subscription"}</h3>
                  <p className="text-xs text-slate-400 mt-1">Starting {new Date(sub.startDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">ID</p>
                   <p className="text-sm text-slate-900 font-mono">#{sub.id}</p>
                </div>
              </div>

              {sub.status === 'SUSPENDED' && sub.suspendStartDate && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 text-amber-800 text-sm">
                  <p className="font-medium">Delivery Paused</p>
                  <p className="font-light mt-1">From {new Date(sub.suspendStartDate).toLocaleDateString()} to {sub.suspendEndDate ? new Date(sub.suspendEndDate).toLocaleDateString() : 'Indefinitely'}</p>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                <button 
                  onClick={() => { setModal({ type: 'PAUSE', subId: sub.id }); setStartDate(minDateStr); setEndDate(''); }}
                  disabled={sub.status === 'SUSPENDED'}
                  className="flex-1 py-3 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Pause Delivery
                </button>
                <button 
                  onClick={() => { setModal({ type: 'CANCEL', subId: sub.id }); setStartDate(minDateStr); }}
                  className="flex-1 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                  Cancel Auto-Renew
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative">
            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
              {modal.type === 'PAUSE' ? 'Pause Deliveries' : 'Cancel Subscription'}
            </h3>
            <p className="text-slate-500 font-light text-sm mb-8 leading-relaxed">
              {modal.type === 'PAUSE' 
                ? 'Going out of town? Select the dates you want to pause your deliveries. The earliest valid change date is 7 days from today.'
                : 'Choose when you would like your final delivery. Auto-renew will be permanently disabled after this date.'}
            </p>

            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {modal.type === 'PAUSE' ? 'Pause Starts On' : 'Cancel Date'}
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  min={minDateStr}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium"
                />
              </div>

              {modal.type === 'PAUSE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Resume On
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    min={startDate || minDateStr}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium"
                  />
                </div>
              )}

              {error && <p className="text-xs font-medium text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setModal({ type: null, subId: null })}
                className="flex-1 py-4 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                Keep Active
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading || !startDate || (modal.type === 'PAUSE' && !endDate)}
                className={`flex-1 py-4 text-sm font-medium text-white rounded-full transition-all flex items-center justify-center ${
                  modal.type === 'CANCEL' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-black'
                } disabled:opacity-50`}>
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  modal.type === 'PAUSE' ? 'Confirm Pause' : 'Confirm Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
