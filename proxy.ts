import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'smartbudget_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(COOKIE_NAME)?.value;

  const isPublicAsset =
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/apple-touch-icon.png' ||
    pathname === '/apple-touch-icon-precomposed.png' ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.png' ||
    pathname === '/sw.js' ||
    pathname === '/offline' ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.');

  if (isPublicAsset) {
    return NextResponse.next();
  }

  const isAuthPage =
    pathname === '/auth/signin' || pathname === '/auth/signup';

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isOnboardingRoute = pathname.startsWith('/onboarding');

  if ((isDashboardRoute || isOnboardingRoute) && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)'],
};