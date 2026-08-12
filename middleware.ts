import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProduction = process.env.VERCEL_ENV === 'production';
  const isLaunchPage = pathname === '/proximamente';
  const isOperationalRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml';

  if (isProduction && !isLaunchPage && !isOperationalRoute) {
    const launchUrl = request.nextUrl.clone();
    launchUrl.pathname = '/proximamente';
    launchUrl.search = '';

    return NextResponse.redirect(launchUrl, 307);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
