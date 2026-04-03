"use client";

import { useEffect, useState } from "react";
import { getAdminDeliverySchedule, generateAdminDeliverySchedule } from "../../../actions";
import { AlertCircle, Calendar, Loader2, Play } from "lucide-react";

export default function DeliverySchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Date format: YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    // Use local time, format to YYYY-MM-DD
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  });

  const loadSchedule = async (dateStr: string) => {
    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");
      const data = await getAdminDeliverySchedule(dateStr);
      setSchedule(data);
    } catch (err: any) {
      setError(err.message || "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule(selectedDate);
  }, [selectedDate]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError("");
      setSuccessMsg("");
      const result = await generateAdminDeliverySchedule(selectedDate);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccessMsg(result.message);
      // Reload schedule to show newly generated data
      await loadSchedule(selectedDate);
    } catch (err: any) {
      setError(err.message || "Failed to generate schedule.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Delivery Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">View and generate delivery assignments for any date.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm w-full sm:w-auto"
            />
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={generating || loading}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] w-full sm:w-auto shadow-sm"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "Generate Schedule"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center text-sm border border-rose-100">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center text-sm border border-emerald-100">
          <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
          {successMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Person</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Publications</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Loading schedule...</p>
                  </td>
                </tr>
              ) : schedule.length > 0 ? (
                schedule.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 text-sm">{item.assignedTo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{item.customerName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-[200px] truncate" title={item.address}>{item.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{item.publicationName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide
                        ${item.deliveryStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' : 
                          item.deliveryStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 
                          'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'}
                      `}>
                        {item.deliveryStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="w-10 h-10 text-gray-300 mb-3" />
                      <h3 className="text-base font-medium text-gray-900 mb-1">No schedule found</h3>
                      <p className="text-sm text-gray-500 mb-4">There is no delivery schedule found for this date.</p>
                      <button 
                        onClick={handleGenerate}
                        disabled={generating || loading}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Generate it now
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}