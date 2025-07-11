'use client'

import { useAuth } from '@/contexts/auth-context'
import { signOut } from 'next-auth/react'
import { Header } from '@/components/layouts/header'
import { User, ShoppingBag, Heart, MapPin, LogOut, Shield, Percent } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
  const { user, isLoading, isAssociate, isAdmin } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bloom-primary"></div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-bloom-primary rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-cormorant font-medium text-gray-900">
                    Hola, {user?.name || 'Usuario'}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                  {isAssociate && (
                    <div className="inline-flex items-center px-3 py-1 bg-bloom-secondary/10 text-bloom-secondary rounded-full text-sm font-medium mt-2">
                      <Percent className="w-4 h-4 mr-1" />
                      Usuario Asociado - 20% descuento
                    </div>
                  )}
                  {isAdmin && (
                    <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mt-2">
                      <Shield className="w-4 h-4 mr-1" />
                      Administrador
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/cuenta/pedidos" className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <ShoppingBag className="h-8 w-8 text-bloom-primary mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1">Mis Pedidos</h3>
              <p className="text-sm text-gray-600">Ver historial de compras</p>
            </Link>

            <Link href="/cuenta/favoritos" className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <Heart className="h-8 w-8 text-red-500 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1">Favoritos</h3>
              <p className="text-sm text-gray-600">Productos guardados</p>
            </Link>

            <Link href="/cuenta/direcciones" className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <MapPin className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1">Direcciones</h3>
              <p className="text-sm text-gray-600">Gestionar direcciones</p>
            </Link>

            <Link href="/cuenta/perfil" className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <User className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1">Mi Perfil</h3>
              <p className="text-sm text-gray-600">Editar información</p>
            </Link>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-cormorant font-medium mb-4">Panel de Administración</h2>
              <p className="mb-6 opacity-90">Accede a las herramientas de gestión del sitio</p>
              <Link
                href="/admin"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <Shield className="w-5 h-5 mr-2" />
                Ir al Panel Admin
              </Link>
            </div>
          )}

          {/* Associate Benefits */}
          {isAssociate && (
            <div className="bg-gradient-to-r from-bloom-secondary to-orange-500 rounded-2xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-cormorant font-medium mb-4">Beneficios de Asociado</h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Percent className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>20% de descuento en todos los productos</span>
                </li>
                <li className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Acceso anticipado a nuevos productos</span>
                </li>
                <li className="flex items-center">
                  <Heart className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Ofertas exclusivas para asociados</span>
                </li>
              </ul>
              <Link
                href="/asociados"
                className="inline-flex items-center px-6 py-3 bg-white text-bloom-secondary rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Ver Área de Asociados
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}