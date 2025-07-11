'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/layouts/header'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Building, 
  Phone,
  MapPin,
  Percent,
  Star,
  Shield,
  Gift
} from 'lucide-react'
import Link from 'next/link'

interface AssociateRequest {
  id: string
  companyName: string
  taxId: string
  phone: string
  address: string
  city: string
  postalCode: string
  documentType: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  createdAt: string
}

export default function AssociatesPage() {
  const { user, isAuthenticated, isAssociate, isLoading } = useAuth()
  const [request, setRequest] = useState<AssociateRequest | null>(null)
  const [requestLoading, setRequestLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAssociateRequest()
    }
  }, [isAuthenticated, user])

  const fetchAssociateRequest = async () => {
    try {
      const res = await fetch('/api/associate-request')
      if (res.ok) {
        const data = await res.json()
        setRequest(data.request)
      }
    } catch (error) {
      console.error('Error fetching associate request:', error)
    } finally {
      setRequestLoading(false)
    }
  }

  if (isLoading || requestLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bloom-primary"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-3xl font-cormorant font-light text-gray-900 mb-4">
              Área de Asociados
            </h1>
            <p className="text-gray-600 mb-8">
              Debes iniciar sesión para acceder al área de asociados
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 bg-bloom-primary text-white rounded-lg font-medium hover:bg-bloom-primary/90 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h1 className="text-3xl font-cormorant font-light text-gray-900 mb-2">
              Área de Asociados
            </h1>
            <p className="text-gray-600">
              Gestiona tu cuenta de asociado profesional y disfruta de beneficios exclusivos
            </p>
          </div>

          {/* Associate Status */}
          {isAssociate ? (
            // Approved Associate
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 text-white mb-8">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-cormorant font-medium">
                      ¡Eres Asociado Verificado!
                    </h2>
                  </div>
                  <p className="text-green-100 mb-6">
                    Tu cuenta ha sido verificada exitosamente. Disfruta de todos los beneficios exclusivos.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Percent className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-2xl font-bold">20%</div>
                      <div className="text-sm text-green-100">Descuento</div>
                    </div>
                    <div className="text-center">
                      <Star className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-2xl font-bold">VIP</div>
                      <div className="text-sm text-green-100">Acceso Prioritario</div>
                    </div>
                    <div className="text-center">
                      <Gift className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-2xl font-bold">∞</div>
                      <div className="text-sm text-green-100">Ofertas Exclusivas</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
                  <div className="space-y-3">
                    <Link href="/shop" className="block text-bloom-primary hover:text-bloom-secondary">
                      • Catálogo con Descuentos
                    </Link>
                    <Link href="/cuenta/pedidos" className="block text-bloom-primary hover:text-bloom-secondary">
                      • Mis Pedidos
                    </Link>
                    <Link href="/asociados/ofertas" className="block text-bloom-primary hover:text-bloom-secondary">
                      • Ofertas Exclusivas
                    </Link>
                    <Link href="/asociados/facturacion" className="block text-bloom-primary hover:text-bloom-secondary">
                      • Datos de Facturación
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Soporte Profesional</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Acceso directo a nuestro equipo especializado
                  </p>
                  <a 
                    href="mailto:asociados@bloommarbella.es"
                    className="text-bloom-primary hover:text-bloom-secondary text-sm font-medium"
                  >
                    asociados@bloommarbella.es
                  </a>
                </div>
              </div>
            </div>
          ) : request ? (
            // Pending or Rejected Request
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${
                  request.status === 'PENDING' ? 'bg-yellow-100' :
                  request.status === 'REJECTED' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {request.status === 'PENDING' && <Clock className="h-6 w-6 text-yellow-600" />}
                  {request.status === 'REJECTED' && <XCircle className="h-6 w-6 text-red-600" />}
                  {request.status === 'APPROVED' && <CheckCircle className="h-6 w-6 text-green-600" />}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-cormorant font-medium text-gray-900 mb-2">
                    {request.status === 'PENDING' && 'Solicitud en Revisión'}
                    {request.status === 'REJECTED' && 'Solicitud Rechazada'}
                    {request.status === 'APPROVED' && 'Solicitud Aprobada'}
                  </h2>
                  
                  <p className="text-gray-600 mb-4">
                    {request.status === 'PENDING' && 
                      'Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por email cuando esté lista.'
                    }
                    {request.status === 'REJECTED' && 
                      'Tu solicitud ha sido rechazada. Puedes revisar el motivo y enviar una nueva solicitud.'
                    }
                    {request.status === 'APPROVED' && 
                      'Tu solicitud ha sido aprobada. Los beneficios de asociado ya están activos en tu cuenta.'
                    }
                  </p>

                  {request.status === 'REJECTED' && request.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Motivo del rechazo:</h4>
                          <p className="text-sm text-red-700 mt-1">{request.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Request Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Información de la Empresa
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Empresa:</strong> {request.companyName}</p>
                        <p><strong>CIF/NIF:</strong> {request.taxId}</p>
                        <p><strong>Teléfono:</strong> {request.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Dirección
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>{request.address}</p>
                        <p>{request.city}, {request.postalCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 mr-2" />
                      Documento: {request.documentType.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Enviado: {new Date(request.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  {request.status === 'REJECTED' && (
                    <div className="mt-6">
                      <Link
                        href="/auth/registro-asociado"
                        className="inline-flex items-center px-4 py-2 bg-bloom-primary text-white rounded-lg hover:bg-bloom-primary/90 transition-colors"
                      >
                        Enviar Nueva Solicitud
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // No Request Yet
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 text-center">
              <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-cormorant font-light text-gray-900 mb-4">
                Conviértete en Asociado Profesional
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Únete a nuestro programa de asociados y disfruta de un 20% de descuento permanente 
                en todos nuestros productos, acceso prioritario y ofertas exclusivas.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-bloom-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Percent className="h-8 w-8 text-bloom-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">20% Descuento</h3>
                  <p className="text-sm text-gray-600">En todos nuestros productos</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-bloom-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-bloom-secondary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Acceso VIP</h3>
                  <p className="text-sm text-gray-600">Productos exclusivos y lanzamientos anticipados</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ofertas Especiales</h3>
                  <p className="text-sm text-gray-600">Promociones exclusivas para asociados</p>
                </div>
              </div>

              <Link
                href="/auth/registro-asociado"
                className="inline-flex items-center px-8 py-4 bg-bloom-primary text-white rounded-lg font-medium hover:bg-bloom-primary/90 transition-colors"
              >
                Solicitar Ser Asociado
              </Link>
            </div>
          )}

          {/* Benefits Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-cormorant font-light text-gray-900 mb-6">
              Beneficios de Ser Asociado
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Percent className="h-6 w-6 text-bloom-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Descuento Permanente</h4>
                  <p className="text-sm text-gray-600">20% de descuento en todos los productos, aplicado automáticamente</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Star className="h-6 w-6 text-bloom-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Acceso Prioritario</h4>
                  <p className="text-sm text-gray-600">Primero en conocer nuevos productos y tendencias</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Soporte Especializado</h4>
                  <p className="text-sm text-gray-600">Línea directa con nuestros expertos en jardinería</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Gift className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Ofertas Exclusivas</h4>
                  <p className="text-sm text-gray-600">Promociones especiales solo para asociados</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Facturación Empresarial</h4>
                  <p className="text-sm text-gray-600">Facturas con datos fiscales para tu empresa</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Atención Personalizada</h4>
                  <p className="text-sm text-gray-600">Gestor comercial dedicado para grandes proyectos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}