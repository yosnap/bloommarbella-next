'use client'

import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/layouts/header'
import { ArrowLeft, Package, Calendar, CreditCard, Truck } from 'lucide-react'
import Link from 'next/link'

export default function PedidosPage() {
  const { user, isLoading } = useAuth()

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
      
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/cuenta" 
              className="inline-flex items-center text-bloom-primary hover:text-bloom-primary/80 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Mi Cuenta
            </Link>
            <h1 className="text-3xl font-cormorant font-medium text-gray-900">
              Mis Pedidos
            </h1>
            <p className="text-gray-600 mt-2">
              Historial de todas tus compras
            </p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-600 mb-8">
              Cuando realices tu primera compra, aparecerá aquí
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center px-6 py-3 bg-bloom-primary text-white rounded-lg font-medium hover:bg-bloom-primary/90 transition-colors"
            >
              Explorar Productos
            </Link>
          </div>

          {/* TODO: Aquí irá la lista de pedidos cuando esté implementado el sistema de compras */}
        </div>
      </div>
    </div>
  )
}