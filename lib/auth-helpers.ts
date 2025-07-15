import { NextRequest } from 'next/server'

/**
 * Get the correct auth URL based on the request headers
 * This handles both localhost and network IP access
 */
export function getAuthUrl(request?: NextRequest | Request): string {
  // If we have a request object, try to get the host from headers
  if (request) {
    const host = request.headers.get('host')
    if (host) {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
      return `${protocol}://${host}`
    }
  }
  
  // Fallback to environment variable
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

/**
 * Get base URL for the application
 */
export function getBaseUrl(): string {
  // In the browser, use relative URLs
  if (typeof window !== 'undefined') {
    return ''
  }
  
  // On the server, use the NEXTAUTH_URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Fallback for development
  return 'http://localhost:3000'
}