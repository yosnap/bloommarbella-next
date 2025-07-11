'use client'

import { useState, useEffect } from 'react'
import { History, RefreshCw, AlertCircle, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

interface SyncLog {
  id: string
  type: string
  status: string
  productsProcessed: number
  errors: number
  createdAt: string
  metadata: any
}

export default function HistorialPage() {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/sync-logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      } else {
        console.error('Error response:', response.status, response.statusText)
        const errorData = await response.text()
        console.error('Error data:', errorData)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteLogs = async (olderThan: number) => {
    const confirmMessage = olderThan === 0 
      ? '¿Está seguro de eliminar TODOS los logs? Esta acción no se puede deshacer.'
      : `¿Está seguro de eliminar logs de más de ${olderThan} días?`
      
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch('/api/admin/sync-logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThan })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.deletedCount > 0) {
          alert(`✅ ${data.message}`)
        } else {
          alert(`ℹ️ No se encontraron logs para eliminar (${olderThan > 0 ? `más de ${olderThan} días` : 'todos'})`)  
        }
        await fetchLogs()
      } else {
        const errorData = await response.json()
        alert(`❌ Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting logs:', error)
      alert('❌ Error al eliminar logs')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hybrid-changes':
        return 'Sincronización Rápida'
      case 'hybrid-full':
        return 'Sincronización Completa'
      case 'hybrid-error':
        return 'Error de Sincronización'
      case 'cron-changes':
        return 'Sincronización Automática'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6 text-[#183a1d]" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Historial de Sincronizaciones</h1>
                  <div className="text-sm text-gray-500">
                    <span>{logs.length} registros</span>
                    {logs.length > 0 && (
                      <span className="ml-2">
                        (desde {formatDate(logs[logs.length - 1].createdAt)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteLogs(7)}
                  className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Trash2 size={14} />
                  7+ días
                </button>
                <button
                  onClick={() => deleteLogs(30)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Trash2 size={14} />
                  30+ días
                </button>
                <button
                  onClick={() => deleteLogs(0)}
                  className="bg-red-800 text-white px-3 py-2 rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2 text-sm"
                >
                  <Trash2 size={14} />
                  Todo
                </button>
                <button
                  onClick={fetchLogs}
                  className="bg-[#183a1d] text-white px-4 py-2 rounded-lg hover:bg-[#2a5530] transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de logs */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando historial...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No hay registros de sincronización</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(log.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {getTypeLabel(log.type)}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatDate(log.createdAt)}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Productos procesados: <span className="font-medium text-gray-900">{log.productsProcessed}</span>
                            </span>
                            {log.errors > 0 && (
                              <span className="text-red-600">
                                Errores: <span className="font-medium">{log.errors}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLog(log)
                          setShowDetails(true)
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles de {getTypeLabel(selectedLog.type)}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLog.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Productos Procesados</label>
                    <p className="text-sm text-gray-900">{selectedLog.productsProcessed}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Errores</label>
                    <p className="text-sm text-gray-900">{selectedLog.errors}</p>
                  </div>
                </div>
                
                {selectedLog.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}