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

export async function fetchPublications(search?: string, enabled?: string) {
  let url = `${API_URL}/api/admin/publications`;
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (enabled === 'true') params.append('enabled', 'true');
  if (enabled === 'false') params.append('enabled', 'false');
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await fetch(url, { 
    headers: await getAuthHeader(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch publications');
  return res.json();
}

export async function createPublication(data: any) {
  const res = await fetch(`${API_URL}/api/admin/publications`, {
    method: 'POST',
    headers: await getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create publication');
  return res.json();
}

export async function updatePublication(id: number, data: any) {
  const res = await fetch(`${API_URL}/api/admin/publications/${id}`, {
    method: 'PUT',
    headers: await getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update publication');
  return res.json();
}

export async function togglePublicationStatus(id: number, enabled: boolean) {
  const res = await fetch(`${API_URL}/api/admin/publications/${id}/status`, {
    method: 'PATCH',
    headers: await getAuthHeader(),
    body: JSON.stringify({ enabled })
  });
  if (!res.ok) throw new Error('Failed to toggle status');
  return res.json();
}
