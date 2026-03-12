import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/register', '/'];
  const authToken = request.cookies.get('session')?.value;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (isDashboardRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicRoute && authToken && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};