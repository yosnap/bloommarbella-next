'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw, Play, Settings, BarChart3, Clock, Package } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

interface SyncConfig {
  sync_schedule: {
    enabled: boolean
    interval: string
    time: string
    dayOfWeek: number
    dayOfMonth: number
    customCron: string | null
  }
  sync_batch_settings: {
    batchSize: number
    pauseBetweenBatches: number
    maxConcurrentRequests: number
    enableProgressLogging: boolean
  }
  sync_settings: {
    autoSync: boolean
    notifyOnErrors: boolean
    keepLogsDays: number
    enableRealTimeStock: boolean
    fallbackToLocalData: boolean
  }
  last_sync_date: {
    timestamp: string
    status: string
  }
}

interface SyncLog {
  id: string
  type: string
  status: string
  processed: number
  errors: number
  createdAt: string
  metadata: any
}

export default function SincronizacionPage() {
  const [config, setConfig] = useState<SyncConfig | null>(null)
  const [stats, setStats] = useState<{ totalProducts: number; recentLogs: SyncLog[] }>({
    totalProducts: 0,
    recentLogs: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/sync-config')
      const data = await response.json()
      
      if (response.ok) {
        setConfig(data.config)
        setStats(data.stats)
      } else {
        error("Error", data.error || "Error cargando configuración")
      }
    } catch (err) {
      console.error('Error loading config:', err)
      error("Error", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSchedule = () => ({
    enabled: false,
    interval: 'daily',
    time: '02:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    customCron: ''
  })

  const getDefaultBatchSettings = () => ({
    batchSize: 500,
    pauseBetweenBatches: 1000,
    maxConcurrentRequests: 5,
    enableProgressLogging: false
  })

  const saveConfig = async (configType: string, value: any) => {
    setSaving(true)
    
    // Validar que value no sea null/undefined y tenga contenido válido
    if (!value || typeof value !== 'object') {
      console.warn('saveConfig: valor inválido', { configType, value })
      setSaving(false)
      return
    }
    
    console.log('Enviando configuración:', { configType, value })
    
    try {
      const response = await fetch('/api/admin/sync-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ configType, value })
      })

      const data = await response.json()

      if (response.ok) {
        success("Éxito", "Configuración guardada correctamente")
        loadConfig() // Recargar para mostrar cambios
      } else {
        error("Error", data.error || "Error guardando configuración")
      }
    } catch (err) {
      console.error('Error saving config:', err)
      error("Error", "Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const executSync = async (syncType: 'changes' | 'full') => {
    setSyncing(true)
    try {
      const response = await fetch('/api/admin/sync-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ syncType })
      })

      const data = await response.json()

      if (response.ok) {
        success("Éxito", `Sincronización ${syncType} iniciada correctamente`)
        // Recargar estadísticas después de un momento
        setTimeout(() => loadConfig(), 2000)
      } else {
        error("Error", data.error || "Error ejecutando sincronización")
      }
    } catch (err) {
      console.error('Error executing sync:', err)
      error("Error", "Error de conexión")
    } finally {
      setSyncing(false)
    }
  }

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
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'hourly': return 'Cada hora'
      case 'daily': return 'Diario'
      case 'weekly': return 'Semanal'
      case 'monthly': return 'Mensual'
      case 'custom': return 'Personalizado'
      default: return interval
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No se pudo cargar la configuración</p>
        <Button onClick={loadConfig} className="mt-4">
          Reintentar
        </Button>
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
              <h1 className="text-2xl font-bold">Sincronización de Productos</h1>
              <p className="text-gray-600">Configuración y control del sistema de sincronización</p>
            </div>
        <div className="flex gap-2">
          <Button
            onClick={() => executSync('changes')}
            disabled={syncing}
            variant="outline"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Sincronizar Cambios
          </Button>
          <Button
            onClick={() => executSync('full')}
            disabled={syncing}
            variant="outline"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
            Sincronización Completa
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Última Sincronización</p>
                <p className="text-sm font-medium">
                  {config?.last_sync_date?.timestamp 
                    ? new Date(config.last_sync_date.timestamp).toLocaleDateString()
                    : 'Nunca'
                  }
                </p>
                {config?.last_sync_date?.status && getStatusBadge(config.last_sync_date.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Estado Automático</p>
                <p className="text-sm font-medium">
                  {config?.sync_schedule?.enabled ? 'Activo' : 'Inactivo'}
                </p>
                <p className="text-xs text-gray-500">
                  {config?.sync_schedule?.interval ? getIntervalLabel(config.sync_schedule.interval) : 'No configurado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Lotes Configurados</p>
                <p className="text-2xl font-bold">{config?.sync_batch_settings?.batchSize || 0}</p>
                <p className="text-xs text-gray-500">productos por lote</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Programación</TabsTrigger>
          <TabsTrigger value="batch">Configuración de Lotes</TabsTrigger>
          <TabsTrigger value="logs">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programación Automática</CardTitle>
              <CardDescription>
                Configurar cuándo se ejecuta la sincronización automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sync-enabled"
                  checked={config?.sync_schedule?.enabled || false}
                  onCheckedChange={(checked) => {
                    const newConfig = { ...getDefaultSchedule(), ...config.sync_schedule, enabled: checked }
                    setConfig(prev => ({ ...prev!, sync_schedule: newConfig }))
                    saveConfig('sync_schedule', newConfig)
                  }}
                />
                <Label htmlFor="sync-enabled">Activar sincronización automática</Label>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="interval">Intervalo</Label>
                  <Select
                    value={config?.sync_schedule?.interval || 'daily'}
                    onValueChange={(value) => {
                      const newConfig = { ...getDefaultSchedule(), ...config.sync_schedule, interval: value }
                      setConfig(prev => ({ ...prev!, sync_schedule: newConfig }))
                      saveConfig('sync_schedule', newConfig)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="custom">Personalizado (cron)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config?.sync_schedule?.interval === 'daily' && (
                  <div>
                    <Label htmlFor="time">Hora de ejecución</Label>
                    <Input
                      id="time"
                      type="time"
                      value={config?.sync_schedule?.time || '00:00'}
                      onChange={(e) => {
                        const newConfig = { ...getDefaultSchedule(), ...config.sync_schedule, time: e.target.value }
                        setConfig(prev => ({ ...prev!, sync_schedule: newConfig }))
                        saveConfig('sync_schedule', newConfig)
                      }}
                    />
                  </div>
                )}

                {config?.sync_schedule?.interval === 'weekly' && (
                  <div>
                    <Label htmlFor="dayOfWeek">Día de la semana</Label>
                    <Select
                      value={config?.sync_schedule?.dayOfWeek?.toString() || '0'}
                      onValueChange={(value) => {
                        const newConfig = { ...getDefaultSchedule(), ...config.sync_schedule, dayOfWeek: parseInt(value) }
                        setConfig(prev => ({ ...prev!, sync_schedule: newConfig }))
                        saveConfig('sync_schedule', newConfig)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Lunes</SelectItem>
                        <SelectItem value="2">Martes</SelectItem>
                        <SelectItem value="3">Miércoles</SelectItem>
                        <SelectItem value="4">Jueves</SelectItem>
                        <SelectItem value="5">Viernes</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                        <SelectItem value="7">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {config?.sync_schedule?.interval === 'custom' && (
                  <div>
                    <Label htmlFor="customCron">Expresión Cron</Label>
                    <Input
                      id="customCron"
                      placeholder="0 */6 * * * (cada 6 horas)"
                      value={config?.sync_schedule?.customCron || ''}
                      onChange={(e) => {
                        const newConfig = { ...getDefaultSchedule(), ...config.sync_schedule, customCron: e.target.value }
                        setConfig(prev => ({ ...prev!, sync_schedule: newConfig }))
                        saveConfig('sync_schedule', newConfig)
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Lotes</CardTitle>
              <CardDescription>
                Optimizar el rendimiento de la sincronización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batchSize">Tamaño del lote</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min="100"
                  max="5000"
                  value={config?.sync_batch_settings?.batchSize || 100}
                  onChange={(e) => {
                    const newConfig = { ...getDefaultBatchSettings(), ...config.sync_batch_settings, batchSize: parseInt(e.target.value) }
                    setConfig(prev => ({ ...prev!, sync_batch_settings: newConfig }))
                    saveConfig('sync_batch_settings', newConfig)
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Número de productos a procesar por lote (100-5000)
                </p>
              </div>

              <div>
                <Label htmlFor="pauseBetweenBatches">Pausa entre lotes (ms)</Label>
                <Input
                  id="pauseBetweenBatches"
                  type="number"
                  min="500"
                  max="10000"
                  value={config?.sync_batch_settings?.pauseBetweenBatches || 1000}
                  onChange={(e) => {
                    const newConfig = { ...getDefaultBatchSettings(), ...config.sync_batch_settings, pauseBetweenBatches: parseInt(e.target.value) }
                    setConfig(prev => ({ ...prev!, sync_batch_settings: newConfig }))
                    saveConfig('sync_batch_settings', newConfig)
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tiempo de espera entre lotes para evitar saturar el servidor
                </p>
              </div>

              <div>
                <Label htmlFor="maxConcurrentRequests">Máximo requests concurrentes</Label>
                <Input
                  id="maxConcurrentRequests"
                  type="number"
                  min="1"
                  max="20"
                  value={config?.sync_batch_settings?.maxConcurrentRequests || 5}
                  onChange={(e) => {
                    const newConfig = { ...getDefaultBatchSettings(), ...config.sync_batch_settings, maxConcurrentRequests: parseInt(e.target.value) }
                    setConfig(prev => ({ ...prev!, sync_batch_settings: newConfig }))
                    saveConfig('sync_batch_settings', newConfig)
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Número máximo de requests simultáneos a la API
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableProgressLogging"
                  checked={config?.sync_batch_settings?.enableProgressLogging || false}
                  onCheckedChange={(checked) => {
                    const newConfig = { ...getDefaultBatchSettings(), ...config.sync_batch_settings, enableProgressLogging: checked }
                    setConfig(prev => ({ ...prev!, sync_batch_settings: newConfig }))
                    saveConfig('sync_batch_settings', newConfig)
                  }}
                />
                <Label htmlFor="enableProgressLogging">Mostrar progreso detallado en logs</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Sincronizaciones</CardTitle>
              <CardDescription>
                Últimas 10 sincronizaciones ejecutadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{log.type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(log.status)}
                      <div className="text-right">
                        <p className="text-sm font-medium">{log.processed} productos</p>
                        {log.errors > 0 && (
                          <p className="text-sm text-red-600">{log.errors} errores</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {stats.recentLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay historial de sincronizaciones</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  )
}