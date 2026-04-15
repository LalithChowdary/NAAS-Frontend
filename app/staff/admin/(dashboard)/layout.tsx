"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  RefreshCcw, 
  CreditCard, 
  Banknote, 
  BarChart3, 
  LogOut,
  LayoutDashboard,
  Truck,
  Calendar,
  MapPin,
  Wallet,
  User,
  ChevronRight,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import { adminLogout } from "../actions";
import { useEffect, useRef, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/staff/admin", icon: LayoutDashboard },
    { name: "Admins", href: "/staff/admin/admins", icon: Users },
    { name: "Customers", href: "/staff/admin/customers", icon: Users },
    { name: "Delivery Personnel", href: "/staff/admin/delivery", icon: Truck },
    { name: "Delivery Schedule", href: "/staff/admin/delivery/schedule", icon: Calendar },
    { name: "Delivery Hubs", href: "/staff/admin/hubs", icon: MapPin },
    { name: "Publications", href: "/staff/admin/publications", icon: BookOpen },
    { name: "Subscriptions", href: "/staff/admin/subscriptions", icon: RefreshCcw },
    { name: "Billing", href: "/staff/admin/billing", icon: Banknote },
    { name: "Payments", href: "/staff/admin/payments", icon: CreditCard },
    { name: "Payouts", href: "/staff/admin/payouts", icon: Wallet },
    { name: "Reports", href: "/staff/admin/reports", icon: BarChart3 },
  ];

  // --- Profile Dropdown State ---
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", employeeId: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openProfile = async () => {
    setDropdownOpen(false);
    setProfileOpen(true);
    setProfileError("");
    setProfileSuccess("");
    setFieldErrors({});
    setProfileLoading(true);
    try {
      const res = await fetch("/api/admin/me");
      const data = await res.json();
      setProfile(data);
      setForm({ name: data.name || "", phone: data.phone || "", employeeId: data.employeeId || "" });
    } catch {
      setProfileError("Failed to load profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setFieldErrors({});

    // Client-side phone validation (Indian format)
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      setFieldErrors({ phone: "Phone must be a valid 10-digit Indian mobile number (starts with 6-9)" });
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        // Field-level errors from backend
        if (typeof data === "object" && !data.message) {
          setFieldErrors(data);
        } else {
          setProfileError(data.message || "Failed to save profile.");
        }
        return;
      }
      setProfile(data);
      setProfileSuccess("Profile updated successfully!");
    } catch {
      setProfileError("An error occurred. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex selection:bg-black selection:text-white">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#EFEFEF] flex flex-col fixed inset-y-0 z-20">
        <div className="p-8">
          <Link href="/staff/admin" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-medium text-lg leading-none">N</span>
            </div>
            <span className="text-xl font-medium tracking-tight text-gray-900">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-[#F5F5F7] text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:bg-[#F5F5F7]/50 hover:text-gray-900"
                }`}
              >
                <Icon 
                  className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors ${
                    isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                  }`} 
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className={`text-sm ${isActive ? "font-medium" : "font-normal"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#EFEFEF] mb-4">
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full flex items-center px-4 py-3 rounded-xl text-gray-500 hover:bg-[#F5F5F7]/50 hover:text-gray-900 transition-colors group"
            >
              <LogOut className="flex-shrink-0 h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-600" strokeWidth={1.5} />
              <span className="text-sm">Sign out</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="bg-white/70 backdrop-blur-xl border-b border-[#EFEFEF] sticky top-0 z-10 transition-all">
          <div className="flex items-center justify-between px-10 h-[4.5rem]">
            <h1 className="text-xl font-medium tracking-tight text-gray-900">
              {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:inline-block">Welcome, Admin</span>
              
              {/* Profile Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label="Admin profile menu"
                >
                  <span className="text-xs font-semibold text-gray-700 tracking-wider">AD</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#EFEFEF] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={openProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                      My Profile
                    </button>
                    <div className="border-t border-[#EFEFEF]" />
                    <form action={adminLogout}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" strokeWidth={1.5} />
                        Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Profile Slide-over Panel */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={() => setProfileOpen(false)}
          />
          {/* Panel */}
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#EFEFEF]">
              <div>
                <h2 className="text-base font-medium text-gray-900">My Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">Edit your admin details</p>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {profileLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-5">
                  {profileError && (
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm flex items-center gap-2 border border-rose-100">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {profileError}
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm border border-emerald-100">
                      {profileSuccess}
                    </div>
                  )}

                  {/* Email – read-only */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Email Address</label>
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 select-none">
                      {profile?.email || "—"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
                      Phone Number
                      <span className="text-gray-400 font-normal ml-1">(Indian mobile)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => {
                        setForm({ ...form, phone: e.target.value });
                        setFieldErrors({});
                      }}
                      className={`w-full bg-gray-50 border focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                        fieldErrors.phone ? "border-rose-400 focus:border-rose-500" : "border-gray-200 focus:border-gray-900"
                      }`}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-rose-500 mt-1 ml-1">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">Employee ID</label>
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 select-none">
                      {form.employeeId || "—"}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-1">Auto-generated, cannot be changed.</p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
