import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirecciones de URLs plural a singular
    if (path.startsWith('/catalogo/brands/')) {
      const brandSlug = path.split('/catalogo/brands/')[1]
      return NextResponse.redirect(new URL(`/catalogo/marca/${brandSlug}`, req.url), 301)
    }
    
    if (path.startsWith('/catalogo/categories/') || path.startsWith('/catalogo/categorias/')) {
      const segments = path.split('/')
      const categorySlug = segments[3] // /catalogo/categories/slug -> segments[3]
      if (categorySlug) {
        return NextResponse.redirect(new URL(`/catalogo/categoria/${categorySlug}`, req.url), 301)
      }
    }

    // Admin routes
    if (path.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${path}`, req.url))
      }
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
      }
    }

    // Associate routes
    if (path.startsWith('/asociados')) {
      if (!token) {
        return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${path}`, req.url))
      }
      if (!['ADMIN', 'ASSOCIATE'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
      }
    }

    // User account routes (except favorites which should be accessible to anonymous users)
    if (path.startsWith('/cuenta') && !path.startsWith('/cuenta/favoritos') && !token) {
      // Simply redirect to login with the current path as callback
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${path}`, req.url))
    }
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle authorization
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/asociados/:path*',
    '/cuenta/((?!favoritos).)*', // Excluir /cuenta/favoritos del middleware
    '/catalogo/brands/:path*', // Redirección de brands -> marca
    '/catalogo/categories/:path*', // Redirección de categories -> categoria
    '/catalogo/categorias/:path*', // Redirección de categorias -> categoria
  ],
}