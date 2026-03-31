import { cookies } from 'next/headers';
import DeliveriesLedgerClient from './DeliveriesLedgerClient';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getDeliveries() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return [];

  try {
    const res = await fetch(`${BACKEND_API_URL}/api/delivery/customer`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

async function getSubscriptions() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return [];

  try {
    const res = await fetch(`${BACKEND_API_URL}/api/customer/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function AllDeliveriesPage() {
  const [deliveries, subscriptions] = await Promise.all([getDeliveries(), getSubscriptions()]);

  return <DeliveriesLedgerClient actualDeliveries={deliveries} subscriptions={subscriptions} />;
}
