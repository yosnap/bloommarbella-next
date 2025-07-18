'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SyncStats {
  totalProducts: number
  lastSync: string
  syncInProgress: boolean
  recentErrors: number
}

interface SyncResult {
  success: boolean
  newProducts: number
  updatedProducts: number
  errors: number
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }
    
    if (session.user.role !== 'ADMIN') {
      router.push('/auth/unauthorized')
      return
    }

    loadStats()
  }, [session, status, router])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async (type: 'changes' | 'full') => {
    setIsSyncing(true)
    setSyncResult(null)
    
    try {
      const response = await fetch('/api/admin/sync-hybrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      
      const result = await response.json()
      setSyncResult(result)
      
      if (result.success) {
        await loadStats()
      }
    } catch (error) {
      console.error('Error syncing:', error)
      setSyncResult({
        success: false,
        newProducts: 0,
        updatedProducts: 0,
        errors: 1
      })
    } finally {
      setIsSyncing(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Gestión de productos y sincronización</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Hola, {session?.user.name || session?.user.email}
              </div>
              <button
                onClick={() => router.push('/admin/configuracion')}
                className="bg-[#f0a04b] text-white px-4 py-2 rounded-md hover:bg-[#e0904b] transition-colors"
              >
                Configuración
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-[#183a1d] text-white px-4 py-2 rounded-md hover:bg-[#2d5a2d] transition-colors"
              >
                Ir al sitio
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Última Sincronización</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats?.lastSync ? new Date(stats.lastSync).toLocaleString('es-ES') : 'Nunca'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats?.syncInProgress ? 'Sincronizando...' : 'Disponible'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Errores Recientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.recentErrors || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Sincronización */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sincronización de Productos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Sincronización Rápida</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sincroniza solo los productos que han cambiado desde la última sincronización.
              </p>
              <button
                onClick={() => handleSync('changes')}
                disabled={isSyncing}
                className="w-full bg-[#183a1d] text-white py-2 px-4 rounded-md hover:bg-[#2d5a2d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Cambios'}
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Sincronización Completa</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sincroniza todos los productos. Puede tardar varios minutos.
              </p>
              <button
                onClick={() => handleSync('full')}
                disabled={isSyncing}
                className="w-full bg-[#f0a04b] text-white py-2 px-4 rounded-md hover:bg-[#e0904b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronización Completa'}
              </button>
            </div>
          </div>
        </div>

        {/* Resultado de Sincronización */}
        {syncResult && (
          <div className={`rounded-lg p-6 mb-8 ${syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`font-medium mb-2 ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {syncResult.success ? 'Sincronización Exitosa' : 'Error en Sincronización'}
            </h3>
            {syncResult.success && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Productos Nuevos:</span>
                  <span className="ml-2 text-green-600">{syncResult.newProducts}</span>
                </div>
                <div>
                  <span className="font-medium">Productos Actualizados:</span>
                  <span className="ml-2 text-blue-600">{syncResult.updatedProducts}</span>
                </div>
                <div>
                  <span className="font-medium">Errores:</span>
                  <span className="ml-2 text-red-600">{syncResult.errors}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => router.push('/catalogo')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-[#183a1d] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Ver Catálogo</p>
                <p className="text-sm text-gray-500">Revisar productos sincronizados</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/traducciones')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-[#f0a04b] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Traducciones</p>
                <p className="text-sm text-gray-500">Gestionar traducciones</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/historial')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Historial</p>
                <p className="text-sm text-gray-500">Ver sincronizaciones</p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/admin/productos')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414l-2.829 2.829m5.657-5.657l2.829-2.829M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Productos</p>
                <p className="text-sm text-gray-500">Ocultar/mostrar productos</p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/admin/configuracion')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Configuración</p>
                <p className="text-sm text-gray-500">Ajustes del sistema</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/solicitudes-asociados')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-[#183a1d] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Solicitudes de Asociados</p>
                <p className="text-sm text-gray-500">Aprobar/rechazar solicitudes</p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/asociados')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-[#183a1d] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Gestionar Asociados</p>
                <p className="text-sm text-gray-500">Administrar usuarios asociados</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/categorias')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-[#f0a04b] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Gestión de Categorías</p>
                <p className="text-sm text-gray-500">Ocultar/mostrar categorías del filtro</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/sincronizacion')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Sincronización Avanzada</p>
                <p className="text-sm text-gray-500">Configurar cron y lotes</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/backup')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Backup y Restauración</p>
                <p className="text-sm text-gray-500">Copias de seguridad del sistema</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/sistema')}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Información del Sistema</p>
                <p className="text-sm text-gray-500">Versión, dependencias y estado</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}