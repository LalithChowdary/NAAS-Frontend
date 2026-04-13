"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, AlertCircle, Play, Pause, Ban, Eye } from "lucide-react";
import { fetchAllSubscriptions, updateSubscriptionStatus } from "../customers/actions";
import { useRouter } from "next/navigation";

interface SubscriptionItem {
  id: number;
  publicationName: string;
  type: string;
  price: number;
  frequency: string;
}

interface Subscription {
  id: number;
  customerId: number;
  customerName?: string;
  publicationName?: string;
  publicationType?: string;
  items?: SubscriptionItem[];
  status: string;
  frequency?: string;
  startDate: string;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllSubscriptions();
      setSubscriptions(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: any) {
      setError("Failed to load subscriptions. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (subId: number, action: 'pause' | 'resume' | 'cancel') => {
    try {
      setActionLoading(subId);
      await updateSubscriptionStatus(String(subId), action);
      await loadData(); // refresh status
    } catch (err) {
      alert(`Failed to ${action} subscription. The backend might restrict this to Customer identities.`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    // Basic search simulation if backend doesn't search globally
    if (search) {
      const q = search.toLowerCase();
      const matchCust = sub.customerName?.toLowerCase().includes(q) || false;
      const matchPub = sub.publicationName?.toLowerCase().includes(q) || false;
      if (!matchCust && !matchPub) return false;
    }
    if (filterStatus !== "ALL" && sub.status !== filterStatus) return false;
    if (filterType !== "ALL") {
       // Support exact or mapped type filtering
       if (sub.publicationType?.toUpperCase() !== filterType.toUpperCase()) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-1">Global registry of all active and past publication subscriptions.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center text-sm border border-rose-100">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Controls: Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white p-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by publication or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm text-gray-700 outline-none transition-all cursor-pointer min-w-[140px]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused / Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm text-gray-700 outline-none transition-all cursor-pointer min-w-[140px]"
          >
            <option value="ALL">All Types</option>
            <option value="NEWSPAPER">Newspapers</option>
            <option value="MAGAZINE">Magazines</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Publication</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Started</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" strokeWidth={1.5} />
                    <span>Loading subscriptions...</span>
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-gray-300" />
                    </div>
                    <span>No subscriptions found.</span>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const displayNames = sub.items && sub.items.length > 0 
                    ? sub.items.map(i => i.publicationName).join(", ") 
                    : sub.publicationName || "Unknown Subscription";
                  
                  const displayType = sub.items && sub.items.length === 1 
                    ? sub.items[0].type 
                    : (sub.items && sub.items.length > 1 ? "MULTIPLE" : sub.publicationType || "MIXED");

                  return (
                  <tr 
                    key={sub.id} 
                    className="hover:bg-[#FBFBFD] transition-colors group cursor-pointer"
                    onClick={() => router.push(`/staff/admin/subscriptions/${sub.id}`)}
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => sub.customerId ? router.push(`/staff/admin/customers/${sub.customerId}`) : null}
                        className="font-medium text-gray-900 inline-flex items-center gap-1.5 hover:underline"
                        title="View Customer"
                      >
                        {sub.customerName || `Customer #${sub.customerId || '?'}`} 
                        <Eye className="h-3 w-3 text-gray-400" />
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className="max-w-[250px] truncate" title={displayNames}>
                        {displayNames}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="capitalize">{displayType?.toLowerCase()}</span>
                    </td>
                    <td className="px-6 py-3">
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
                    <td className="px-6 py-3">
                      {new Date(sub.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-100 group-hover:opacity-100 transition-opacity">
                         <span className="text-gray-400 inline-flex items-center text-xs font-medium gap-1 group-hover:text-gray-900 transition-colors">
                           View <Eye className="h-3.5 w-3.5" />
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
  );
}
