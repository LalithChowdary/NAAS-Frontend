'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const JWT_TTL_SECONDS = 60 * 60 * 24;

export async function login(_prevState: unknown, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, expectedRole: 'CUSTOMER' }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || 'Invalid credentials. Please try again.' };
    }

    const data = await res.json();

    // Defense in Depth: Explicit frontend validation
    if (data.role !== 'CUSTOMER') {
      return { error: 'Access denied. Customers only.' };
    }

    // Store token securely in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('customer_token', data.token, {
      httpOnly: true,
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
  redirect('/customer');
}

export async function signup(_prevState: unknown, formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!name || !email || !password) {
    return { error: 'Please fill out all fields.' };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'CUSTOMER' }), // Assuming backend can accept role or defaults to customer
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || 'Signup failed. Email might already be in use.' };
    }

    // Auto-login after successful signup (optional, if your backend returns a token on signup)
    // If not, we can redirect to login. We will assume standard token return.
    const data = await res.json();
    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set('customer_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: JWT_TTL_SECONDS,
      });
    }

  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }

  // If token was set, this redirects safely.
  redirect('/customer?onboarding=true');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('customer_token');
  cookieStore.delete('role');
  redirect('/login');
}
