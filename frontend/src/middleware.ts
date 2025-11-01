import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  if (isProtectedRoute) {
    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';

      return NextResponse.redirect(url);
    }
  }

  if (isAuthRoute) {
    if (accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};