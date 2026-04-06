'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const JWT_TTL_SECONDS = 60 * 60 * 24;

async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('role');
  cookieStore.delete('dp_id');
}

export async function adminLogin(_prevState: unknown, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || 'Invalid credentials. Please try again.' };
    }

    const data = await res.json();

    // Check role precisely from backend AuthResponse
    const role = data.role?.toUpperCase() || 'CUSTOMER';

    if (role !== 'ADMIN') {
      return { error: 'Access denied. Admins only.' };
    }

    // Role is ADMIN, proceed to set cookies
    const cookieStore = await cookies();
    cookieStore.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: JWT_TTL_SECONDS,
    });

    cookieStore.set('role', role, {
      httpOnly: false, // We might need this in middleware
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: JWT_TTL_SECONDS,
    });

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }

  // Redirect must be called outside the try-catch block
  redirect('/staff/admin');
}

export async function getAdminAuthHeader(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return {
      'Content-Type': 'application/json'
    };
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export async function fetchDeliveryPersonnel() {
  const res = await fetch(`${API_URL}/api/delivery-person`, {
    headers: await getAdminAuthHeader(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch delivery personnel');
  return res.json();
}

export async function fetchPendingDeliveryRequests() {
  const res = await fetch(`${API_URL}/api/delivery-person/pending`, {
    headers: await getAdminAuthHeader(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch pending requests');
  return res.json();
}

export async function approveDeliveryPerson(id: number) {
  const res = await fetch(`${API_URL}/api/delivery-person/${id}/approve`, {
    method: 'PUT',
    headers: await getAdminAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to approve');
  return res.json();
}

export async function rejectDeliveryPerson(id: number) {
  const res = await fetch(`${API_URL}/api/delivery-person/${id}/reject`, {
    method: 'PUT',
    headers: await getAdminAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to reject');
  return res.json();
}

export async function toggleDeliveryPersonStatus(id: number, active: boolean) {
  const res = await fetch(`${API_URL}/api/delivery-person/${id}/toggleStatus?active=${active}`, {
    method: 'PUT',
    headers: await getAdminAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to toggle status');
  return res.json();
}

export async function fetchDeliveryPersonDetails(id: number) {
  const res = await fetch(`${API_URL}/api/delivery-person/${id}`, {
    headers: await getAdminAuthHeader(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch details');
  return res.json();
}

export async function fetchDeliveryPersonHistory(id: number) {
  const res = await fetch(`${API_URL}/api/delivery-person/${id}/deliveries`, {
    headers: await getAdminAuthHeader(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function getAdminDeliverySchedule(dateStr?: string) {
  const urlParams = new URLSearchParams();
  if (dateStr) {
    urlParams.append('date', dateStr);
  }
  const res = await fetch(`${API_URL}/api/delivery/schedule?${urlParams.toString()}`, {
    headers: await getAdminAuthHeader(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function generateAdminDeliverySchedule(dateStr?: string) {
  const urlParams = new URLSearchParams();
  if (dateStr) {
    urlParams.append('date', dateStr);
  }
  const res = await fetch(`${API_URL}/api/delivery/admin/generate-schedule?${urlParams.toString()}`, {
    method: 'POST',
    headers: await getAdminAuthHeader()
  });
  if (!res.ok) {
    const errText = await res.text();
    return {
      ok: false,
      message: errText || 'Failed to generate schedule'
    };
  }
  return {
    ok: true,
    message: await res.text()
  };
}

export async function fetchAdminBills() {
  try {
    const res = await fetch(`${API_URL}/api/admin/bills`, {
      headers: await getAdminAuthHeader(),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        ok: false,
        data: [],
        message: errText || 'Failed to fetch bills'
      };
    }

    const data = await res.json();
    return {
      ok: true,
      data: Array.isArray(data) ? data : [],
      message: ''
    };
  } catch {
    return {
      ok: false,
      data: [],
      message: 'Failed to fetch bills'
    };
  }
}

export async function fetchAdminBillById(id: number) {
  try {
    const res = await fetch(`${API_URL}/api/admin/bills/${id}`, {
      headers: await getAdminAuthHeader(),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        ok: false,
        data: null,
        message: errText || 'Failed to fetch bill details'
      };
    }

    return {
      ok: true,
      data: await res.json(),
      message: ''
    };
  } catch {
    return {
      ok: false,
      data: null,
      message: 'Failed to fetch bill details'
    };
  }
}

export async function generateAdminBills(year?: number, month?: number) {
  const urlParams = new URLSearchParams();
  if (year && month) {
    urlParams.append('year', String(year));
    urlParams.append('month', String(month));
  }

  const endpoint = urlParams.toString()
    ? `${API_URL}/api/admin/bills/generate?${urlParams.toString()}`
    : `${API_URL}/api/admin/bills/generate`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: await getAdminAuthHeader()
  });

  if (!res.ok) {
    const errText = await res.text();
    return {
      ok: false,
      message: errText || 'Failed to generate bills'
    };
  }

  return {
    ok: true,
    message: await res.text()
  };
}



export async function markAdminBillStatus(id: number, status: string) {
  try {
    const res = await fetch(`${API_URL}/api/admin/bills/${id}/status`, {
      method: "PATCH",
      headers: await getAdminAuthHeader(),
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, data: null, message: errText || "Failed to update bill status" };
    }

    const data = await res.json();
    return { ok: true, data, message: "Status updated successfully" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { ok: false, data: null, message };
  }
}

export async function fetchPaymentsForBill(billId: number) {
  try {
    const res = await fetch(`${API_URL}/api/admin/bills/${billId}/payments`, {
      headers: await getAdminAuthHeader(),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, data: null, message: errText || "Failed to fetch payments" };
    }

    const data = await res.json();
    return { ok: true, data, message: "Fetched correctly" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { ok: false, data: null, message };
  }
}

export async function fetchAllPaymentsAndUnpaidBills() {
  try {
    const billsRes = await fetchAdminBills();
    if (!billsRes.ok) {
      return { ok: false, data: { payments: [], unpaidBills: [] }, message: billsRes.message };
    }

    type BillSummary = { id: number; status?: string; customerId: number; customerName: string; billingMonth: string; totalAmount: number; };
    const allBills = (Array.isArray(billsRes.data) ? billsRes.data : []) as BillSummary[];

    // Group unpaid bills for dropdowns
    const unpaidBills = allBills.filter(b => b.status === "UNPAID");

    // Fetch payments for bills that have been paid (or partially paid)
    // For simplicity given the backend schema, any bill with payment is PAID, or we check all.
    // To be perfectly safe, let's check bills > 0 totalAmount
    const billsWithPotentialPayments = allBills;

    const paymentPromises = billsWithPotentialPayments.map(b => fetchPaymentsForBill(b.id));
    const paymentResults = await Promise.all(paymentPromises);

    const allPayments = paymentResults
      .filter(r => r.ok && r.data)
      .flatMap(r => r.data);

    // Sort payments by date descending
    allPayments.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

    return {
      ok: true,
      data: { payments: allPayments, unpaidBills },
      message: "Fetched successfully"
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return { ok: false, data: null, message };
  }
}

export async function recordPayment(billId: number, amount: number, paymentMethod: string, chequeNumber: string, receiptNote: string) {
  try {
    const res = await fetch(`${API_URL}/api/admin/bills/${billId}/payments`, {
      method: 'POST',
      headers: await getAdminAuthHeader(),
      body: JSON.stringify({ amount, paymentMethod, chequeNumber, receiptNote })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, data: null, message: errText || "Failed to record payment" };
    }

    // Assuming backend also marks the bill as PAID depending on logic, optionally call markAdminBillStatus if we must
    return { ok: true, data: await res.json(), message: "Payment recorded successfully" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { ok: false, data: null, message };
  }
}

// Dashboard Stats Action
export async function fetchDashboardStats() {
  try {
    const headers = await getAdminAuthHeader();

    // 1. Fetch Customers
    const customersRes = await fetch(`${API_URL}/api/admin/customers`, {
      headers,
      cache: 'no-store',
    });
    let totalCustomers = 0;
    if (customersRes.ok) {
      const customers = await customersRes.json();
      totalCustomers = Array.isArray(customers) ? customers.length : 0;
    }

    // 2. Fetch Subscriptions
    const subRes = await fetch(`${API_URL}/api/admin/subscriptions`, {
      headers,
      cache: 'no-store',
    });
    let activeSubscriptions = 0;
    if (subRes.ok) {
      const subs = await subRes.json();
      type SubscriptionRow = { status?: string };
      activeSubscriptions = Array.isArray(subs)
        ? (subs as SubscriptionRow[]).filter((s) => s.status === 'ACTIVE').length
        : 0;
    }

    // 3. Fetch Bills
    const billsRes = await fetch(`${API_URL}/api/admin/bills`, {
      headers,
      cache: 'no-store',
    });

    let monthlyRevenue = 0;
    let pendingDues = 0;

    if (billsRes.ok) {
      const bills = await billsRes.json();
      type BillRow = { status?: string; totalAmount?: number };
      if (Array.isArray(bills)) {
        (bills as BillRow[]).forEach((bill) => {
          if (bill.status === 'PAID') {
            monthlyRevenue += bill.totalAmount || 0;
          } else if (bill.status === 'UNPAID' || bill.status === 'OVERDUE') {
            pendingDues += bill.totalAmount || 0;
          }
        });
      }
    }

    return {
      ok: true,
      data: {
        totalCustomers,
        activeSubscriptions,
        monthlyRevenue,
        pendingDues
      }
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return {
      ok: false,
      message: 'Failed to fetch dashboard stats'
    };
  }
}

// --- DASHBOARD METRICS ---

export async function fetchDashboardMetrics() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      await clearSessionCookies();
      return { ok: false, unauthorized: true, message: 'Session expired. Please log in again.' };
    }

    const headers = await getAdminAuthHeader();

    type CustomerRow = { id?: number };
    type SubscriptionRow = { status?: string };
    type BillRow = {
      id?: number;
      customerId?: number;
      customerName?: string;
      status?: string;
      totalAmount?: number;
      paidAmount?: number;
      billingMonth?: string;
    };
    type DeliveryRow = { status?: string };

    const today = new Date().toISOString().split('T')[0];

    const [customersRes, subsRes, billsRes, deliveryRes, pendingReqRes] = await Promise.all([
      fetch(`${API_URL}/api/admin/customers`, { headers, cache: 'no-store' }),
      fetch(`${API_URL}/api/admin/subscriptions`, { headers, cache: 'no-store' }),
      fetch(`${API_URL}/api/admin/bills`, { headers, cache: 'no-store' }),
      fetch(`${API_URL}/api/delivery/schedule?date=${today}`, { headers, cache: 'no-store' }),
      fetch(`${API_URL}/api/delivery-person/pending`, { headers, cache: 'no-store' }),
    ]);

    const responses = [customersRes, subsRes, billsRes, deliveryRes, pendingReqRes];
    if (responses.some((res) => res.status === 401)) {
      await clearSessionCookies();
      return { ok: false, unauthorized: true, message: 'Session expired. Please log in again.' };
    }

    const customersJson: unknown = customersRes.ok ? await customersRes.json() : [];
    const subsJson: unknown = subsRes.ok ? await subsRes.json() : [];
    const billsJson: unknown = billsRes.ok ? await billsRes.json() : [];
    const deliveriesJson: unknown = deliveryRes.ok ? await deliveryRes.json() : [];
    const pendingReqJson: unknown = pendingReqRes.ok ? await pendingReqRes.json() : [];

    const customers = Array.isArray(customersJson) ? (customersJson as CustomerRow[]) : [];
    const subscriptions = Array.isArray(subsJson) ? (subsJson as SubscriptionRow[]) : [];
    const bills = Array.isArray(billsJson) ? (billsJson as BillRow[]) : [];
    const deliveries = Array.isArray(deliveriesJson) ? (deliveriesJson as DeliveryRow[]) : [];
    const pendingRequests = Array.isArray(pendingReqJson) ? pendingReqJson : [];

    const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE').length;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const dueStatuses = new Set(['UNPAID', 'PARTIALLY_PAID', 'OVERDUE']);

    const monthlyRevenue = bills
      .filter((b) => b.billingMonth === currentMonth)
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    const pendingDues = bills
      .filter((b) => dueStatuses.has(String(b.status || '')))
      .reduce((sum, b) => {
        const total = Number(b.totalAmount) || 0;
        const paid = Number(b.paidAmount) || 0;
        return sum + Math.max(total - paid, 0);
      }, 0);

    const duesByCustomer = new Map<number, { customerName: string; amountDue: number; status: string }>();
    for (const bill of bills) {
      if (!dueStatuses.has(String(bill.status || ''))) {
        continue;
      }
      const customerId = Number(bill.customerId) || 0;
      if (!customerId) {
        continue;
      }

      const total = Number(bill.totalAmount) || 0;
      const paid = Number(bill.paidAmount) || 0;
      const due = Math.max(total - paid, 0);
      const existing = duesByCustomer.get(customerId);

      duesByCustomer.set(customerId, {
        customerName: bill.customerName || existing?.customerName || `Customer #${customerId}`,
        amountDue: (existing?.amountDue || 0) + due,
        status: bill.status || existing?.status || 'UNPAID',
      });
    }

    const customersWithDues = Array.from(duesByCustomer.entries())
      .map(([customerId, value], index) => ({
        id: index + 1,
        customerId,
        customerName: value.customerName,
        amountDue: value.amountDue,
        status: value.status,
      }))
      .sort((a, b) => b.amountDue - a.amountDue)
      .slice(0, 5);

    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED').length;
    const pendingDeliveries = Math.max(totalDeliveries - completedDeliveries, 0);

    return {
      ok: true,
      data: {
        metrics: {
          totalCustomers: customers.length,
          activeSubscriptions: activeSubs,
          monthlyRevenue,
          pendingDues,
          todayTotalDeliveries: totalDeliveries,
          todayPendingDeliveries: pendingRequests.length,
        },
        deliveryOverview: {
          total: totalDeliveries,
          completed: completedDeliveries,
          pending: pendingDeliveries,
        },
        duesAlerts: customersWithDues,
      },
    };
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return { ok: false, message: "Internal server error connecting to backend" };
  }
}
