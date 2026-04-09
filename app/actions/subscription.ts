'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function createSubscriptionAction(payload: {
  items: { publicationId: number; frequency?: string; customDeliveryDays?: string }[];
  startDate: string;
  addressId?: number;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { error: 'You must be logged in to subscribe.' };
  }

  try {
    const res = await fetch(`${API_URL}/api/customer/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { message: text };
      }
      return { error: errorData.message || 'Failed to create subscription.' };
    }

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}

export async function suspendSubscriptionAction(subId: number, suspendStartDate: string, suspendEndDate: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Unauthorized' };

  try {
    const res = await fetch(`${API_URL}/api/customer/subscriptions/${subId}/suspend`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ suspendStartDate, suspendEndDate })
    });

    if (!res.ok) {
      const text = await res.text();
      try { return { error: JSON.parse(text).message }; }
      catch { return { error: text || 'Failed to suspend' }; }
    }
    return { success: true };
  } catch (err) {
    return { error: 'Network error' };
  }
}

export async function cancelSubscriptionAction(subId: number, cancelDate: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Unauthorized' };

  try {
    const res = await fetch(`${API_URL}/api/customer/subscriptions/${subId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cancelDate })
    });

    if (!res.ok) {
      const text = await res.text();
      try { return { error: JSON.parse(text).message }; }
      catch { return { error: text || 'Failed to cancel' }; }
    }
    return { success: true };
  } catch (err) {
    return { error: 'Network error' };
  }
}

export async function updateSubscriptionItemAction(
  subId: string | number,
  itemId: string,
  status: string | null,
  stopStartDate: string | null,
  stopEndDate: string | null
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Unauthorized' };

  try {
    const payload: any = {};
    if (status) payload.status = status;
    if (stopStartDate) payload.stopStartDate = stopStartDate;
    if (stopEndDate) payload.stopEndDate = stopEndDate;

    const res = await fetch(`${API_URL}/api/customer/subscriptions/${subId}/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      try { return { error: JSON.parse(text).message }; }
      catch { return { error: text || 'Failed to update item' }; }
    }
    return { success: true };
  } catch (err) {
    return { error: 'Network error' };
  }
}
