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

export async function fetchHubsAction() {
  const res = await fetch(`${API_URL}/api/hubs`, { headers: await getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch hubs');
  return res.json();
}

export async function deleteHubAction(id: string) {
  const res = await fetch(`${API_URL}/api/hubs/${id}`, { method: 'DELETE', headers: await getAuthHeader() });
  if (!res.ok) throw new Error('Failed to delete hub');
}

export async function saveHubAction(hub: any, isEdit: boolean) {
  const url = isEdit ? `${API_URL}/api/hubs/${hub.id}` : `${API_URL}/api/hubs`;
  const res = await fetch(url, {
    method: isEdit ? 'PUT' : 'POST',
    headers: await getAuthHeader(),
    body: JSON.stringify(hub)
  });
  if (!res.ok) throw new Error('Failed to save hub');
  return res.json();
}
