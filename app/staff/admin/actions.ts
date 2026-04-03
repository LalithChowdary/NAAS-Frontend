'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function adminLogin(prevState: any, formData: FormData) {
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
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    cookieStore.set('role', role, {
      httpOnly: false, // We might need this in middleware
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }

  // Redirect must be called outside the try-catch block
  redirect('/staff/admin');
}

export async function getAdminAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
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


