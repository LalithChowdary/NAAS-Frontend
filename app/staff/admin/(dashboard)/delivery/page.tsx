"use client";

import { useEffect, useState } from "react";
import { fetchDeliveryPersonnel, toggleDeliveryPersonStatus, fetchPendingDeliveryRequests } from "../../actions";
import { Search, Eye, AlertCircle, Loader2, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DeliveryAdminPage() {
  const router = useRouter();
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      const [allDp, pendingData] = await Promise.all([
        fetchDeliveryPersonnel(),
        fetchPendingDeliveryRequests()
      ]);
      setPendingCount(pendingData.length);
      setDeliveryPersons(allDp.filter((dp: any) => dp.status === 'APPROVED'));
      setError("");
    } catch (err: any) {
      setError("Failed to load delivery personnel. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredDPs = deliveryPersons.filter(dp => {
    // Search by name
    const matchesSearch = dp.name.toLowerCase().includes(search.toLowerCase());
    
    // Filter by status (Using the User.active value via frontend mapping if present, else fallback)
    const isActive = dp.user?.active;
    let matchesStatus = true;
    if (filterStatus === "ACTIVE") matchesStatus = isActive === true;
    if (filterStatus === "INACTIVE") matchesStatus = isActive === false;
    
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (dp: any, currentActiveStatus: boolean) => {
    try {
      // Optimistic update
      setDeliveryPersons(dps => dps.map(p => p.id === dp.id ? { ...p, user: { ...p.user, active: !currentActiveStatus } } : p));
      await toggleDeliveryPersonStatus(dp.id, !currentActiveStatus);
    } catch (err) {
      // Revert on error
      setDeliveryPersons(dps => dps.map(p => p.id === dp.id ? { ...p, user: { ...p.user, active: currentActiveStatus } } : p));
      setError("Failed to change status.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Delivery Personnel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage active fleet access and assignments.</p>
        </div>
        
        {pendingCount > 0 && (
          <Link 
            href="/staff/admin/delivery/requests"
            className="flex items-center gap-3 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-colors group"
          >
             <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
             </span>
             <span className="text-sm font-medium text-rose-700">{pendingCount} Pending Requests</span>
             <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center text-sm border border-rose-100">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm text-gray-700 outline-none transition-all cursor-pointer min-w-[140px]"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-center">Deliveries</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" strokeWidth={1.5} />
                    <span>Loading personnel...</span>
                  </td>
                </tr>
              ) : filteredDPs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Users className="h-5 w-5 text-gray-300" />
                    </div>
                    <span>No personnel found.</span>
                  </td>
                </tr>
              ) : (
                filteredDPs.map((dp: any) => {
                  const isActive = dp.user?.active;
                  
                  return (
                    <tr key={dp.id} className="hover:bg-[#FBFBFD] transition-colors group cursor-pointer" onClick={() => router.push(`/staff/admin/delivery/${dp.id}`)}>
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{dp.name}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-gray-900">{dp.phone || "—"}</div>
                        <div className="text-xs text-gray-400">{dp.user?.email}</div>
                      </td>

                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700">
                           {/* Using dynamic loading in the details view for exact deliveries count to enforce DB load distribution. Here we fallback to static mapping if provided or simply view on click. */}
                           view details
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                          isActive 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                            : "bg-gray-50 text-gray-500 border-gray-200/50"
                        }`}>
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/staff/admin/delivery/${dp.id}`}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                            title="View Details"
                          >
                            <span className="text-xs font-medium px-1.5 flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5" strokeWidth={2} /> View
                            </span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
