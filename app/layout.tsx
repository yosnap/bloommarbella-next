import type { Metadata } from 'next'
import { Inter, Cormorant_Infant } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { NextAuthProvider } from '@/components/providers/session-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { PricingProvider } from '@/contexts/pricing-context'
import { ToastProvider } from '@/contexts/toast-context'
import { FavoritesProvider } from '@/contexts/favorites-context'
import { ToastContainer } from '@/components/ui/toast'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const cormorant = Cormorant_Infant({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'Bloom Marbella - Premium Plants & Garden Design',
  description: 'Discover premium plants, planters, and garden design services. Your trusted partner for creating beautiful green spaces in Marbella.',
  keywords: 'plants, garden design, planters, Marbella, landscaping, indoor plants, outdoor plants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={cn(
          inter.variable,
          cormorant.variable,
          "font-sans antialiased"
        )}
        suppressHydrationWarning
      >
        <NextAuthProvider>
          <AuthProvider>
            <PricingProvider>
              <ToastProvider>
                <FavoritesProvider>
                  {children}
                  <ToastContainer />
                </FavoritesProvider>
              </ToastProvider>
            </PricingProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}