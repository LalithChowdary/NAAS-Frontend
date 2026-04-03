"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function fetchDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchApi = async (endpoint: string) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers,
        cache: "no-store", // disable caching for real-time dashboard
      });
      if (!res.ok) return null;
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  };

  try {
    const [
      totalCustomers,
      activeSubscriptions,
      monthlyRevenue,
      pendingDues,
      todayDeliveriesCount,
      pendingRequestsCount,
      deliveryOverview,
      customersWithDues,
    ] = await Promise.all([
      fetchApi("/api/customers/count"),
      fetchApi("/api/subscriptions/active"),
      fetchApi("/api/billing/monthly"),
      fetchApi("/api/billing/pending"),
      fetchApi("/api/delivery/today/count"),
      fetchApi("/api/delivery-requests/count"),
      fetchApi("/api/delivery/today"),
      fetchApi("/api/billing/dues/customers"),
    ]);

    return {
      ok: true,
      data: {
        totalCustomers: totalCustomers ?? 0,
        activeSubscriptions: activeSubscriptions ?? 0,
        monthlyRevenue: monthlyRevenue ?? 0,
        pendingDues: pendingDues ?? 0,
        todayDeliveriesCount: todayDeliveriesCount ?? 0,
        pendingRequestsCount: pendingRequestsCount ?? 0,
        deliveryOverview: deliveryOverview ?? { total: 0, completed: 0, pending: 0 },
        customersWithDues: customersWithDues ?? [],
      },
    };
  } catch (error: any) {
    return { ok: false, message: error.message };
  }
}
