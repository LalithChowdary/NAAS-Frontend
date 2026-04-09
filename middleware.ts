import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isJwtExpired(token: string) {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;

    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as { exp?: number };

    if (!payload.exp) return true;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function clearSessionAndRedirect(request: NextRequest, redirectPath: string, tokenName: string, idCookieName?: string) {
  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  response.cookies.delete(tokenName);
  if (idCookieName) response.cookies.delete(idCookieName);
  return response;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const adminToken = request.cookies.get('admin_token')?.value;
  const dpToken = request.cookies.get('dp_token')?.value;
  const customerToken = request.cookies.get('customer_token')?.value;

  // 1. Admin Portal Routing
  if (path.startsWith('/staff/admin')) {
    if (path === '/staff/admin/login') {
      if (adminToken && !isJwtExpired(adminToken)) {
        return NextResponse.redirect(new URL('/staff/admin', request.url));
      }
      return NextResponse.next();
    }
    if (!adminToken || isJwtExpired(adminToken)) {
      return clearSessionAndRedirect(request, '/staff/admin/login', 'admin_token');
    }
    return NextResponse.next();
  }

  // 2. Delivery Personnel Routing
  if (path.startsWith('/staff/dp')) {
    if (path === '/staff/dp/login' || path === '/staff/dp/signup') {
      if (dpToken && !isJwtExpired(dpToken)) {
        return NextResponse.redirect(new URL('/staff/dp', request.url));
      }
      return NextResponse.next();
    }
    if (!dpToken || isJwtExpired(dpToken)) {
      return clearSessionAndRedirect(request, '/staff/dp/login', 'dp_token', 'dp_id');
    }
    return NextResponse.next();
  }

  // 3. Customer Portal Routing
  if (path.startsWith('/customer')) {
    if (!customerToken || isJwtExpired(customerToken)) {
      return clearSessionAndRedirect(request, '/login', 'customer_token');
    }
    return NextResponse.next();
  }

  // 4. Root & Public Entry Routing (Customer)
  if (path === '/login' || path === '/signup') {
    if (customerToken && !isJwtExpired(customerToken)) {
      return NextResponse.redirect(new URL('/customer', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/login', '/signup', '/staff/admin/:path*', '/staff/dp/:path*'],
};
