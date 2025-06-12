import { NextResponse } from 'next/server';

export function middleware(request) {
  const role = request.cookies.get('Role')?.value;
  const isAuth = request.cookies.get('isAuthenticated')?.value;

  // Admin routes protection
  if (request.nextUrl.pathname.startsWith('/admin') && (!isAuth || role !== 'Admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // User routes protection
  const userRoutes = ['/dashboard', '/project', '/view-checklist'];
  if (userRoutes.some(path => request.nextUrl.pathname.startsWith(path)) && (!isAuth || role !== 'User')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}