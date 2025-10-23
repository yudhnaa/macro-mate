import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log("====> Middleware run:", request.nextUrl.pathname);
  
  const token = request.cookies.get('access_token')?.value
  console.log("====> Token:", token ? "exists" : "not found");

  // Chặn truy cập /planner nếu chưa đăng nhập
  if (!token && request.nextUrl.pathname.startsWith('/planner')) {
    console.log("====> Redirecting to login");
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect về /planner nếu đã đăng nhập mà vào login/register
  if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    console.log("====> Redirecting to planner");
    return NextResponse.redirect(new URL('/planner', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/planner/:path*',
    '/login',
    '/register'
  ]
}
