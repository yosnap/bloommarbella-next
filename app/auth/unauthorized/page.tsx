import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ShieldOff, Home, LogIn } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="xl" />
          </Link>
        </div>

        {/* Unauthorized Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
              <ShieldOff className="h-8 w-8 text-orange-600" />
            </div>
            
            <h2 className="text-2xl font-cormorant font-light text-gray-900 mb-2">
              Acceso No Autorizado
            </h2>
            
            <p className="text-gray-600 mb-8">
              No tienes permisos para acceder a esta sección. Si crees que esto es un error, 
              por favor contacta con el administrador.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-bloom-primary hover:bg-bloom-primary/90 transition-all"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Link>
              
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              ¿Necesitas ayuda? Contacta con{' '}
              <a href="mailto:info@bloommarbella.es" className="text-bloom-primary hover:text-bloom-secondary">
                info@bloommarbella.es
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}