'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';

interface DeliveryRecord {
  id: number;
  deliveryDate: string; // "YYYY-MM-DD"
  status: string; // PENDING, DELIVERED, EXPECTED, CANCELLED
  publicationName: string;
  dailyCost: number;
}

interface SubscriptionItem {
  id: number;
  publicationName: string;
  price: number;
  frequency: string;
  customDeliveryDays?: string | null;
}

interface Subscription {
  id: number;
  items?: SubscriptionItem[];
  status: string; // ACTIVE, CANCELLED
  startDate: string; // "YYYY-MM-DD"
  endDate?: string | null;
  suspendStartDate?: string | null;
  suspendEndDate?: string | null;
}

export default function DeliveriesLedgerClient({ 
  actualDeliveries, 
  subscriptions 
}: { 
  actualDeliveries: DeliveryRecord[], 
  subscriptions: Subscription[] 
}) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [anchorDate, setAnchorDate] = useState<Date>(today);
  
  // Generate slider array from -30 to +30 days around anchor
  const sliderDates = useMemo(() => {
    const dates: Date[] = [];
    const base = new Date(anchorDate);
    base.setHours(0,0,0,0);
    for (let i = -30; i <= 30; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        dates.push(d);
    }
    return dates;
  }, [anchorDate]);

  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to selected/anchor
  useEffect(() => {
    if (sliderRef.current) {
        // slightly wrap in setTimeout to allow render layout to complete
        setTimeout(() => {
            const targetElement = sliderRef.current?.querySelector('[data-isselected="true"]') || sliderRef.current?.querySelector('[data-istoday="true"]');
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 50);
    }
  }, [anchorDate]);

  const selectedDateString = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0')
  ].join('-'); 
  
  // Direct Generation Logic off Active Subscriptions
  const projectedDeliveries = useMemo(() => {
    console.log("SUBS:", JSON.stringify(subscriptions, null, 2));
    const projected: DeliveryRecord[] = [];
    let fakeIdCounter = -1;
    
    const actualsForToday = (actualDeliveries || []).filter(d => d.deliveryDate === selectedDateString);
    if (actualsForToday.length > 0) {
      return actualsForToday;
    }

    (subscriptions || []).forEach(sub => {
       if (sub.status !== 'ACTIVE') return;
       if (!sub.startDate) return;
       const parseDate = (d: any): Date => {
           if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2], 0, 0, 0, 0);
           if (typeof d === 'string') {
               const justDate = d.split('T')[0]; // extract only the YYYY-MM-DD part
               const [y, m, day] = justDate.split('-');
               return new Date(Number(y), Number(m) - 1, Number(day), 0, 0, 0, 0);
           }
           return new Date(d);
       };

       const sd = parseDate(sub.startDate);
       if (selectedDate < sd) return; 
       
       if (sub.endDate) {
           const ed = parseDate(sub.endDate);
           if (selectedDate > ed) return; 
       }
       
       if (sub.suspendStartDate && sub.suspendEndDate) {
           const susStart = parseDate(sub.suspendStartDate);
           const susEnd = parseDate(sub.suspendEndDate);
           if (selectedDate >= susStart && selectedDate <= susEnd) return; 
       }

       (sub.items || []).forEach(item => {
           let shouldDeliver = false;
           // Use Math.round to avoid Daylight Savings Time floating point drift
           const timeDiff = selectedDate.getTime() - sd.getTime();
           const diffDays = Math.round(timeDiff / (1000 * 60 * 60 * 24));
           
           const freq = (item.frequency || 'DAILY').toUpperCase();
           
           if (freq === 'DAILY') {
               shouldDeliver = true;
           } else if (freq === 'ALTERNATE') {
               shouldDeliver = diffDays % 2 === 0;
           } else if (freq === 'EVERY_3_DAYS' || freq === 'EVERY-3-DAYS' || freq === 'EVERY 3 DAYS') {
               shouldDeliver = diffDays % 3 === 0;
           } else if (freq === 'WEEKLY') {
               shouldDeliver = selectedDate.getDay() === sd.getDay();
           } else if (freq === 'MONTHLY') {
               if (selectedDate.getDate() === sd.getDate()) {
                   shouldDeliver = true;
               }
           } else if (freq === 'CUSTOM' && item.customDeliveryDays) {
               const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
               const todayName = dayNames[selectedDate.getDay()];
               if (item.customDeliveryDays.includes(todayName)) {
                   shouldDeliver = true;
               }
           }
           
           if (shouldDeliver) {
               projected.push({
                   id: fakeIdCounter--, 
                   deliveryDate: selectedDateString,
                   status: selectedDate > today ? 'EXPECTED' : 'PENDING',
                   publicationName: item.publicationName,
                   dailyCost: item.price
               });
           }
       });
    });
    
    return projected;
  }, [selectedDate, subscriptions, actualDeliveries, selectedDateString, today]);


  const formatDayAbbr = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'narrow' });
  const formatDateNum = (d: Date) => d.getDate().toString();
  const totalCostForDay = projectedDeliveries.reduce((sum, item) => sum + (item.dailyCost || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.04] px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link href="/customer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Delivery History</h1>
         </div>
      </header>

      <main className="max-w-3xl mx-auto mt-8 px-6">
        <section className="mb-10 w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Select Date</h2>
                 <div className="relative group cursor-pointer w-6 h-6 flex items-center justify-center overflow-hidden">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-900 transition-colors">
                     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                     <line x1="16" y1="2" x2="16" y2="6"/>
                     <line x1="8" y1="2" x2="8" y2="6"/>
                     <line x1="3" y1="10" x2="21" y2="10"/>
                   </svg>
                   <input 
                     type="date" 
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     value={selectedDateString}
                     onChange={(e) => {
                       const val = e.target.value;
                       if (!val) return;
                       const [y, m, d] = val.split('-');
                       const newDate = new Date(Number(y), Number(m)-1, Number(d), 0,0,0,0);
                       setAnchorDate(newDate);
                       setSelectedDate(newDate);
                     }}
                   />
                 </div>
               </div>
               
               {selectedDate.getTime() !== today.getTime() && (
                  <button 
                    onClick={() => {
                       setSelectedDate(today);
                       setAnchorDate(today);
                    }} 
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                  >
                    Return to Today
                  </button>
               )}
            </div>
            
            <div 
              ref={sliderRef}
              className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide snap-x pt-2 flex-nowrap"
              style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {sliderDates.map((d, i) => {
                    const isSelected = d.getTime() === selectedDate.getTime();
                    const isToday = d.getTime() === today.getTime();
                    
                    return (
                        <div 
                           key={i}
                           data-istoday={isToday}
                           data-isselected={isSelected}
                           onClick={() => {
                             setSelectedDate(d);
                             setAnchorDate(d);
                           }}
                           className={`snap-center flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-full cursor-pointer transition-all duration-300 ${
                               isSelected 
                                 ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' 
                                 : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                           }`}
                        >
                            <span className={`text-[10px] uppercase font-bold mb-1 opacity-70`}>{formatDayAbbr(d)}</span>
                            <span className="text-lg font-semibold">{formatDateNum(d)}</span>
                            {isToday && !isSelected && <div className="w-1 h-1 rounded-full bg-slate-900 mt-1" />}
                            {isToday && isSelected && <div className="w-1 h-1 rounded-full bg-white/50 mt-1" />}
                        </div>
                    );
                })}
            </div>
        </section>

        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm shadow-slate-200/50">
            <header className="flex items-end justify-between border-b border-slate-100 pb-6 mb-6">
                <div>
                   <h3 className="text-2xl font-semibold tracking-tight text-slate-900 capitalize">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                   </h3>
                   <p className="text-sm text-slate-500 mt-1 font-light">
                      {projectedDeliveries.length === 0 ? "No deliveries scheduled." : `${projectedDeliveries.length} publications for this day.`}
                   </p>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-medium tracking-tight text-slate-900">₹{totalCostForDay.toFixed(2)}</div>
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Daily Total</div>
                </div>
            </header>
            
            {projectedDeliveries.length === 0 ? (
               <div className="py-12 text-center text-slate-400 font-light flex flex-col items-center justify-center">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                   Nothing scheduled for delivery on this date.
               </div>
            ) : (
                <div className="space-y-6">
                    {projectedDeliveries.map((delivery) => (
                        <div key={delivery.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                   delivery.status === 'DELIVERED' ? 'bg-emerald-500 ring-4 ring-emerald-50' : 
                                   delivery.status === 'EXPECTED' ? 'bg-indigo-400 ring-4 ring-indigo-50' :
                                   delivery.status === 'CANCELLED' ? 'bg-rose-500 ring-4 ring-rose-50' :
                                   'bg-amber-400 ring-4 ring-amber-50'
                                }`} />
                                <div>
                                    <h4 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition">
                                       {delivery.publicationName}
                                    </h4>
                                    <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
                                       {delivery.status}
                                    </span>
                                </div>
                            </div>
                            <div className="font-medium text-slate-500 tabular-nums">₹{(delivery.dailyCost || 0).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400 justify-between">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 opacity-80"/> Delivered</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400 opacity-80"/> Expected</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 opacity-80"/> Pending</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 opacity-80"/> Cancelled</div>
            </div>
        </section>
      </main>
    </div>
  );
}
