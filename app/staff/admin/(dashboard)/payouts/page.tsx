"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Download, RefreshCw, Wallet, User as UserIcon, Loader2, X, CheckCircle2 } from "lucide-react";
import { fetchDeliveryPersonnelPayment, processPersonnelPayout } from "../reports/actions";

interface PayoutRecord {
  deliveryPersonId: string;
  deliveryPersonName: string;
  employeeId: string;
  deliveriesCompleted: number;
  totalDeliveryValue: number;
  paymentAmount: number;
}

function getStartOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function getEndOfMonth() {
  const d = new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
}

export default function PayoutsPage() {
  const [startDate, setStartDate] = useState<string>(getStartOfMonth());
  const [endDate, setEndDate] = useState<string>(getEndOfMonth());
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processedIds, setProcessedIds] = useState<string[]>([]);

  const handleProcess = async (record: PayoutRecord) => {
    if (!confirm(`Are you sure you want to process ₹${record.paymentAmount.toFixed(2)} for ${record.deliveryPersonName}?`)) return;
    
    setProcessingId(record.deliveryPersonId);
    try {
      await processPersonnelPayout(record.deliveryPersonId, startDate, endDate, record.paymentAmount);
      setProcessedIds(prev => [...prev, record.deliveryPersonId]);
    } catch (err: any) {
      alert(err.message || 'Failed to process payout');
    } finally {
      setProcessingId(null);
    }
  };

  const loadPayouts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDeliveryPersonnelPayment(startDate, endDate);
      setPayouts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load payouts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setProcessedIds([]);
    loadPayouts();
  }, [startDate, endDate]);

  const totalPayout = payouts.reduce((sum, record) => sum + record.paymentAmount, 0);
  const totalValue = payouts.reduce((sum, record) => sum + record.totalDeliveryValue, 0);
  const totalDeliveries = payouts.reduce((sum, record) => sum + record.deliveriesCompleted, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Delivery Personnel Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Calculate and manage commission payouts (2.5% of total delivery value).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-[#EFEFEF] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] px-2 py-1">
            <div className="flex items-center px-3 gap-2 border-r border-[#EFEFEF]">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm border-none focus:outline-none focus:ring-0 text-gray-600 bg-transparent font-medium"
              />
            </div>
            <div className="flex items-center px-3 gap-2">
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm border-none focus:outline-none focus:ring-0 text-gray-600 bg-transparent font-medium"
              />
            </div>
          </div>

          <button
            onClick={loadPayouts}
            disabled={isLoading}
            className="p-2 border border-[#EFEFEF] bg-white rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50"
            aria-label="Refresh payouts"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#EFEFEF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Commission Payout</p>
              <h3 className="text-3xl font-medium tracking-tight text-gray-900">₹{totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
              <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 w-fit px-2.5 py-1 rounded-full flex items-center">
                2.5% of Total Value
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBFBFD] border border-[#EFEFEF] flex items-center justify-center text-gray-900">
              <Wallet className="h-5 w-5" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EFEFEF] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Delivery Value</p>
              <h3 className="text-3xl font-medium tracking-tight text-gray-900">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
              <p className="text-xs text-gray-400 mt-2 font-medium">Over the selected date range</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBFBFD] border border-[#EFEFEF] flex items-center justify-center text-gray-900">
              <span className="font-medium text-xl">₹</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#EFEFEF] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Deliveries</p>
              <h3 className="text-3xl font-medium tracking-tight text-gray-900">{totalDeliveries.toLocaleString()}</h3>
              <p className="text-xs text-gray-400 mt-2 font-medium">Successful deliveries completed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBFBFD] border border-[#EFEFEF] flex items-center justify-center text-gray-900">
              <UserIcon className="h-5 w-5" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white border border-[#EFEFEF] rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Employee Info</th>
                <th className="px-6 py-4 text-center">Completed Deliveries</th>
                <th className="px-6 py-4 text-right">Value Delivered</th>
                <th className="px-6 py-4 text-right">Payout (2.5%)</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Loading payouts...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-rose-500">
                    <div className="inline-flex items-center justify-center p-3 bg-rose-50 rounded-full mb-3">
                      <X className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <p className="font-medium text-rose-900">{error}</p>
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Wallet className="h-6 w-6 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
                    <p>No payout data found for this period.</p>
                  </td>
                </tr>
              ) : (
                payouts.map((record) => (
                  <tr key={record.deliveryPersonId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-[#FBFBFD] flex items-center justify-center text-gray-900 font-medium mr-3 border border-[#EFEFEF]">
                          {record.deliveryPersonName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.deliveryPersonName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">ID: {record.employeeId || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                        {record.deliveriesCompleted}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums tracking-tight text-gray-600">
                      ₹{record.totalDeliveryValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums tracking-tight">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{record.paymentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {processedIds.includes(record.deliveryPersonId) ? (
                        <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Processed
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleProcess(record)}
                          disabled={processingId === record.deliveryPersonId}
                          className="text-xs font-medium text-gray-900 bg-white border border-[#EFEFEF] px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 flex items-center justify-center min-w-[90px] mx-auto"
                        >
                          {processingId === record.deliveryPersonId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Process"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .w-64 { display: none !important; }
          header { display: none !important; }
          .space-y-6 { padding: 0 !important; }
          button { display: none !important; }
          input[type="date"] { border: none !important; appearance: none; pointer-events: none;}
          .grid { display: flex !important; gap: 2rem; justify-content: space-between; }
          .grid > div { border: 1px solid #efefef; padding: 1.5rem; flex: 1; border-radius: 1rem; box-shadow: none !important;}
          @page { margin: 1cm; size: landscape; }
        }
      `}} />
    </div>
  );
}
