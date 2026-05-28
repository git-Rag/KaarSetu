import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith('/worker') || pathname.startsWith('/assessor') || pathname.startsWith('/employer') || pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const role = session.user?.role;
    if (pathname.startsWith('/worker') && role !== 'WORKER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase()}/dashboard`, req.url));
    }
    if (pathname.startsWith('/assessor') && role !== 'ASSESSOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase()}/dashboard`, req.url));
    }
    if (pathname.startsWith('/employer') && role !== 'EMPLOYER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase()}/dashboard`, req.url));
    }
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase()}/dashboard`, req.url));
    }
  }

  if ((pathname === '/login' || pathname.startsWith('/register')) && session) {
    const role = session.user?.role?.toLowerCase();
    return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
