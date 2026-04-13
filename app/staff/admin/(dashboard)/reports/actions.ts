'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Function to handle authenticated fetch
async function authFetch(endpoint: string) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;

  if (!adminToken) {
    throw new Error('Not authorized. Please log in.');
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }

  return res.json();
}

export async function fetchMonthlySummary(month: string) {
  return authFetch(`/api/reports/monthly-summary?month=${month}`);
}

export async function fetchOutstandingDues() {
  return authFetch(`/api/reports/outstanding-dues`);
}

export async function fetchDeliverySummary(startDate: string, endDate: string) {
  return authFetch(`/api/reports/delivery-summary?startDate=${startDate}&endDate=${endDate}`);
}

export async function fetchDeliveryPersonnelPayment(startDate: string, endDate: string) {
  return authFetch(`/api/reports/delivery-personnel-payment?startDate=${startDate}&endDate=${endDate}`);
}

export async function fetchWhoReceivedWhat(startDate: string, endDate: string) {
  return authFetch(`/api/reports/who-received-what?startDate=${startDate}&endDate=${endDate}`);
}
