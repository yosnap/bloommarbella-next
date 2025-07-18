'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Search, Trash2, Download, Eye } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

interface LogEntry {
  id: string
  type: string
  status: string
  productsProcessed: number
  errors: number
  createdAt: string
  updatedAt?: string
  metadata?: any
}

interface LogStats {
  total: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  recent: number
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [limit, setLimit] = useState<number>(20)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const loadLogs = async () => {
    try {
      setRefreshing(true)
      
      const params = new URLSearchParams()
      if (selectedType !== 'all') params.set('type', selectedType)
      params.set('limit', limit.toString())
      
      const response = await fetch(`/api/admin/debug-logs?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setStats(data.stats || null)
      } else {
        console.error('Error loading logs:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const clearLogs = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los logs?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/sync-logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThan: 0 })
      })

      if (response.ok) {
        await loadLogs()
        alert('Logs eliminados correctamente')
      } else {
        alert('Error eliminando logs')
      }
    } catch (error) {
      console.error('Error clearing logs:', error)
      alert('Error eliminando logs')
    }
  }

  const createTestLog = async () => {
    try {
      const response = await fetch('/api/admin/debug-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'debug-test',
          status: 'info',
          message: 'Log de prueba generado desde la interfaz admin',
          metadata: { timestamp: new Date().toISOString() }
        })
      })

      if (response.ok) {
        await loadLogs()
      }
    } catch (error) {
      console.error('Error creating test log:', error)
    }
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sync-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    loadLogs()
  }, [selectedType, limit])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Exitoso</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Parcial</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">En Progreso</Badge>
      case 'info':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Info</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sync-full':
      case 'sync-changes':
        return 'text-blue-600'
      case 'restore-database':
      case 'restore-settings':
        return 'text-green-600'
      case 'backup-database':
      case 'backup-settings':
        return 'text-purple-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Logs del Sistema</h1>
              <p className="text-gray-600">Monitoreo y debugging en tiempo real</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={createTestLog} variant="outline" size="sm">
                Log Test
              </Button>
              <Button onClick={exportLogs} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={clearLogs} variant="outline" size="sm" className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
              <Button onClick={loadLogs} disabled={refreshing} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Últimas 24h</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recent}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Exitosos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.byStatus.success || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Errores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.byStatus.error || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tipo:</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sync">Sincronización</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                    <SelectItem value="restore">Restauración</SelectItem>
                    <SelectItem value="error">Errores</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Límite:</label>
                <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Entradas de Log ({logs.length})</CardTitle>
              <CardDescription>
                Logs ordenados por fecha de creación (más recientes primero)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(log.status)}
                          <span className={`font-medium ${getTypeColor(log.type)}`}>
                            {log.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Procesados:</span> {log.productsProcessed}
                        </div>
                        <div>
                          <span className="font-medium">Errores:</span> {log.errors}
                        </div>
                        {log.metadata?.duration && (
                          <div>
                            <span className="font-medium">Duración:</span> {log.metadata.duration}
                          </div>
                        )}
                        {log.metadata?.restoredBy && (
                          <div>
                            <span className="font-medium">Por:</span> {log.metadata.restoredBy}
                          </div>
                        )}
                      </div>

                      {expandedLog === log.id && log.metadata && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <h4 className="font-medium mb-2">Metadatos:</h4>
                          <pre className="text-xs overflow-auto max-h-64">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron logs con los filtros aplicados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}