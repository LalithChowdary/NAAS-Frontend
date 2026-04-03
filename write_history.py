content = """'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { fetchDpHistory } from '../actions';

interface DeliveryPersonHistoryResponse {
  id: number;
  subscriptionId: number;
  deliveryDate: string;
  status: string;
  publications: string;
  customerName: string;
  customerAddress: string;
  totalValue: number;
  payout: number;
}

export default function DeliveryHistoryClient() {
  const [actualDeliveries, setActualDeliveries] = useState<DeliveryPersonHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  useEffect(() => {
    fetchDpHistory()
      .then((data) => {
        setActualDeliveries(data || []);
      })
      .catch(err => console.error("Error fetching history", err))
      .finally(() => setLoading(false));
  }, []);

  const dates = useMemo(() => {
    const datesArr: Date[] = [];
    const base = new Date();
    base.setHours(0,0,0,0);
    for (let i = -30; i <= 30; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        datesArr.push(d);
    }
    return datesArr;
  }, []);

  const sliderRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (sliderRef.current) {
        const targetElement = sliderRef.current.querySelector('[data-isselected="true"]') || sliderRef.current.querySelector('[data-istoday="true"]');
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }
  }, []);

  const selectedDateString = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0')
  ].join('-'); 

  const activeDeliveries = useMemo(() => {
    return actualDeliveries.filter(d => d.deliveryDate === selectedDateString);
  }, [actualDeliveries, selectedDateString]);

  const totalDailyPayout = activeDeliveries.reduce((sum, item) => sum + item.payout, 0);

  const getStatusConfig = (status: string) => {
    const s = status ? status.toUpperCase() : '';
    switch (s) {
      case 'DELIVERED': return { color: 'bg-emerald-500', label: 'Delivered' };
      case 'PENDING': return { color: 'bg-amber-400', label: 'Pending' };
      case 'CANCELLED': return { color: 'bg-rose-400', label: 'Cancelled' };
      default: return { color: 'bg-slate-300', label: s || 'Unknown' };
    }
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  };

  const isSelected = (d: Date) => {
    return d.getTime() === selectedDate.getTime();
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
         <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin"></div>
         <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading Ledger...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto">
      <div className="w-full mb-12">
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Date</h2>
        </div>

        <div className="relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none"></div>
          
          <div 
            ref={sliderRef}
            className="flex items-center gap-3 overflow-x-auto pb-6 pt-2 px-8 snap-x snap-mandatory hide-scrollbar"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {dates.map((d, i) => {
              const sel = isSelected(d);
              const tod = isToday(d);

              return (
                <button
                  key={i}
                  data-isselected={sel}
                  data-istoday={tod}
                  onClick={() => setSelectedDate(d)}
                  className={`
                    snap-center flex-shrink-0 flex flex-col items-center justify-center 
                    w-14 h-20 rounded-full transition-all duration-300 cursor-pointer
                    ${sel ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-110 z-10' : 
                      tod ? 'bg-white text-slate-900 border border-slate-200 shadow-sm' : 
                      'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm border border-transparent hover:border-slate-100'}
                  `}
                >
                  <span className={`text-[10px] font-semibold tracking-wider ${sel ? 'text-slate-300' : 'text-slate-400'}`}>
                    {daysOfWeek[d.getDay()]}
                  </span>
                  <span className={`text-lg font-bold mt-1 ${sel ? 'text-white' : 'text-slate-800'}`}>
                    {d.getDate()}
                  </span>
                  {tod && !sel && (
                    <div className="w-1 h-1 rounded-full bg-slate-900 mt-1"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100/50">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-8 mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}, {months[selectedDate.getMonth()]} {selectedDate.getDate()}
            </h3>
            <p className="text-sm font-light text-slate-500 mt-1">
              {activeDeliveries.length === 0 ? "No deliveries scheduled." : `${activeDeliveries.length} drop(s) scheduled for today.`}
            </p>
          </div>
          {activeDeliveries.length > 0 && (
            <div className="flex flex-col items-start md:items-end pt-2 md:pt-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Payout</span>
              <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                ${totalDailyPayout.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 min-h-[30vh]">
          {activeDeliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-center h-full">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200 mb-4">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              <span className="text-sm font-medium text-slate-400">Nothing scheduled for delivery on this date.</span>
            </div>
          ) : (
            activeDeliveries.map((delivery, idx) => {
              const conf = getStatusConfig(delivery.status);
              
              return (
                <div 
                  key={idx} 
                  className="group flex flex-col p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1.5 flex items-center justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${conf.color} ring-4 ring-white`}></div>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-lg font-semibold text-slate-900 tracking-tight">
                          {delivery.customerName}
                        </h4>
                        <p className="text-sm font-light text-slate-500 mt-1 max-w-sm leading-relaxed">
                          {delivery.customerAddress}
                        </p>
                        
                        <div className="mt-4 inline-flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-full bg-white border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm shadow-slate-100/50">
                            {delivery.publications}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-base font-semibold text-slate-900 tabular-nums">
                        +${delivery.payout.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                        {conf.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-semibold text-slate-500">Delivered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span className="text-xs font-semibold text-slate-500">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
            <span className="text-xs font-semibold text-slate-500">Cancelled</span>
          </div>
        </div>

      </div>
    </div>
  );
}
"""

with open('/Users/lalith/snu/sem6/swe/lab/code_implimentaion/frontend/app/staff/dp/history/DeliveryHistoryClient.tsx', 'w') as f:
    f.write(content)
