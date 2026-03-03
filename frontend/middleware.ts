import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Protect /admin, /profile, /rewards routes
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/profile') || pathname.startsWith('/rewards')
  if (isProtected) {
    const token = req.cookies.get('token')?.value
    const mockUser = req.cookies.get('mock_user')?.value
    const mockAuth = process.env.MOCK_AUTH === 'true'
    // In real-auth mode, require token strictly; ignore mock_user
    if (!mockAuth) {
      if (!token) {
        const url = req.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
      }
    } else {
      // Mock mode: accept either token or mock_user
      if (!token && !mockUser) {
        const url = req.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
      }
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/rewards/:path*']
}
