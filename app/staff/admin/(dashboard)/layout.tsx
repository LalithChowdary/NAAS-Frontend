"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  MapPin
} from "lucide-react";
import { adminLogout } from "../actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
    { name: "Reports", href: "/staff/admin/reports", icon: BarChart3 },
  ];

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
              <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-xs font-semibold text-gray-700 tracking-wider">AD</span>
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
    </div>
  );
}
