import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }

    // Associate routes
    if (path.startsWith('/asociados') && !['ADMIN', 'ASSOCIATE'].includes(token?.role as string)) {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }

    // User account routes
    if (path.startsWith('/cuenta') && !token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/asociados/:path*',
    '/cuenta/:path*',
  ],
}