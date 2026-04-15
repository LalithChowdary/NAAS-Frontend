import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** GET /api/admin/me — returns current admin profile */
export async function GET() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/api/admin/me`, { headers, cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** PUT /api/admin/me — update current admin profile */
export async function PUT(req: NextRequest) {
  const headers = await getAuthHeader();
  const body = await req.json();
  const res = await fetch(`${API_URL}/api/admin/me`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
