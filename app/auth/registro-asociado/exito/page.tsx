import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { CheckCircle, Mail, Clock, Home } from 'lucide-react'

export default function AssociateSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="xl" />
          </Link>
        </div>

        {/* Success Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-cormorant font-light text-gray-900 mb-2">
              ¡Solicitud Enviada!
            </h2>
            
            <p className="text-gray-600 mb-8">
              Tu solicitud para ser asociado profesional ha sido enviada exitosamente. 
              Nuestro equipo la revisará pronto.
            </p>

            {/* Next Steps */}
            <div className="text-left mb-8 space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Confirmación por email</h4>
                  <p className="text-sm text-gray-600">
                    Recibirás un email de confirmación en los próximos minutos
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Revisión en 24-48h</h4>
                  <p className="text-sm text-gray-600">
                    Nuestro equipo verificará tu documentación y te notificará el resultado
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Activación automática</h4>
                  <p className="text-sm text-gray-600">
                    Una vez aprobado, el descuento del 20% se aplicará automáticamente
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-bloom-primary hover:bg-bloom-primary/90 transition-all"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
              
              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                Iniciar Sesión
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                ¿Tienes alguna pregunta? Contáctanos en{' '}
                <a 
                  href="mailto:asociados@bloommarbella.es" 
                  className="text-bloom-primary hover:text-bloom-secondary font-medium"
                >
                  asociados@bloommarbella.es
                </a>
                {' '}o llámanos al{' '}
                <a 
                  href="tel:+34952123456" 
                  className="text-bloom-primary hover:text-bloom-secondary font-medium"
                >
                  +34 952 123 456
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}