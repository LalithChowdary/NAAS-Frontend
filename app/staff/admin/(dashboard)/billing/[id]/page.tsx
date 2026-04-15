"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2, CreditCard, Calendar, Clock, Download, CheckCircle, X } from "lucide-react";
import { fetchAdminBillById, markAdminBillStatus, recordPayment } from "../../../actions";

interface BillItem {
  id: string;
  publicationName: string;
  deliveriesCount: number;
  pricePerUnit: number;
  itemAmount: number;
}

interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  billingMonth: string;
  totalAmount: number;
  dueDate: string;
  status: "PAID" | "UNPAID";
  createdAt: string;
  items: BillItem[];
}

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [chequeNumber, setChequeNumber] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const billId = params.id as string;
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminBillById(billId);
      if (res.ok && res.data) {
        setBill(res.data);
      } else {
        setError(res.message || "Failed to load bill details.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId) {
      loadData();
    } else {
      setError("Invalid Bill ID");
      setLoading(false);
    }
  }, [billId]);

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill) return;

    try {
      setActionLoading(true);
      // First save the payment record
      const paymentRes = await recordPayment(bill.id, bill.totalAmount, paymentMethod, chequeNumber, receiptNote);
      
      if (!paymentRes.ok) {
        alert(paymentRes.message || "Failed to record payment details.");
        return;
      }

      // Then mark the bill status as PAID
      const res = await markAdminBillStatus(billId, "PAID");
      if (res.ok) {
        setPaymentModalOpen(false);
        await loadData();
      } else {
        alert(res.message || "Payment recorded, but failed to update bill status.");
      }
    } catch (err) {
      alert("Failed to submit payment details due to network error.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-gray-500 mb-4">{error || "Bill not found."}</p>
        <button onClick={() => router.back()} className="text-black hover:underline font-medium">Go back to Bills</button>
      </div>
    );
  }

  // Dynamic UI status (determine overdue)
  const isOverdue = bill.status === 'UNPAID' && new Date(bill.dueDate) < new Date();
  const uiStatus = isOverdue ? 'OVERDUE' : (bill.status === 'PAID' ? 'PAID' : 'PENDING');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/staff/admin/billing')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span className="hover:text-gray-900 cursor-pointer" onClick={() => router.push('/staff/admin/billing')}>Billing</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-900">Details</span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
              Bill #{bill.id}
              <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                uiStatus === 'PAID' 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : uiStatus === 'OVERDUE'
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}>
                {uiStatus}
              </span>
            </h1>
          </div>
        </div>

        {/* Global Bill Actions */}
        <div className="flex items-center gap-2">
           {uiStatus !== 'PAID' && (
             <button 
               onClick={() => setPaymentModalOpen(true)}
               disabled={actionLoading}
               className="inline-flex items-center px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
             >
               {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
               Mark as Paid
             </button>
           )}
           <button 
             onClick={() => window.print()}
             className="inline-flex items-center px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
           >
             <Download className="h-4 w-4 mr-2 text-gray-500" />
             Download PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <div className="md:col-span-1 border border-[#EFEFEF] bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-fit">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Bill Details</h3>
          
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Customer</p>
                <button 
                  onClick={() => router.push(`/staff/admin/customers/${bill.customerId}`)} 
                  className="text-sm font-medium text-gray-900 truncate hover:underline"
                >
                  {bill.customerName}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Billing Month</p>
                <p className="text-sm font-medium text-gray-900">{bill.billingMonth}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(bill.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <span className="text-gray-400 font-semibold text-sm">₹</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">₹{bill.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Items Table */}
        <div className="md:col-span-2 border border-[#EFEFEF] bg-white rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="px-6 py-5 border-b border-[#EFEFEF] flex justify-between items-center">
             <h3 className="text-sm font-medium text-gray-900">Included Publications (<span className="text-gray-500 font-normal">{bill.billingMonth}</span>)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Publication Name</th>
                  <th className="px-6 py-4 text-center">Deliveries</th>
                  <th className="px-6 py-4 text-right">Unit Price</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF]">
                {!bill.items || bill.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <p>No publications found in this bill.</p>
                    </td>
                  </tr>
                ) : (
                  bill.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FBFBFD] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.publicationName}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100">
                           {item.deliveriesCount} days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        ₹{item.pricePerUnit?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ₹{item.itemAmount?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>

      {/* Payment Details Modal */}
      {paymentModalOpen && bill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleMarkPaid} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={bill.totalAmount}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-gray-900 font-medium cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Full amount must be settled.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              {paymentMethod === "CHEQUE" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Note / Reference (Optional)</label>
                <textarea 
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder="e.g. Transaction ID, remarks, etc."
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
