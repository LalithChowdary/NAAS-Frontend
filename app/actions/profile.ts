'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function updateProfileAction(data: {
  name?: string;
  phone?: string;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/customer/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { error: 'Failed to update profile' };
    }

    revalidatePath('/customer');
    return { success: true };
  } catch (error) {
    return { error: 'An error occurred while updating the profile' };
  }
}
