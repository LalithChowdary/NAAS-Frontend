"use client";

import { useEffect, useState } from "react";
import { Search, AlertCircle, Loader2, Plus, Users, Shield, X, Eye } from "lucide-react";
import { fetchAdmins, toggleAdminStatus, createAdmin } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    employeeId: ""
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdmins();
      setAdmins(data || []);
      setError("");
    } catch (err: any) {
      setError("Failed to load admins. Please check your connection.");
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

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(search.toLowerCase()) || 
                          admin.email.toLowerCase().includes(search.toLowerCase());
    let matchesStatus = true;
    if (filterStatus === "ACTIVE") matchesStatus = admin.active === true;
    if (filterStatus === "INACTIVE") matchesStatus = admin.active === false;
    
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (admin: any, currentActiveStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentActiveStatus ? 'disable' : 'enable'} admin access for ${admin.name}?`)) return;
    try {
      // Optimistic update
      setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, active: !currentActiveStatus } : a));
      await toggleAdminStatus(admin.id, !currentActiveStatus);
    } catch (error: any) {
      setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, active: currentActiveStatus } : a));
      setError("Failed to change status.");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);
    try {
      await createAdmin(newAdmin);
      setIsModalOpen(false);
      setNewAdmin({ name: "", email: "", password: "", phone: "", employeeId: "" });
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to create admin");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Administrators</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system administrators and root privileges.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl transition-all shadow-sm font-medium text-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Add Admin</span>
        </button>
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
            placeholder="Search by name or email..."
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
                <th className="px-6 py-4 font-medium">Administrator</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Employee ID</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-gray-300 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Shield className="h-5 w-5 text-gray-300" />
                    </div>
                    <span>No administrators found.</span>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[#FBFBFD] transition-colors group cursor-pointer">
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{admin.name}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-900">{admin.phone || "—"}</div>
                      <div className="text-xs text-gray-400">{admin.email}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-900">{admin.employeeId || "—"}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                          admin.active 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                            : "bg-gray-50 text-gray-500 border-gray-200/50"
                        }`}>
                        {admin.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(admin, admin.active);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            admin.active 
                              ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50" 
                              : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={admin.active ? "Disable Access" : "Enable Access"}
                        >
                          <span className="text-xs font-medium px-1.5">
                            {admin.active ? "Disable" : "Enable"}
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

      {/* Add Admin Modal - Minimalist Style */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900 tracking-tight">New Administrator</h2>
                <p className="text-xs text-gray-500 mt-1">Add a new admin to the dashboard.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl border border-rose-100 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {modalError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Jane Doe"
                    value={newAdmin.name} 
                    onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} 
                    className="w-full bg-gray-50/50 border border-gray-200 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="jane@example.com"
                    value={newAdmin.email} 
                    onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                    className="w-full bg-gray-50/50 border border-gray-200 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Password</label>
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••"
                    value={newAdmin.password} 
                    onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                    className="w-full bg-gray-50/50 border border-gray-200 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Phone Number</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="+1 234 567 890"
                      value={newAdmin.phone} 
                      onChange={e => setNewAdmin({...newAdmin, phone: e.target.value})} 
                      className="w-full bg-gray-50/50 border border-gray-200 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Employee ID</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="EMP-1024"
                      value={newAdmin.employeeId} 
                      onChange={e => setNewAdmin({...newAdmin, employeeId: e.target.value})} 
                      className="w-full bg-gray-50/50 border border-gray-200 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 pb-1 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={modalLoading} 
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black active:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
