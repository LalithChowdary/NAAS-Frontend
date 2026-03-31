import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public auth routes
  const isPublicAuthRoute = path === '/login' || path === '/signup';

  // Define protected routes
  const isProtectedRoute = path.startsWith('/customer');

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // 1. If trying to access protected route without token -> redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If authenticated and trying to access login/signup -> redirect to dashboard
  if (isPublicAuthRoute && token) {
    return NextResponse.redirect(new URL('/customer', request.url));
  }

  return NextResponse.next();
}

// Config specifies which routes the middleware should run on
export const config = {
  matcher: ['/customer/:path*', '/login', '/signup'],
};
