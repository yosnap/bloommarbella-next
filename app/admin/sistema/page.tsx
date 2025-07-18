'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Server, Database, Package, Settings, Clock, Activity } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

interface SystemInfo {
  package: {
    name: string
    version: string
    description: string
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
  }
  server: {
    nodeVersion: string
    platform: string
    arch: string
    uptime: number
    memoryUsage: {
      rss: number
      heapUsed: number
      heapTotal: number
      external: number
    }
    timezone: string
    timestamp: string
    environment: string
  }
  database: {
    collections: Record<string, {
      documents: number
      name: string
      error?: string
    }>
    info: {
      version: string
      platform: string
      engine: string
    }
    connectionString: string
  }
  configuration: Record<string, {
    description: string
    value: any
    lastUpdated: string
  }>
  recentLogs: Array<{
    id: string
    type: string
    status: string
    productsProcessed: number
    errors: number
    createdAt: string
  }>
  environment: {
    NODE_ENV: string
    NEXTAUTH_URL: string
    DATABASE_URL: string
    NIEUWKOOP_API_URL: string
    hasApiCredentials: boolean
    hasNextAuthSecret: boolean
  }
  nextjs: {
    version: string
    mode: string
    buildTime: string
  }
  generatedAt: string
}

export default function SystemInfoPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadSystemInfo = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/system-info')
      
      if (response.ok) {
        const data = await response.json()
        setSystemInfo(data)
      } else {
        console.error('Error loading system info:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading system info:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadSystemInfo()
  }, [])

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!systemInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No se pudo cargar la información del sistema</p>
        <Button onClick={loadSystemInfo} className="mt-4">
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
              <h1 className="text-2xl font-bold">Información del Sistema</h1>
              <p className="text-gray-600">Estado y configuración del sistema Bloom Marbella</p>
            </div>
            <Button 
              onClick={loadSystemInfo} 
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Versión del Sistema</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemInfo.package.version}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemInfo.package.name}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Activo</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUptime(systemInfo.server.uptime)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemInfo.server.environment}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memoria Usada</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(systemInfo.server.memoryUsage.heapUsed)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  de {formatBytes(systemInfo.server.memoryUsage.heapTotal)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Información del Servidor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Información del Servidor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Node.js</p>
                  <p className="text-lg">{systemInfo.server.nodeVersion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Plataforma</p>
                  <p className="text-lg">{systemInfo.server.platform} ({systemInfo.server.arch})</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Zona Horaria</p>
                  <p className="text-lg">{systemInfo.server.timezone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Next.js</p>
                  <p className="text-lg">{systemInfo.nextjs.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Hora del Servidor</p>
                  <p className="text-lg">{new Date(systemInfo.server.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Entorno</p>
                  <Badge variant={systemInfo.server.environment === 'production' ? 'default' : 'secondary'}>
                    {systemInfo.server.environment}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Base de Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Motor</p>
                  <p className="text-lg">{systemInfo.database.info.engine}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Versión</p>
                  <p className="text-lg">{systemInfo.database.info.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Conexión</p>
                  <p className="text-sm text-gray-500 font-mono break-all">{systemInfo.database.connectionString}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Colecciones</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(systemInfo.database.collections).map(([name, stats]) => (
                    <div key={name} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{stats.name}</p>
                      <p className="text-sm text-gray-600">
                        {stats.error ? (
                          <span className="text-red-600">{stats.error}</span>
                        ) : (
                          `${stats.documents.toLocaleString()} documentos`
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dependencias Principales */}
          <Card>
            <CardHeader>
              <CardTitle>Dependencias Principales</CardTitle>
              <CardDescription>Librerías y frameworks utilizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(systemInfo.package.dependencies).map(([name, version]) => (
                  <div key={name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium text-sm">{name}</span>
                    <Badge variant="outline" className="text-xs">{version}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Variables de Entorno */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Entorno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">NEXTAUTH_URL</p>
                  <p className="text-sm text-gray-500 font-mono">{systemInfo.environment.NEXTAUTH_URL || 'No configurada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">NIEUWKOOP_API_URL</p>
                  <p className="text-sm text-gray-500 font-mono">{systemInfo.environment.NIEUWKOOP_API_URL || 'No configurada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Credenciales API Nieuwkoop</p>
                  <Badge variant={systemInfo.environment.hasApiCredentials ? 'default' : 'destructive'}>
                    {systemInfo.environment.hasApiCredentials ? 'Configuradas' : 'No configuradas'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">NextAuth Secret</p>
                  <Badge variant={systemInfo.environment.hasNextAuthSecret ? 'default' : 'destructive'}>
                    {systemInfo.environment.hasNextAuthSecret ? 'Configurado' : 'No configurado'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente del Sistema</CardTitle>
              <CardDescription>Últimas 10 operaciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemInfo.recentLogs.length > 0 ? (
                  systemInfo.recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(log.status)}
                        <div>
                          <p className="font-medium text-sm">{log.type}</p>
                          <p className="text-xs text-gray-600">
                            {log.productsProcessed} procesados • {log.errors} errores
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No hay logs disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer con timestamp */}
          <div className="text-center text-sm text-gray-500">
            Información generada el {new Date(systemInfo.generatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}