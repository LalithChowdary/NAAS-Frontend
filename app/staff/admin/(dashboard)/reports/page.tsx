'use client';

import { useEffect, useState } from "react";
import { Printer, Download, Eye, AlertCircle, Loader2 } from "lucide-react";
import { 
  fetchMonthlySummary, 
  fetchOutstandingDues, 
  fetchDeliverySummary, 
  fetchDeliveryPersonnelPayment, 
  fetchWhoReceivedWhat 
} from "./actions";

type ReportType = 
  | 'monthly-summary'
  | 'outstanding-dues'
  | 'delivery-summary'
  | 'delivery-personnel-payment'
  | 'who-received-what';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('monthly-summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [monthStr, setMonthStr] = useState(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  });
  const [startDateStr, setStartDateStr] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDateStr, setEndDateStr] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().split('T')[0];
  });

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      setData(null);

      let payload;
      switch(activeReport) {
        case "monthly-summary":
          payload = await fetchMonthlySummary(monthStr); break;
        case "outstanding-dues":
          payload = await fetchOutstandingDues(); break;
        case "delivery-summary":
          payload = await fetchDeliverySummary(startDateStr, endDateStr); break;
        case "delivery-personnel-payment":
          payload = await fetchDeliveryPersonnelPayment(startDateStr, endDateStr); break;
        case "who-received-what":
          payload = await fetchWhoReceivedWhat(startDateStr, endDateStr); break;
      }
      
      setData(payload);
    } catch (err: any) {
      setError("Failed to load report data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReport();
    }, 400); // slight debounce for smooth switching
    return () => clearTimeout(timer);
  }, [activeReport, monthStr, startDateStr, endDateStr]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:bg-white print:m-0 print:p-0">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate operational and financial summaries.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4 mr-2" strokeWidth={2} />
            Print / PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center text-sm border border-rose-100 print:hidden">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Controls: Report Selector & Filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] print:hidden overflow-x-auto">
        <select
          value={activeReport}
          onChange={(e) => setActiveReport(e.target.value as ReportType)}
          className="px-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm text-gray-900 font-medium outline-none transition-all cursor-pointer min-w-[220px]"
        >
          <option value="monthly-summary">Monthly Summary</option>
          <option value="outstanding-dues">Outstanding Dues</option>
          <option value="delivery-summary">Delivery Summary</option>
          <option value="delivery-personnel-payment">Delivery Personnel Payment</option>
          <option value="who-received-what">Who Received What</option>
        </select>

        <div className="h-full w-px bg-gray-100 hidden md:block mx-1"></div>

        {activeReport === 'monthly-summary' ? (
          <div className="flex items-center">
            <span className="text-xs text-gray-400 font-medium ml-2 mr-3 uppercase tracking-wider">Target Month</span>
            <input 
              type="text" 
              placeholder="MM-YYYY" 
              value={monthStr} 
              onChange={e => setMonthStr(e.target.value)}
              className="w-32 px-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm outline-none transition-all"
            />
          </div>
        ) : activeReport !== 'outstanding-dues' ? (
          <div className="flex items-center flex-wrap gap-2">
             <span className="text-xs text-gray-400 font-medium ml-2 mr-1 uppercase tracking-wider">Date Range</span>
             <input type="date" value={startDateStr} onChange={e => setStartDateStr(e.target.value)} 
                     className="px-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm outline-none transition-all" />
             <span className="text-gray-300 px-1">-</span>
             <input type="date" value={endDateStr} onChange={e => setEndDateStr(e.target.value)} 
                     className="px-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm outline-none transition-all" />
          </div>
        ) : null}
      </div>

      {/* Render Area */}
      <div className="print:block">

        <div className="hidden print:block mb-8">
           <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-300 pb-2">
             {activeReport.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
           </h2>
           <p className="text-sm text-gray-600 mt-2">
             {activeReport === 'monthly-summary' ? `Month: ${monthStr}` : 
              activeReport === 'outstanding-dues' ? `As of: ${new Date().toLocaleDateString()}` :
              `From ${startDateStr} to ${endDateStr}`}
           </p>
        </div>

        {loading ? (
             <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] p-24 text-center text-gray-400 print:hidden flex flex-col items-center">
               <Loader2 className="h-6 w-6 animate-spin mb-3" strokeWidth={1.5} />
               <span>Connecting and compiling report...</span>
             </div>
        ) : (
             <ReportTable type={activeReport} data={data} />
        )}
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 15mm; size: landscape; }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
          }
          nav, aside, header { display: none !important; }
        }
      `}</style>

    </div>
  );
}

// Minimal, consistent presentation layer
function ReportTable({ type, data }: { type: ReportType, data: any }) {
  if (!data) return null;

  // Render Dashboard Cards instead of table for monthly overview
  if (type === 'monthly-summary') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Active Subscriptions" value={data.totalActiveSubscriptions} highlight />
        <MetricCard label="Total Billed" value={`₹${data.totalBilled?.toFixed(2) || '0.00'}`} />
        <MetricCard label="Total Payments Collected" value={`₹${data.totalCollected?.toFixed(2) || '0.00'}`} />
        <MetricCard label="Total Deliveries Target" value={data.totalDeliveries} />
        <MetricCard label="Successful Deliveries" value={data.successfulDeliveries} />
        <MetricCard label="Avg. Success Rate" value={data.totalDeliveries ? `${Math.round(data.successfulDeliveries / data.totalDeliveries * 100)}%` : '0%'} highlight />
      </div>
    );
  }

  // List Rendering
  const items = Array.isArray(data) ? data : [];
  
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-16 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] text-center text-gray-400 print:hidden">
        No records found for the selected criteria.
      </div>
    );
  }

  // Consistent Table format duplicating the exact classes of CustomersPage table
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] overflow-hidden print:border-gray-300 print:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
          <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-500 font-medium print:bg-gray-100 print:text-black">
            <tr>
              {Object.keys(items[0]).map(key => {
                 // Format camelCase to Title Words (e.g. customerName => Customer Name)
                 const title = key.replace(/([A-Z])/g, ' $1').trim();
                 return <th key={key} className="px-6 py-4 font-medium capitalize">{title}</th>;
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFEFEF]">
            {items.map((row, i) => (
              <tr key={i} className="hover:bg-[#FBFBFD] transition-colors group print:text-black">
                {Object.values(row).map((val: any, j) => (
                  <td key={j} className="px-6 py-3.5">
                    {/* Make money values distinct slightly */}
                    {typeof val === 'number' && String(val).includes('.') 
                      ? <span className="font-medium text-gray-900 tracking-tight">₹{val.toFixed(2)}</span>
                      : String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-6 ${highlight ? 'bg-gray-900 border-gray-900 text-white print:bg-white print:text-black print:border-gray-200 print:border' : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]'}`}>
      <p className={`text-xs font-medium uppercase tracking-widest mb-4 ${highlight ? 'text-gray-400 print:text-gray-500' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-3xl tracking-tight ${highlight ? 'font-semibold' : 'font-medium text-gray-900'}`}>{value}</p>
    </div>
  );
}
