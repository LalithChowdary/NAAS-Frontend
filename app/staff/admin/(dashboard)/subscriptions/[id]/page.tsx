"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2, Play, Pause, Ban, Calendar, CreditCard, Clock } from "lucide-react";
import { fetchSubscriptionById, updateSubscriptionStatus } from "../../customers/actions";

interface SubscriptionItem {
  id: string;
  publicationName: string;
  type: string;
  price: number;
  frequency: string;
}

interface Subscription {
  id: string;
  customerId: string;
  customerName?: string;
  status: string;
  startDate: string;
  endDate?: string;
  items?: SubscriptionItem[];
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params.id as string;
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const sub = await fetchSubscriptionById(subscriptionId);
      setSubscription(sub);
    } catch (err) {
      setError("Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subscriptionId) loadData();
  }, [subscriptionId]);

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    try {
      setActionLoading(true);
      await updateSubscriptionStatus(subscriptionId, action);
      await loadData();
    } catch (err) {
      alert(`Failed to ${action} subscription. Validations usually bind strict user scopes.`);
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

  if (error || !subscription) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-500 mb-4">{error || "Subscription not found."}</p>
        <button onClick={() => router.back()} className="text-black hover:underline font-medium">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span className="hover:text-gray-900 cursor-pointer" onClick={() => router.push('/staff/admin/subscriptions')}>Subscriptions</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-900">Details</span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
              Subscription #{subscription.id}
              <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                subscription.status === 'ACTIVE' 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : subscription.status === 'PAUSED' || subscription.status === 'SUSPENDED'
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-gray-50 text-gray-400 border-gray-200"
              }`}>
                {subscription.status}
              </span>
            </h1>
          </div>
        </div>

        {/* Global Subscription Actions */}
        <div className="flex items-center gap-2">
           {subscription.status === 'ACTIVE' && (
             <button 
               onClick={() => handleAction('pause')}
               disabled={actionLoading}
               className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
             >
               {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pause className="h-4 w-4 mr-2" />}
               Pause
             </button>
           )}
           {(subscription.status === 'PAUSED' || subscription.status === 'SUSPENDED') && (
             <button 
               onClick={() => handleAction('resume')}
               disabled={actionLoading}
               className="inline-flex items-center px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
             >
               {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
               Resume
             </button>
           )}
           {subscription.status !== 'CANCELLED' && (
             <button 
               onClick={() => handleAction('cancel')}
               disabled={actionLoading}
               className="inline-flex items-center px-4 py-2 text-rose-600 border border-rose-100 bg-rose-50 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors"
             >
               {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}
               Cancel
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <div className="md:col-span-1 border border-[#EFEFEF] bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-fit">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Subscription Details</h3>
          
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Customer</p>
                <button 
                  onClick={() => router.push(`/staff/admin/customers/${subscription.customerId}`)} 
                  className="text-sm font-medium text-gray-900 truncate hover:underline"
                >
                  {subscription.customerName || `Customer #${subscription.customerId}`}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(subscription.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Publications</p>
                <p className="text-sm font-medium text-gray-900">{subscription.items?.length || 0} Items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Items Table */}
        <div className="md:col-span-2 border border-[#EFEFEF] bg-white rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="px-6 py-5 border-b border-[#EFEFEF] flex justify-between items-center">
             <h3 className="text-sm font-medium text-gray-900">Included Publications</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Publication Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Frequency</th>
                  <th className="px-6 py-4 text-right">Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF]">
                {!subscription.items || subscription.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <p>No publications found in this subscription.</p>
                      <p className="text-xs mt-1">This might be a legacy format subscription.</p>
                    </td>
                  </tr>
                ) : (
                  subscription.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-[#FBFBFD] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.publicationName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{item.type?.toLowerCase() || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100">
                           {item.frequency || "Monthly"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ₹{item.price?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
