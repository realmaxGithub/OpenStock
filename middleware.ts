import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedPathnames = [
  '/',
  '/watchlist',
  '/api-docs',
  '/help',
  '/terms',
  '/about',
  '/stocks',
];

function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(en|zh-TW|zh-HK)(\/|$)/, '$2') || '/';
  return protectedPathnames.some(
    (p) => withoutLocale === p || (p !== '/' && withoutLocale.startsWith(p + '/'))
  );
}

function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/')[1];
  return routing.locales.includes(segment as 'en' | 'zh-TW' | 'zh-HK')
    ? segment
    : routing.defaultLocale;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Run next-intl first (locale detection & rewrite)
  const response = await intlMiddleware(request);

  // Auth check: protect dashboard routes when no session
  const sessionCookie = getSessionCookie(request);
  const locale = getLocaleFromPathname(pathname);

  if (!sessionCookie && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
