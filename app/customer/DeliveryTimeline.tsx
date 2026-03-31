import React from 'react';

interface DeliveryRecord {
  id: number;
  deliveryDate: string; // e.g. "2026-04-01"
  status: string; // e.g. "DELIVERED", "PENDING", "CANCELLED"
  publicationName: string; // e.g. "The Hindu, Business Today"
  dailyCost: number;
}

interface Props {
  deliveries: DeliveryRecord[];
}

export default function DeliveryTimeline({ deliveries }: Props) {
  // Map array to group by date
  // Actually, backend returns an array organized by date desc natively.
  // Wait, backend might return multiple records per date if there are multiple subscriptions. 
  // Let's group them by date just in case.

  const grouped = deliveries.reduce((acc, curr) => {
    if (!acc[curr.deliveryDate]) acc[curr.deliveryDate] = [];
    acc[curr.deliveryDate].push(curr);
    return acc;
  }, {} as Record<string, DeliveryRecord[]>);

  // Get last 7 days keys (or all available sorted desc)
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Generate a sleek 7-day ribbon (last 7 days from today)
  const today = new Date();
  const ribbonDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // "S","M","T", etc.
    const isToday = i === 6;
    
    // Check if we have any delivered record for this date
    const dayRecords = grouped[isoDate] || [];
    const hasSuccessfulDelivery = dayRecords.some(r => r.status === 'DELIVERED');
    const hasPendingDelivery = dayRecords.some(r => r.status === 'PENDING');

    return {
      isoDate,
      dayName,
      isToday,
      hasSuccessfulDelivery,
      hasPendingDelivery,
      hasAny: dayRecords.length > 0
    };
  });

  return (
    <div className="mt-16 w-full max-w-3xl">
      <h3 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Delivery Timeline</h3>
      <p className="text-slate-500 font-light mb-8 text-sm max-w-xl">
        A chronological breakdown of your daily deliveries and micropayments.
      </p>

      {/* Week Ribbon */}
      <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {ribbonDays.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              day.hasSuccessfulDelivery 
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                : day.hasPendingDelivery 
                  ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' 
                  : day.isToday 
                    ? 'bg-slate-900 text-white ring-2 ring-offset-2 ring-slate-900' 
                    : 'bg-transparent text-slate-400 border border-slate-200'
            }`}>
              {day.dayName}
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              {new Date(day.isoDate).getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* Vertical List */}
      <div className="flex flex-col gap-0 border-t border-slate-100">
        {sortedDates.length === 0 ? (
          <p className="text-slate-500 font-light text-sm py-8">
            No recent deliveries to show. Your upcoming schedule will appear here.
          </p>
        ) : (
          sortedDates.map((dateStr) => {
            const dayRecords = grouped[dateStr];
            const dateObj = new Date(dateStr);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            // Calculate total cost for the day
            const totalCost = dayRecords.reduce((sum, r) => sum + (r.dailyCost || 0), 0);

            return (
              <div key={dateStr} className="flex items-start justify-between py-6 border-b border-slate-100 group">
                <div className="flex items-start flex-col gap-1">
                  <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">
                    {formattedDate}
                  </span>
                  
                  {dayRecords.map(record => (
                    <div key={record.id} className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        record.status === 'DELIVERED' ? 'bg-emerald-400' 
                        : record.status === 'PENDING' ? 'bg-amber-400' 
                        : 'bg-red-400'
                      }`} />
                      <p className="text-slate-900 font-medium text-base">
                        {record.publicationName || 'Newspaper/Magazine'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-slate-500 font-light text-base tabular-nums">
                    &#8377;{totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}