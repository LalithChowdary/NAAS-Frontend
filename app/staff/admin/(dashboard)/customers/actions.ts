'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// ================= CUSTOMERS =================

export async function fetchCustomers(search?: string) {
  let url = `${API_URL}/api/admin/customers`;
  if (search) {
    url += `?search=${encodeURIComponent(search)}`;
  }
  const [resCust, resSubs] = await Promise.all([
    fetch(url, { headers: await getAuthHeader(), cache: 'no-store' }),
    fetchAllSubscriptions().catch(() => []) // Fallback safely if subscriptions fail
  ]);
  
  if (!resCust.ok) throw new Error('Failed to fetch customers');
  
  const customers = await resCust.json();
  const subscriptions = Array.isArray(resSubs) ? resSubs : [];

  // Map active subscriptions count manually since backend doesn't provide it
  return customers.map((c: any) => {
    const custSubs = subscriptions.filter(s => s.customerId === c.id && s.status === 'ACTIVE');
    return {
      ...c,
      activeSubscriptionsCount: custSubs.length
    };
  });
}

export async function fetchCustomerById(id: string) {
  const res = await fetch(`${API_URL}/api/admin/customers/${id}`, { headers: await getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch customer ${id}`);
  return res.json();
}

export async function toggleCustomerStatus(id: number, active: boolean) {
  const res = await fetch(`${API_URL}/api/admin/customers/${id}/status?active=${active}`, {
    method: 'PATCH',
    headers: await getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to toggle customer status');
  return res.json();
}

export async function fetchSubscriptionById(id: string) {
  const subs = await fetchAllSubscriptions();
  const sub = subs.find((s: any) => s.id.toString() === id.toString());
  if (!sub) throw new Error(`Subscription ${id} not found`);
  return sub;
}

// ================= SUBSCRIPTIONS =================

export async function fetchAllSubscriptions() {
  const res = await fetch(`${API_URL}/api/admin/subscriptions`, { headers: await getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch subscriptions');
  return res.json();
}

export async function fetchCustomerSubscriptions(customerId: string) {
  const res = await fetch(`${API_URL}/api/admin/subscriptions/customer/${customerId}`, { headers: await getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch customer subscriptions');
  return res.json();
}

export async function updateSubscriptionStatus(subscriptionId: number, command: 'pause' | 'resume' | 'cancel') {
  // Mapping to conventional backend endpoints. Assuming /api/subscriptions/{id}/{command} if available
  // The backend API for this wasn't strictly exposed in AdminSubscriptionController, it's typically in Customer or Subscription controller.
  // We'll call the standard subscription endpoints here.
  const res = await fetch(`${API_URL}/api/subscriptions/${subscriptionId}/${command}`, {
    method: 'POST',
    headers: await getAuthHeader()
  });
  
  if (!res.ok) throw new Error(`Failed to ${command} subscription`);
  return res.json();
}
