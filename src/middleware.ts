import { NextResponse, type NextRequest } from 'next/server';

// Admin app: every route EXCEPT /login requires authentication.
// Role check (role === 'ADMIN') happens on the backend `/auth/login` response
// and is enforced on each page via `useCurrentUser` once mounted.
const PUBLIC_PATHS = ['/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('access_token')?.value;
  if (token) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Match everything except Next.js internals and static assets
  matcher: ['/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)'],
};
