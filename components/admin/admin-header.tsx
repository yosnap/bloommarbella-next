'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, Settings, Info } from 'lucide-react'

export function AdminHeader() {
  const router = useRouter()

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver al Panel</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">Panel de Administración</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home size={18} />
              <span>Inicio</span>
            </button>
            <button
              onClick={() => router.push('/admin/sistema')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Info size={18} />
              <span>Sistema</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-[#183a1d] text-white px-4 py-2 rounded-lg hover:bg-[#2a5530] transition-colors text-sm"
            >
              Ver Sitio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}