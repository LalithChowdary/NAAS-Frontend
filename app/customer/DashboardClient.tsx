'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  cancelSubscriptionAction, 
  suspendSubscriptionAction, 
  updateSubscriptionItemAction,
  removeSubscriptionSuspensionAction,
  removeSubscriptionItemSuspensionAction,
  changeSubscriptionAddressAction
} from '../actions/subscription';

type SubscriptionItem = {
  id: string;
  publicationName: string;
  status: string;
  stopStartDate: string | null;
  stopEndDate: string | null;
  type: string;
};

type Subscription = {
  id: string;
  publicationName: string;
  status: string;
  startDate: string;
  endDate: string | null;
  suspendStartDate: string | null;
  suspendEndDate: string | null;
  createdAt: string;
  address?: string;
  addressId?: string;
  items?: SubscriptionItem[];
};

export default function DashboardClient({ subscriptions, addresses }: { subscriptions: Subscription[], addresses?: any[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<{ type: 'PAUSE_SUB' | 'EDIT_PAUSE_SUB' | 'CHANGE_ADDRESS' | 'CANCEL_SUB' | 'PAUSE_ITEM' | 'EDIT_PAUSE_ITEM' | 'CANCEL_ITEM' | null; subId: number | string | null; itemId?: string | null }>({ type: null, subId: null });
  const [newAddressId, setNewAddressId] = useState<string>('');
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
    if (modal.type === 'PAUSE_SUB' || modal.type === 'EDIT_PAUSE_SUB') {
      res = await suspendSubscriptionAction(modal.subId as string, startDate, endDate);
    } else if (modal.type === 'CANCEL_SUB') {
      res = await cancelSubscriptionAction(modal.subId as string, startDate);
    } else if (modal.type === 'PAUSE_ITEM' || modal.type === 'EDIT_PAUSE_ITEM') {
      if (modal.itemId) {
        res = await updateSubscriptionItemAction(modal.subId, modal.itemId, 'SUSPENDED', startDate, endDate);
      }
    } else if (modal.type === 'CANCEL_ITEM' && modal.itemId) {
      res = await updateSubscriptionItemAction(modal.subId, modal.itemId, 'REMOVED', startDate, null);
    } else if (modal.type === 'CHANGE_ADDRESS') {
      res = await changeSubscriptionAddressAction(modal.subId, newAddressId);
    }

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setModal({ type: null, subId: null, itemId: null });
      setLoading(false);
      router.refresh(); // Refresh Sever Component automatically
    }
  };

  const handleRemoveSuspension = async () => {
    if (!modal.subId) return;
    setLoading(true);
    setError('');

    let res;
    if (modal.type === 'EDIT_PAUSE_SUB') {
      res = await removeSubscriptionSuspensionAction(modal.subId as string);
    } else if (modal.type === 'EDIT_PAUSE_ITEM' && modal.itemId) {
      res = await removeSubscriptionItemSuspensionAction(modal.subId, modal.itemId);
    }

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setModal({ type: null, subId: null, itemId: null });
      setLoading(false);
      router.refresh();
    }
  };

  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'SUSPENDED');
  const pastSubs = subscriptions.filter(s => s.status === 'CANCELLED');

  return (
    <div data-testid="customer-dashboard" className="mt-16">
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
            <div key={sub.id} data-testid={`sub-card-${sub.id}`} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                      sub.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {sub.status}
                    </span>
                    {sub.suspendStartDate && sub.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => { 
                          setModal({ type: 'EDIT_PAUSE_SUB', subId: sub.id }); 
                          setStartDate(sub.suspendStartDate as string);
                          setEndDate(sub.suspendEndDate || '');
                        }}
                        className="text-[10px] font-medium text-amber-600 bg-amber-50/50 hover:bg-amber-100 hover:text-amber-700 px-2 py-1 rounded-full border border-amber-100/50 hover:border-amber-200 transition-colors cursor-pointer"
                        title="Edit Suspension"
                      >
                        Pause from {new Date(sub.suspendStartDate).toLocaleDateString()} to {sub.suspendEndDate ? new Date(sub.suspendEndDate).toLocaleDateString() : 'Indefinitely'}
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl font-medium tracking-tight text-slate-900">{sub.publicationName || "Mixed Subscription"}</h3>
                  <p className="text-xs text-slate-400 mt-1">Starting {new Date(sub.startDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right max-w-[200px]">
                   <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Delivery Address</p>
                   <p className="text-sm text-slate-900 truncate" title={sub.address || 'Direct pickup'}>{sub.address || 'Direct pickup'}</p>
                   {addresses && addresses.length > 0 && (
                     <button
                       onClick={() => { setModal({ type: 'CHANGE_ADDRESS', subId: sub.id }); setNewAddressId(sub.addressId || ''); }}
                       className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest mt-1 block ml-auto"
                     >
                       Change
                     </button>
                   )}
                </div>
              </div>

              {sub.items && sub.items.length > 0 && (
                <div className="mb-6 flex-1 flex flex-col gap-3 border-t border-slate-50 pt-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Items Included</p>
                  {sub.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="flex flex-wrap gap-2 items-center mb-1">
                          <p className="text-sm font-medium text-slate-900">{item.publicationName}</p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                            item.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-700' :
                            item.status === 'REMOVED' ? 'bg-red-100 text-red-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.status}
                          </span>
                          {item.stopStartDate && item.status !== 'REMOVED' && (
                            <button 
                              onClick={() => {
                                setModal({ type: 'EDIT_PAUSE_ITEM', subId: sub.id, itemId: item.id });
                                setStartDate(item.stopStartDate as string);
                                setEndDate(item.stopEndDate || '');
                              }}
                              className="text-[9px] font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 px-2 py-0.5 rounded border border-amber-100 hover:border-amber-200 transition-colors cursor-pointer"
                              title="Edit Pause"
                            >
                              Pause from {new Date(item.stopStartDate).toLocaleDateString()} to {item.stopEndDate ? new Date(item.stopEndDate).toLocaleDateString() : 'Indefinitely'}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 capitalize">{item.type.toLowerCase()}</p>
                      </div>
                      
                      {item.status !== 'REMOVED' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setModal({ type: 'PAUSE_ITEM', subId: sub.id, itemId: item.id }); setStartDate(minDateStr); setEndDate(''); }}
                            disabled={item.status === 'SUSPENDED'}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            title="Pause Item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>
                          </button>
                          <button 
                            onClick={() => { setModal({ type: 'CANCEL_ITEM', subId: sub.id, itemId: item.id }); setStartDate(minDateStr); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                <button 
                  data-testid="pause-sub-btn"
                  onClick={() => { setModal({ type: 'PAUSE_SUB', subId: sub.id }); setStartDate(minDateStr); setEndDate(''); }}
                  disabled={sub.status === 'SUSPENDED'}
                  className="flex-1 py-3 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Pause Delivery
                </button>
                <button 
                  data-testid="cancel-sub-btn"
                  onClick={() => { setModal({ type: 'CANCEL_SUB', subId: sub.id }); setStartDate(minDateStr); }}
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
              {modal.type === 'CHANGE_ADDRESS' ? 'Change Delivery Address' : modal.type.includes('PAUSE') ? (modal.type.startsWith('EDIT') ? 'Edit Pause' : 'Pause Deliveries') : 'Cancel Subscription'}
            </h3>
            <p className="text-slate-500 font-light text-sm mb-8 leading-relaxed">
              {modal.type === 'CHANGE_ADDRESS' 
                ? 'Select a new address for your deliveries. Only your saved addresses are shown below.' 
                : modal.type.includes('PAUSE') 
                ? 'Select the dates you want to pause your deliveries. The earliest valid change date is 2 days from today.'
                : 'Choose when you would like your final delivery. Auto-renew will be permanently disabled after this date.'}
            </p>

            <div className="space-y-5 mb-8">
              {modal.type === 'CHANGE_ADDRESS' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Delivery Address
                  </label>
                  <select 
                    value={newAddressId} 
                    onChange={e => setNewAddressId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium"
                  >
                    <option value="" disabled>Select an address</option>
                    {addresses?.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} - {addr.address}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {modal.type.includes('PAUSE') ? 'Pause Starts On' : 'Cancel Date'}
                </label>
                <input 
                  type="date" 
                  data-testid="pause-start-date"
                  value={startDate}
                  min={minDateStr}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium"
                />
              </div>
              )}

              {modal.type.includes('PAUSE') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Resume On
                  </label>
                  <input 
                    type="date" 
                    data-testid="pause-end-date"
                    value={endDate}
                    min={startDate || minDateStr}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium"
                  />
                </div>
              )}

              {error && <p data-testid="pause-modal-error" className="text-xs font-medium text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}
            </div>

            <div className="flex flex-col gap-3">
              {(modal.type === 'EDIT_PAUSE_SUB' || modal.type === 'EDIT_PAUSE_ITEM') && (
                <button 
                  onClick={handleRemoveSuspension}
                  disabled={loading}
                  className="w-full py-3 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors mb-2">
                  Cancel Suspension
                </button>
              )}
              <div className="flex gap-4">
                <button 
                  onClick={() => setModal({ type: null, subId: null, itemId: null })}
                  className="flex-1 py-4 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                  Close
                </button>
                <button 
                  onClick={handleSubmit}
                  data-testid="confirm-action-btn"
                  disabled={loading || (modal.type === 'CHANGE_ADDRESS' ? !newAddressId : !startDate)}
                  className={`flex-1 py-4 text-sm font-medium text-white rounded-full transition-all flex items-center justify-center ${
                    modal.type.includes('CANCEL') ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-black'
                  } disabled:opacity-50`}>
                  {loading ? (
                     <div data-testid="loader-spinner" className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    modal.type === 'CHANGE_ADDRESS' ? 'Save Address' : modal.type.includes('PAUSE') ? 'Save Dates' : 'Confirm Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
