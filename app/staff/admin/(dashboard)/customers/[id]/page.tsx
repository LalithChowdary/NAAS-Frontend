"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Calendar, CreditCard, ChevronRight, Loader2, Play, Pause, Ban } from "lucide-react";
import { fetchCustomerById, fetchCustomerSubscriptions, updateSubscriptionStatus } from "../actions";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: string;
}

interface SubscriptionItem {
  id: number;
  publicationName: string;
  type: string;
  price: number;
  frequency: string;
}

interface Subscription {
  id: number;
  publicationName: string;
  publicationType: string;
  items?: SubscriptionItem[];
  status: string;
  startDate: string;
  endDate?: string;
  frequency?: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [customerData, subsData] = await Promise.all([
        fetchCustomerById(customerId),
        fetchCustomerSubscriptions(customerId)
      ]);
      setCustomer(customerData);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
    } catch (err) {
      setError("Failed to load customer profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadData();
    }
  }, [customerId]);

  const handleAction = async (subId: number, action: 'pause' | 'resume' | 'cancel') => {
    try {
      setActionLoading(subId);
      await updateSubscriptionStatus(subId.toString(), action);
      await loadData();
    } catch (err) {
      alert(`Failed to ${action} subscription. Feature might require Customer token bindings currently.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-500 mb-4">{error || "Customer not found."}</p>
        <button onClick={() => router.back()} className="text-black hover:underline font-medium">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span className="hover:text-gray-900 cursor-pointer" onClick={() => router.push('/staff/admin/customers')}>Customers</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900">Profile</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
            {customer.firstName} {customer.lastName}
            <span className={`inline-flex px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
              customer.active 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}>
              {customer.active ? "Active" : "Inactive"}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <div className="lg:col-span-1 border border-[#EFEFEF] bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-fit">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Contact & Details</h3>
          
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm font-medium text-gray-900 truncate">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{customer.phone || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Registered On</p>
                <p className="text-sm font-medium text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="lg:col-span-2 border border-[#EFEFEF] bg-white rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="px-6 py-5 border-b border-[#EFEFEF] flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Active Subscriptions</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              {subscriptions.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Publication</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF]">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
                      <p>No subscriptions found.</p>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => {
                    const displayNames = sub.items && sub.items.length > 0 
                      ? sub.items.map(i => i.publicationName).join(", ") 
                      : sub.publicationName || "Unknown Subscription";
                    
                    const displayType = sub.items && sub.items.length === 1 
                      ? sub.items[0].type 
                      : (sub.items && sub.items.length > 1 ? "MULTIPLE" : sub.publicationType || "MIXED");

                    return (
                    <tr 
                      key={sub.id} 
                      className="hover:bg-[#FBFBFD] transition-colors cursor-pointer group"
                      onClick={() => router.push(`/staff/admin/subscriptions/${sub.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 max-w-[200px] truncate" title={displayNames}>{displayNames}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Started {new Date(sub.startDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{displayType?.toLowerCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                          sub.status === 'ACTIVE' 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                            : sub.status === 'PAUSED' || sub.status === 'SUSPENDED'
                            ? "bg-amber-50 text-amber-600 border-amber-100/50"
                            : "bg-gray-50 text-gray-500 border-gray-200/50"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-100 group-hover:opacity-100 transition-opacity">
                           <span className="text-gray-400 inline-flex items-center text-xs font-medium gap-1 group-hover:text-gray-900 transition-colors">
                             View <ChevronRight className="h-3.5 w-3.5" />
                           </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
