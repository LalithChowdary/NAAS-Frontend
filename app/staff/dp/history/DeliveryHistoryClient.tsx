'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [actualDeliveries, setActualDeliveries] = useState<DeliveryPersonHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDpHistory();
        setActualDeliveries(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load delivery history.';
        setError(message);
        setActualDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const sliderDates = useMemo(() => {
    const dates: Date[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = -30; i <= 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
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

  const selectedDateString = useMemo(() => [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0')
  ].join('-'), [selectedDate]);

  const activeDeliveries = useMemo(() => {
    return actualDeliveries.filter((delivery) => {
      const deliveryDate = String(delivery.deliveryDate || '').split('T')[0];
      return deliveryDate === selectedDateString;
    });
  }, [actualDeliveries, selectedDateString]);

  const totalDailyPayout = activeDeliveries.reduce((sum, item) => sum + item.payout, 0);

  const getStatusConfig = (status: string) => {
    const s = status ? status.toUpperCase() : '';
    switch (s) {
      case 'DELIVERED':
        return { color: 'bg-emerald-500 ring-4 ring-emerald-50', label: 'DELIVERED' };
      case 'EXPECTED':
        return { color: 'bg-indigo-400 ring-4 ring-indigo-50', label: 'EXPECTED' };
      case 'CANCELLED':
        return { color: 'bg-rose-500 ring-4 ring-rose-50', label: 'CANCELLED' };
      default:
        return { color: 'bg-amber-400 ring-4 ring-amber-50', label: 'PENDING' };
    }
  };

  const formatDayAbbr = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'narrow' });
  const formatDateNum = (d: Date) => d.getDate().toString();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/4 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff/dp/profile" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Delivery History</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-8 px-6">
        <section className="mb-10 w-full overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Select Date</h2>
            {selectedDate.getTime() !== today.getTime() && (
              <button
                onClick={() => {
                  setSelectedDate(today);
                  setTimeout(() => {
                    const el = sliderRef.current?.querySelector('[data-istoday="true"]');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                  }, 50);
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
                  onClick={() => setSelectedDate(d)}
                  className={`snap-center shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-full cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold mb-1 opacity-70">{formatDayAbbr(d)}</span>
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
                {error
                  ? 'Could not load delivery history.'
                  : loading
                  ? 'Loading delivery history...'
                  : activeDeliveries.length === 0
                    ? 'No deliveries scheduled.'
                    : `${activeDeliveries.length} deliveries for this day.`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-medium tracking-tight text-slate-900">${totalDailyPayout.toFixed(2)}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Daily Payout</div>
            </div>
          </header>

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-light flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-slate-700 animate-spin mb-4" />
              Loading delivery history...
            </div>
          ) : error ? (
            <div className="py-8 flex items-center justify-center">
              <div className="w-full max-w-xl rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700">
                <p className="text-sm font-semibold">Failed to load delivery history</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          ) : activeDeliveries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-light flex flex-col items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
              Nothing scheduled for delivery on this date.
            </div>
          ) : (
            <div className="space-y-6">
              {activeDeliveries.map((delivery) => {
                const status = getStatusConfig(delivery.status);
                return (
                  <div key={delivery.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${status.color}`} />
                      <div>
                        <h4 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition">
                          {delivery.customerName}
                        </h4>
                        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
                          {status.label} • {delivery.publications}
                        </span>
                        {delivery.customerAddress && (
                          <p className="text-xs text-slate-400 mt-1">
                            {delivery.customerAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="font-medium text-slate-500 tabular-nums">
                      ${Number(delivery.payout || 0).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400 justify-between">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 opacity-80" /> Delivered</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400 opacity-80" /> Expected</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 opacity-80" /> Pending</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 opacity-80" /> Cancelled</div>
          </div>
        </section>
      </main>
    </div>
  );
}
