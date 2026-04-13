"use client";

import { useEffect, useState } from "react";
import DeliveryHeader from "../components/DeliveryHeader";
import { Receipt, AlertCircle, ArrowLeft, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { fetchDpPayouts } from "../actions";

interface PayoutRecord {
  id: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentDate: string;
  status: string;
}

export default function PayoutPage() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDpPayouts()
      .then(setPayouts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-20">
      <DeliveryHeader title="Payouts" />

      <main className="w-full px-6 lg:px-12 py-8 space-y-8 max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/staff/dp/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block mr-2">
            <ArrowLeft className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
          </Link>
          <h2 className="text-2xl font-medium tracking-tight text-slate-900">Earnings & Payouts</h2>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-900 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading payouts...</p>
          </div>
        ) : payouts.length > 0 ? (
          <div className="grid gap-4">
            {payouts.map(payout => (
              <div key={payout.id} className="bg-white border border-[#EFEFEF] rounded-[1.5rem] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Receipt className="h-5 w-5 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Earnings Payout</h3>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                      {new Date(payout.startDate).toLocaleDateString()} — {new Date(payout.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end">
                  <span className="text-2xl font-semibold text-slate-900">
                    ₹{payout.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-50 text-green-700 mt-2">
                    {payout.status} on {new Date(payout.paymentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border text-center border-[#EFEFEF] rounded-3xl p-10 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Receipt className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No payouts yet</h3>
             <p className="text-sm text-gray-400 mt-2 max-w-sm">
               Your processed payouts will appear here once they are initiated by the administration.
             </p>
          </div>
        )}
      </main>
    </div>
  );
}
