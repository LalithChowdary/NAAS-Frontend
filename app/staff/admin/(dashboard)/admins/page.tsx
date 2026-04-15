"use client";

import { useEffect, useState } from "react";
import { Search, AlertCircle, Loader2, Plus, Users, Shield, X, Info } from "lucide-react";
import { fetchAdmins, toggleAdminStatus, createAdmin, fetchCurrentAdminId } from "./actions";
import { adminLogout } from "../../actions";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

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
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Self-disable warning dialog
  const [selfDisableDialog, setSelfDisableDialog] = useState<{
    open: boolean;
    admin: any;
  }>({ open: false, admin: null });
  const [selfDisabling, setSelfDisabling] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, myId] = await Promise.all([fetchAdmins(), fetchCurrentAdminId()]);
      setAdmins(data || []);
      setCurrentAdminId(myId);
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

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name?.toLowerCase().includes(search.toLowerCase()) ||
      admin.email?.toLowerCase().includes(search.toLowerCase());
    let matchesStatus = true;
    if (filterStatus === "ACTIVE") matchesStatus = admin.active === true;
    if (filterStatus === "INACTIVE") matchesStatus = admin.active === false;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (admin: any, currentActiveStatus: boolean) => {
    const isSelf = admin.id === currentAdminId;

    // If trying to disable self, show warning
    if (currentActiveStatus && isSelf) {
      setSelfDisableDialog({ open: true, admin });
      return;
    }

    if (!confirm(`Are you sure you want to ${currentActiveStatus ? "disable" : "enable"} admin access for ${admin.name}?`)) return;

    try {
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, active: !currentActiveStatus } : a)));
      await toggleAdminStatus(admin.id, !currentActiveStatus);
    } catch (error: any) {
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, active: currentActiveStatus } : a)));
      setError(error.message || "Failed to change status.");
    }
  };

  const confirmSelfDisable = async () => {
    const admin = selfDisableDialog.admin;
    if (!admin) return;
    setSelfDisabling(true);
    try {
      await toggleAdminStatus(admin.id, false);
      // Log out since this admin can no longer log in
      await adminLogout();
    } catch (error: any) {
      setSelfDisabling(false);
      setSelfDisableDialog({ open: false, admin: null });
      setError(error.message || "Failed to disable account.");
    }
  };

  // Phone validation helper
  const validatePhone = (phone: string) =>
    !phone || /^[6-9]\d{9}$/.test(phone);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setFieldErrors({});

    // Client-side phone validation
    if (!validatePhone(newAdmin.phone)) {
      setFieldErrors({ phone: "Must be a valid 10-digit Indian mobile number (starts with 6-9)" });
      return;
    }

    setModalLoading(true);
    try {
      await createAdmin(newAdmin);
      setIsModalOpen(false);
      setNewAdmin({ name: "", email: "", password: "", phone: "" });
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

      {/* Controls */}
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

      {/* Table */}
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
                  <tr key={admin.id} className="hover:bg-[#FBFBFD] transition-colors group">
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {admin.name}
                        {admin.id === currentAdminId && (
                          <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-500 border border-indigo-100 px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-900">{admin.phone || "—"}</div>
                      <div className="text-xs text-gray-400">{admin.email}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-900 font-mono text-xs">{admin.employeeId || "—"}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                          admin.active
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                            : "bg-gray-50 text-gray-500 border-gray-200/50"
                        }`}
                      >
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

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900 tracking-tight">New Administrator</h2>
                <p className="text-xs text-gray-500 mt-1">Employee ID will be auto-generated.</p>
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
                  <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
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
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
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
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
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
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="w-full bg-gray-50/50 border border-gray-200 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
                    Phone Number
                    <span className="text-gray-400 font-normal ml-1">(Indian mobile, 10 digits)</span>
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="9876543210"
                    value={newAdmin.phone}
                    maxLength={10}
                    onChange={(e) => {
                      setNewAdmin({ ...newAdmin, phone: e.target.value });
                      setFieldErrors({});
                    }}
                    className={`w-full bg-gray-50/50 border focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 ${
                      fieldErrors.phone ? "border-rose-400" : "border-gray-200 focus:border-gray-900"
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-rose-500 mt-1 ml-1">{fieldErrors.phone}</p>
                  )}
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

      {/* Self-disable warning dialog */}
      {selfDisableDialog.open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-2">
              <Info className="h-6 w-6 text-amber-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Disable Your Own Account?</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              You are about to disable <strong>your own</strong> admin account. You will be <strong>immediately logged out</strong> and will not be able to log back in until another admin re-enables your account.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelfDisableDialog({ open: false, admin: null })}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={selfDisabling}
              >
                Cancel
              </button>
              <button
                onClick={confirmSelfDisable}
                disabled={selfDisabling}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {selfDisabling && <Loader2 className="w-4 h-4 animate-spin" />}
                Disable & Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
