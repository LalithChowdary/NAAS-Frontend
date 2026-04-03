import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public auth routes
  const isPublicAuthRoute = path === '/login' || path === '/signup';

  // Define protected routes
  const isProtectedRoute = path.startsWith('/customer');
  const isAdminRoute = path.startsWith('/staff/admin') && path !== '/staff/admin/login';
  const isAdminLogin = path === '/staff/admin/login';
  const isDeliveryRoute = path.startsWith('/staff/dp') && path !== '/staff/dp/login' && path !== '/staff/dp/signup';
  const isDeliveryLogin = path === '/staff/dp/login' || path === '/staff/dp/signup';

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Get role from cookies (set during login)
  const roleCookie = request.cookies.get('role')?.value;
  const role = roleCookie || 'CUSTOMER';

  // 1. If trying to access protected route without token -> redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Block non-admins from admin routes
  if (isAdminRoute && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/staff/admin/login', request.url));
  }

  // 3. If Admin user trying to access admin login -> dashboard
  if (isAdminLogin && role === 'ADMIN') {
    return NextResponse.redirect(new URL('/staff/admin', request.url));
  }

  // Block non-delivery personnel from DP routes
  const isDpRole = role === 'DELIVERY_PERSON' || role === 'DELIVERY';
  if (isDeliveryRoute && !isDpRole) {
    return NextResponse.redirect(new URL('/staff/dp/login', request.url));
  }

  if (isDeliveryLogin && isDpRole) {
    return NextResponse.redirect(new URL('/staff/dp', request.url));
  }

  // 4. If authenticated and trying to access login/signup -> redirect appropriately
  if (isPublicAuthRoute && token) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/staff/admin', request.url));
    if (role === 'DELIVERY_PERSON' || role === 'DELIVERY') return NextResponse.redirect(new URL('/staff/dp', request.url));
    return NextResponse.redirect(new URL('/customer', request.url));
  }

  return NextResponse.next();
}

// Config specifies which routes the middleware should run on
export const config = {
  matcher: ['/customer/:path*', '/login', '/signup', '/staff/admin/:path*', '/staff/dp/:path*'],
};
