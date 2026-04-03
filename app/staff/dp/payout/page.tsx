"use client";

import DeliveryHeader from "../components/DeliveryHeader";
import { Receipt, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PayoutPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-20">
      <DeliveryHeader title="Payouts" />

      <main className="w-full px-6 lg:px-12 py-8 space-y-8 max-w-3xl mx-auto">
        
        <div className="flex items-center mb-6">
          <Link href="/staff/dp" className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block mr-2">
            <ArrowLeft className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
          </Link>
          <h2 className="text-2xl font-medium tracking-tight text-slate-900">Earnings & Payouts</h2>
        </div>

        <div className="bg-white border text-center border-[#EFEFEF] rounded-3xl p-10 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Receipt className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
           </div>
           <h3 className="text-lg font-medium text-gray-900">Payout system pending integration</h3>
           <p className="text-sm text-gray-400 mt-2 max-w-sm">
             Calculating payouts based on dynamic commissions and historical delivery data will be available here soon.
           </p>
           
           <div className="mt-8 flex items-center justify-center text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-sm border border-amber-100">
              <AlertCircle className="h-4 w-4 mr-2" /> Note: Only visible inside full deployment
           </div>
        </div>
      </main>
    </div>
  );
}
