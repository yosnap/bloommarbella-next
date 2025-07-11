'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'Error de configuración del servidor',
    AccessDenied: 'Acceso denegado',
    Verification: 'El enlace de verificación ha expirado o es inválido',
    Default: 'Ha ocurrido un error durante la autenticación',
  }

  const errorMessage = errorMessages[error || ''] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="xl" />
          </Link>
        </div>

        {/* Error Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-cormorant font-light text-gray-900 mb-2">
              Error de Autenticación
            </h2>
            
            <p className="text-gray-600 mb-8">
              {errorMessage}
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-bloom-primary hover:bg-bloom-primary/90 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Iniciar Sesión
              </Link>
              
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}