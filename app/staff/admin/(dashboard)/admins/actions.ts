'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export async function fetchAdmins() {
  const res = await fetch(`${API_URL}/api/admin/admins`, {
    headers: await getAuthHeader(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch admins');
  return res.json();
}

export async function toggleAdminStatus(id: string, active: boolean) {
  const res = await fetch(`${API_URL}/api/admin/admins/${id}/status?active=${active}`, {
    method: 'PATCH',
    headers: await getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to update admin status');
  return res.json();
}

export async function createAdmin(data: any) {
  const res = await fetch(`${API_URL}/api/admin/create-admin`, {
    method: 'POST',
    headers: await getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to create admin');
  }
  return res.json();
}
