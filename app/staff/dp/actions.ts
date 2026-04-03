'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function dpLogin(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Login failed' };
    }

    // Role validation
    if (data.role !== 'DELIVERY_PERSON' && data.role !== 'DELIVERY') {
      return { error: 'Access denied. Delivery personnel only.' };
    }

    const cookieStore = await cookies();
    // Set token
    cookieStore.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    // Set role
    cookieStore.set('role', data.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    // Fetch DP profile to get ID
    const meRes = await fetch(`${API_URL}/api/delivery-person/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${data.token}` }
    });

    if (meRes.ok) {
      const meData = await meRes.json();
      cookieStore.set('dp_id', meData.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }

  } catch (error) {
    return { error: 'Network error occurred. Please try again.' };
  }

  // Redirect on success (must be outside try-catch for Next.js to throw redirect correctly)
  redirect('/staff/dp');
}

export async function getDpAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export async function dpLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('role');
  cookieStore.delete('dp_id');
  redirect('/staff/dp/login');
}

export async function dpSignup(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;
  const assignedArea = formData.get('assignedArea') as string;

  try {
    const res = await fetch(`${API_URL}/api/delivery-person/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, password, assignedArea }),
    });

    if (!res.ok) {
      if (res.status === 409 || res.status === 500) return { error: 'Email already exists or invalid data.' };
      return { error: 'Failed to submit application.' };
    }

    return { error: null, success: true };
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
}


export async function fetchTodayDeliveries() {
  const cookieStore = await cookies();
  const dpId = cookieStore.get('dp_id')?.value;
  if (!dpId) throw new Error('Delivery Person profile not bound');

  // Time format backend expects: yyyy-MM-dd
  // Example for today
  const today = new Date().toISOString().split('T')[0];

  const res = await fetch(`${API_URL}/api/delivery/schedule?deliveryPersonId=${dpId}&date=${today}`, {
    headers: await getDpAuthHeader(),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch deliveries');
  }

  return res.json();
}

export async function fetchDpProfile() {
  const res = await fetch(`${API_URL}/api/delivery-person/me`, {
    headers: await getDpAuthHeader(),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch delivery person profile');
  }

  return res.json();
}

export async function updateDpProfile(data: { name: string; phone: string }) {
  const res = await fetch(`${API_URL}/api/delivery-person/me`, {
    method: 'PUT',
    headers: await getDpAuthHeader(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update profile');
  }

  return res.json();
}

export async function fetchDpDeliveriesByDate(dateStr: string) {
  const cookieStore = await cookies();
  const dpId = cookieStore.get('dp_id')?.value;
  if (!dpId) return [];

  const res = await fetch(`${API_URL}/api/delivery/schedule?deliveryPersonId=${dpId}&date=${dateStr}`, {
    headers: await getDpAuthHeader(),
    cache: 'no-store'
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export async function fetchDpHistory() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    throw new Error('Session expired. Please log in again.');
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const res = await fetch(`${API_URL}/api/delivery/person/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    let errorMessage = `Failed to load delivery history (${res.status}).`;
    try {
      const errorBody = await res.json();
      if (errorBody?.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      try {
        const errorText = await res.text();
        if (errorText) {
          errorMessage = `${errorMessage} ${errorText}`;
        }
      } catch {
        // Keep default error message when response body is not readable.
      }
    }
    throw new Error(errorMessage);
  }
  return res.json();
}
