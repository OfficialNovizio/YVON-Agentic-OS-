// Operator auth (TS-001 WI-3b) — single-role gate.
// Degrades loudly: if OPERATOR_KEY is unset, auth is DISABLED and every
// response carries a warning header — set it in dashboard/.env.local.
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const key = process.env.OPERATOR_KEY;
  if (!key) {
    const res = NextResponse.next();
    res.headers.set('x-yvon-auth', 'DISABLED — set OPERATOR_KEY in dashboard/.env.local');
    return res;
  }

  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const authed = req.cookies.get('yvon_op')?.value === key;
  if (!authed) {
    if (pathname.startsWith('/api')) {
      return new NextResponse('unauthorized', { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
