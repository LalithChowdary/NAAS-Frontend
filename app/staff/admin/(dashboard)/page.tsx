"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  RefreshCcw, 
  Banknote, 
  CreditCard, 
  Truck, 
  Clock, 
  PackageCheck,
  AlertCircle 
} from "lucide-react";
import { fetchDashboardMetrics } from "../actions";

interface DashboardData {
  metrics: {
    totalCustomers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingDues: number;
    todayTotalDeliveries: number;
    todayPendingDeliveries: number;
  };
  deliveryOverview: {
    total: number;
    completed: number;
    pending: number;
  };
  duesAlerts: {
    id: number;
    customerId: number;
    customerName: string;
    amountDue: number;
    status: string;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const res = await fetchDashboardMetrics();
        if (!res.ok || !res.data) {
          if ('unauthorized' in res && res.unauthorized) {
            router.replace('/staff/admin/login');
            return;
          }
          setError(res.message || "Failed to load dashboard metrics");
        } else {
          setData(res.data);
        }
      } catch {
        setError("Error connecting to backend API");
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-center text-rose-700">
        <AlertCircle className="h-5 w-5 mr-3" />
        <p>{error || "Failed to load"}</p>
      </div>
    );
  }

  const formatMoney = (val: number) => `₹${val.toFixed(2)}`;

  const topStats = [
    {
      name: "Total Customers",
      value: data.metrics.totalCustomers.toLocaleString(),
      icon: Users,
    },
    {
      name: "Active Subscriptions",
      value: data.metrics.activeSubscriptions.toLocaleString(),
      icon: RefreshCcw,
    },
    {
      name: "Monthly Revenue",
      value: formatMoney(data.metrics.monthlyRevenue),
      icon: Banknote,
    },
    {
      name: "Pending Dues",
      value: formatMoney(data.metrics.pendingDues),
      icon: CreditCard,
    },
    {
      name: "Today's Deliveries",
      value: data.metrics.todayTotalDeliveries.toLocaleString(),
      icon: Truck,
    },
    {
      name: "Pending Del. Requests",
      value: data.metrics.todayPendingDeliveries.toLocaleString(),
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* 3. ALERT SECTION */}
      {data.duesAlerts && data.duesAlerts.length > 0 && (
        <div className="bg-rose-50 rounded-2xl p-4 shadow-sm border border-rose-100 flex items-start gap-4">
           <div className="mt-0.5">
             <AlertCircle className="h-5 w-5 text-rose-500" strokeWidth={2} />
           </div>
           <div>
              <h3 className="text-rose-800 font-medium tracking-tight">Customers with Outstanding Dues</h3>
              <div className="text-sm text-rose-600 mt-1 max-w-2xl leading-relaxed flex flex-wrap gap-2 items-center">
                 <span>Action required for:</span>
                 {data.duesAlerts.map(due => (
                   <span key={due.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">
                     {due.customerName}: {formatMoney(due.amountDue)}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* 1. TOP METRICS GRID (6 Cards) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name + i}
              className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-gray-50/80 rounded-xl">
                  <Icon className="h-5 w-5 text-gray-700" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
              <p className="text-3xl font-light text-gray-900 mt-1.5 tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2. REPLACED "REVENUE OVERVIEW" -> "DELIVERY OVERVIEW (TODAY)" */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 tracking-tight flex items-center">
              Delivery Overview
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium tracking-normal">
                Today
              </span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
             <div className="p-6 rounded-2xl border border-gray-100 bg-[#FBFBFD]">
               <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm font-medium">
                 <Truck className="h-4 w-4" /> Total Scheduled
               </div>
               <span className="text-4xl font-light text-gray-900">{data.deliveryOverview.total}</span>
             </div>
             
             <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/30">
               <div className="flex items-center gap-2 mb-3 text-emerald-600 text-sm font-medium">
                 <PackageCheck className="h-4 w-4" /> Completed
               </div>
               <span className="text-4xl font-light text-emerald-700">{data.deliveryOverview.completed}</span>
             </div>

             <div className="p-6 rounded-2xl border border-amber-100 bg-amber-50/30">
               <div className="flex items-center gap-2 mb-3 text-amber-600 text-sm font-medium">
                 <Clock className="h-4 w-4" /> Pending
               </div>
               <span className="text-4xl font-light text-amber-700">{data.deliveryOverview.pending}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
