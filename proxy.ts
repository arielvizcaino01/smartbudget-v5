import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("smartbudget_session")?.value);
  const { pathname } = request.nextUrl;

  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) && !hasSession) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if ((pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup")) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/auth/signin", "/auth/signup"]
};
