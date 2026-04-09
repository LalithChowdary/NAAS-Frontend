'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function getAddressesAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;

  if (!token) return { data: null, error: 'Unauthorized' };

  try {
    const res = await fetch(`${API_URL}/api/customer/addresses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return { data: null, error: 'Unauthorized' };
      return { data: null, error: 'Failed to fetch addresses' };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: 'Network error' };
  }
}

export async function createAddressAction(payload: { label: string; address: string; latitude: number; longitude: number; house?: string; area?: string; landmark?: string; }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;

  if (!token) return { data: null, error: 'Unauthorized' };

  try {
    const res = await fetch(`${API_URL}/api/customer/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const errorData = JSON.parse(text);
        return { data: null, error: errorData.message || 'Failed to create address' };
      } catch {
        return { data: null, error: text || 'Failed to create address' };
      }
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: 'Network error' };
  }
}
