import { NextResponse } from 'next/server';

export function middleware(request) {
  const isAuth = request.cookies.get('isAuthenticated')?.value;

  const userRoutes = ['/dashboard', '/project', '/view-checklist'];
  if (userRoutes.some(path => request.nextUrl.pathname.startsWith(path)) && !isAuth) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}