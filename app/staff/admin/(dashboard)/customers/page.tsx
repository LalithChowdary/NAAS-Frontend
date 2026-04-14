"use client";

import { useEffect, useState } from "react";
import { Search, Eye, AlertCircle, Loader2 } from "lucide-react";
import { fetchCustomers, toggleCustomerStatus } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  activeSubscriptionsCount: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers(search || undefined);
      setCustomers(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: any) {
      setError("Failed to load customers. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredCustomers = customers.filter(customer => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "ACTIVE") return customer.active;
    if (filterStatus === "INACTIVE") return !customer.active;
    return true;
  });

  const handleToggleStatus = async (customer: Customer) => {
    try {
      // Optimistic update
      setCustomers(custs => custs.map(c => c.id === customer.id ? { ...c, active: !c.active } : c));
      await toggleCustomerStatus(customer.id, !customer.active);
    } catch (err) {
      // Revert on error
      setCustomers(custs => custs.map(c => c.id === customer.id ? { ...c, active: customer.active } : c));
      setError("Failed to change status.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered customers and their profiles.</p>
        </div>
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
                <th className="px-6 py-4 font-medium">Subscriptions</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" strokeWidth={1.5} />
                    <span>Loading customers...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-gray-300" />
                    </div>
                    <span>No customers found.</span>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FBFBFD] transition-colors group cursor-pointer" onClick={() => router.push(`/staff/admin/customers/${customer.id}`)}>
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{customer.name || customer.email.split('@')[0]}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-900">{customer.phone || "—"}</div>
                      <div className="text-xs text-gray-400">{customer.email}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700">
                        {customer.activeSubscriptionsCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                        customer.active 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                          : "bg-gray-50 text-gray-500 border-gray-200/50"
                      }`}>
                        {customer.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/staff/admin/customers/${customer.id}`}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                          title="View Details"
                        >
                          <span className="text-xs font-medium px-1.5 flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" strokeWidth={2} /> View
                          </span>
                        </Link>
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             handleToggleStatus(customer);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            customer.active 
                              ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50" 
                              : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={customer.active ? "Disable Customer" : "Enable Customer"}
                        >
                          <span className="text-xs font-medium px-1.5">
                            {customer.active ? "Disable" : "Enable"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
