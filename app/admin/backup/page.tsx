'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { useToast } from '@/hooks/use-toast'
import { Download, Upload, Database, Settings, Shield, Calendar, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface BackupInfo {
  lastBackup: string | null
  size: string
  version: string
}

interface SettingOption {
  key: string
  label: string
  description: string
  category: string
  enabled: boolean
}

interface SettingsConfig {
  [key: string]: boolean
}

export default function BackupPage() {
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState({
    dbBackup: false,
    dbRestore: false,
    settingsBackup: false,
    settingsRestore: false
  })
  const [backupInfo, setBackupInfo] = useState<BackupInfo>({
    lastBackup: null,
    size: '0 MB',
    version: '1.0'
  })
  
  // Configuración de ajustes disponibles
  const [availableSettings, setAvailableSettings] = useState<SettingOption[]>([
    // Configuraciones generales
    { key: 'priceMultiplier', label: 'Multiplicador de precios', description: 'Factor de multiplicación aplicado a los precios', category: 'general', enabled: true },
    { key: 'associateDiscount', label: 'Descuento para asociados', description: 'Porcentaje de descuento para usuarios asociados', category: 'general', enabled: true },
    { key: 'defaultDeliveryTime', label: 'Tiempo de entrega', description: 'Tiempo de entrega predeterminado', category: 'general', enabled: true },
    { key: 'minStockAlert', label: 'Alerta de stock mínimo', description: 'Nivel mínimo de stock para alertas', category: 'general', enabled: true },
    { key: 'maxStockAlert', label: 'Alerta de stock máximo', description: 'Nivel máximo de stock para alertas', category: 'general', enabled: true },
    { key: 'enableCache', label: 'Activar caché', description: 'Habilitar sistema de caché', category: 'general', enabled: true },
    { key: 'cacheTime', label: 'Tiempo de caché', description: 'Duración del caché en segundos', category: 'general', enabled: true },
    { key: 'newBadgeDays', label: 'Badge de productos nuevos', description: 'Días para mostrar badge "nuevo"', category: 'general', enabled: true },
    
    // Configuraciones de WhatsApp
    { key: 'whatsappEnabled', label: 'WhatsApp habilitado', description: 'Activar integración de WhatsApp', category: 'whatsapp', enabled: true },
    { key: 'whatsappNumber', label: 'Número de WhatsApp', description: 'Número de contacto de WhatsApp', category: 'whatsapp', enabled: true },
    { key: 'whatsappContactName', label: 'Nombre de contacto', description: 'Nombre para contacto de WhatsApp', category: 'whatsapp', enabled: true },
    
    // Configuraciones de sincronización
    { key: 'sync_schedule', label: 'Horarios de sincronización', description: 'Configuración de horarios automáticos', category: 'sync', enabled: true },
    { key: 'sync_batch_settings', label: 'Configuración de lotes', description: 'Ajustes de procesamiento por lotes', category: 'sync', enabled: true },
    { key: 'sync_settings', label: 'Ajustes de sincronización', description: 'Configuraciones generales de sync', category: 'sync', enabled: true },
    
    // Configuraciones de sistema
    { key: 'emailNotifications', label: 'Notificaciones por email', description: 'Configuración de notificaciones', category: 'system', enabled: false },
    { key: 'maintenanceMode', label: 'Modo mantenimiento', description: 'Activar modo de mantenimiento', category: 'system', enabled: false },
    { key: 'apiRateLimit', label: 'Límite de API', description: 'Límite de requests por minuto', category: 'system', enabled: false },
    { key: 'siteTitle', label: 'Título del sitio', description: 'Título principal del sitio web', category: 'seo', enabled: false },
    { key: 'siteDescription', label: 'Descripción del sitio', description: 'Meta descripción del sitio', category: 'seo', enabled: false },
  ])
  
  const [settingsConfig, setSettingsConfig] = useState<SettingsConfig>({})

  // Cargar configuración inicial y preferencias guardadas
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/admin/backup/settings/preferences')
        if (response.ok) {
          const data = await response.json()
          setSettingsConfig(data.preferences)
        } else {
          // Si no hay preferencias guardadas, usar la configuración por defecto
          const initialConfig: SettingsConfig = {}
          availableSettings.forEach(setting => {
            initialConfig[setting.key] = setting.enabled
          })
          setSettingsConfig(initialConfig)
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
        // Fallback a configuración por defecto
        const initialConfig: SettingsConfig = {}
        availableSettings.forEach(setting => {
          initialConfig[setting.key] = setting.enabled
        })
        setSettingsConfig(initialConfig)
      }
    }
    
    loadPreferences()
  }, [])

  // Manejar cambio de configuración
  const handleSettingToggle = async (key: string, enabled: boolean) => {
    const newConfig = {
      ...settingsConfig,
      [key]: enabled
    }
    
    setSettingsConfig(newConfig)
    
    // Guardar preferencias automáticamente
    try {
      await fetch('/api/admin/backup/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newConfig })
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  // Obtener ajustes seleccionados
  const getSelectedSettings = () => {
    return Object.entries(settingsConfig)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key)
  }

  // Seleccionar todos los ajustes
  const selectAllSettings = async () => {
    const allSelected: SettingsConfig = {}
    availableSettings.forEach(setting => {
      allSelected[setting.key] = true
    })
    setSettingsConfig(allSelected)
    
    try {
      await fetch('/api/admin/backup/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: allSelected })
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  // Deseleccionar todos los ajustes
  const deselectAllSettings = async () => {
    const allDeselected: SettingsConfig = {}
    availableSettings.forEach(setting => {
      allDeselected[setting.key] = false
    })
    setSettingsConfig(allDeselected)
    
    try {
      await fetch('/api/admin/backup/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: allDeselected })
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  // Backup de base de datos completa
  const handleDatabaseBackup = async () => {
    setLoading(prev => ({ ...prev, dbBackup: true }))
    try {
      const response = await fetch('/api/admin/backup/database', {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Error al crear backup')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bloom_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      success('Backup creado', 'La copia de seguridad se ha descargado correctamente')
    } catch (err) {
      console.error('Error creating backup:', err)
      showError('Error', 'No se pudo crear el backup')
    } finally {
      setLoading(prev => ({ ...prev, dbBackup: false }))
    }
  }

  // Restaurar base de datos
  const handleDatabaseRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(prev => ({ ...prev, dbRestore: true }))
    try {
      const formData = new FormData()
      formData.append('backup', file)

      const response = await fetch('/api/admin/backup/database/restore', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Error al restaurar backup')

      const result = await response.json()
      success('Backup restaurado', `Se han restaurado ${result.restored} registros correctamente`)
    } catch (err) {
      console.error('Error restoring backup:', err)
      showError('Error', 'No se pudo restaurar el backup')
    } finally {
      setLoading(prev => ({ ...prev, dbRestore: false }))
    }
  }

  // Backup de ajustes
  const handleSettingsBackup = async () => {
    setLoading(prev => ({ ...prev, settingsBackup: true }))
    try {
      const selectedSettings = getSelectedSettings()
      
      if (selectedSettings.length === 0) {
        showError('Error', 'Debe seleccionar al menos un ajuste para el backup')
        return
      }
      
      const response = await fetch('/api/admin/backup/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedSettings })
      })
      
      if (!response.ok) throw new Error('Error al crear backup de ajustes')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bloom_settings_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      success('Backup de ajustes creado', 'Los ajustes se han exportado correctamente')
    } catch (err) {
      console.error('Error creating settings backup:', err)
      showError('Error', 'No se pudo crear el backup de ajustes')
    } finally {
      setLoading(prev => ({ ...prev, settingsBackup: false }))
    }
  }

  // Restaurar ajustes
  const handleSettingsRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(prev => ({ ...prev, settingsRestore: true }))
    try {
      const formData = new FormData()
      formData.append('settings', file)

      const response = await fetch('/api/admin/backup/settings/restore', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Error al restaurar ajustes')

      const result = await response.json()
      success('Ajustes restaurados', `Se han restaurado ${result.restored} configuraciones correctamente`)
    } catch (err) {
      console.error('Error restoring settings:', err)
      showError('Error', 'No se pudo restaurar los ajustes')
    } finally {
      setLoading(prev => ({ ...prev, settingsRestore: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Backup y Restauración</h1>
          <p className="text-gray-600 mt-1">Gestiona copias de seguridad de la base de datos y ajustes del sistema</p>
        </div>

        <Tabs defaultValue="database" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="database">Base de Datos</TabsTrigger>
            <TabsTrigger value="settings">Ajustes del Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backup de Base de Datos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Crear Backup Completo
                  </CardTitle>
                  <CardDescription>
                    Descarga una copia completa de la base de datos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Database className="w-4 h-4" />
                      <span>Incluye: Productos, Usuarios, Configuraciones, Traducciones, Categorías, Favoritos, Solicitudes, Servicios, Blog</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Formato: JSON comprimido</span>
                    </div>
                    {backupInfo.lastBackup && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Último backup: {backupInfo.lastBackup}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleDatabaseBackup}
                    disabled={loading.dbBackup}
                    className="w-full"
                  >
                    {loading.dbBackup ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando backup...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Backup Completo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Restaurar Base de Datos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Restaurar Base de Datos
                  </CardTitle>
                  <CardDescription>
                    Restaura la base de datos desde un archivo de backup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">Advertencia</p>
                        <p className="text-yellow-700 mt-1">
                          Esta acción sobrescribirá todos los datos actuales. 
                          Asegúrate de tener un backup reciente antes de continuar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="db-restore" className="block">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={loading.dbRestore}
                        asChild
                      >
                        <span>
                          {loading.dbRestore ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Restaurando...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Seleccionar Archivo de Backup
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="db-restore"
                      type="file"
                      accept=".json"
                      onChange={handleDatabaseRestore}
                      className="hidden"
                      disabled={loading.dbRestore}
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Formatos aceptados: .json
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Colecciones incluidas</p>
                    <div className="mt-1 space-y-1">
                      <Badge variant="secondary">Productos</Badge>
                      <Badge variant="secondary">Usuarios</Badge>
                      <Badge variant="secondary">Configuraciones</Badge>
                      <Badge variant="secondary">Traducciones</Badge>
                      <Badge variant="secondary">Categorías</Badge>
                      <Badge variant="secondary">Favoritos</Badge>
                      <Badge variant="secondary">Solicitudes de Asociados</Badge>
                      <Badge variant="secondary">Servicios</Badge>
                      <Badge variant="secondary">Blog Posts</Badge>
                      <Badge variant="secondary">Logs de Sincronización</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tamaño estimado</p>
                    <p className="text-2xl font-semibold mt-1">{backupInfo.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Versión del sistema</p>
                    <p className="text-2xl font-semibold mt-1">v{backupInfo.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backup de Ajustes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar Ajustes
                  </CardTitle>
                  <CardDescription>
                    Descarga todos los ajustes y configuraciones del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Settings className="w-4 h-4" />
                      <span>Configuraciones generales</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ajustes de sincronización</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Configuración de precios</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ajustes de WhatsApp</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSettingsBackup}
                    disabled={loading.settingsBackup}
                    variant="secondary"
                    className="w-full"
                  >
                    {loading.settingsBackup ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exportando ajustes...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Ajustes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Restaurar Ajustes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Importar Ajustes
                  </CardTitle>
                  <CardDescription>
                    Restaura los ajustes desde un archivo de configuración
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Información</p>
                        <p className="text-blue-700 mt-1">
                          Solo se sobrescribirán los ajustes del sistema. 
                          Los datos de productos y usuarios no se verán afectados.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="settings-restore" className="block">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={loading.settingsRestore}
                        asChild
                      >
                        <span>
                          {loading.settingsRestore ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Importando...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Seleccionar Archivo de Ajustes
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="settings-restore"
                      type="file"
                      accept=".json"
                      onChange={handleSettingsRestore}
                      className="hidden"
                      disabled={loading.settingsRestore}
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Formatos aceptados: .json
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selector de ajustes incluidos */}
            <Card>
              <CardHeader>
                <CardTitle>Ajustes Incluidos en el Backup</CardTitle>
                <CardDescription>
                  Selecciona las configuraciones que se exportarán e importarán
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Controles de selección masiva */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Selección rápida</p>
                      <p className="text-xs text-gray-600">Selecciona o deselecciona todos los ajustes</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllSettings}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Seleccionar todo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectAllSettings}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Deseleccionar todo
                      </Button>
                    </div>
                  </div>
                  {/* Configuraciones Generales */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configuraciones Generales
                    </h4>
                    <div className="space-y-2 pl-6">
                      {availableSettings.filter(s => s.category === 'general').map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Label htmlFor={setting.key} className="text-sm font-medium">
                              {setting.label}
                            </Label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.key}
                            checked={settingsConfig[setting.key] || false}
                            onCheckedChange={(checked) => handleSettingToggle(setting.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Configuraciones de WhatsApp */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Configuraciones de WhatsApp
                    </h4>
                    <div className="space-y-2 pl-6">
                      {availableSettings.filter(s => s.category === 'whatsapp').map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Label htmlFor={setting.key} className="text-sm font-medium">
                              {setting.label}
                            </Label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.key}
                            checked={settingsConfig[setting.key] || false}
                            onCheckedChange={(checked) => handleSettingToggle(setting.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Configuraciones de Sincronización */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Sincronización y Sistema
                    </h4>
                    <div className="space-y-2 pl-6">
                      {availableSettings.filter(s => s.category === 'sync').map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Label htmlFor={setting.key} className="text-sm font-medium">
                              {setting.label}
                            </Label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.key}
                            checked={settingsConfig[setting.key] || false}
                            onCheckedChange={(checked) => handleSettingToggle(setting.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Configuraciones de Sistema */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Configuraciones de Sistema
                    </h4>
                    <div className="space-y-2 pl-6">
                      {availableSettings.filter(s => s.category === 'system').map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Label htmlFor={setting.key} className="text-sm font-medium">
                              {setting.label}
                            </Label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.key}
                            checked={settingsConfig[setting.key] || false}
                            onCheckedChange={(checked) => handleSettingToggle(setting.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Configuraciones de SEO */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Configuraciones de SEO
                    </h4>
                    <div className="space-y-2 pl-6">
                      {availableSettings.filter(s => s.category === 'seo').map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Label htmlFor={setting.key} className="text-sm font-medium">
                              {setting.label}
                            </Label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.key}
                            checked={settingsConfig[setting.key] || false}
                            onCheckedChange={(checked) => handleSettingToggle(setting.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen de selección */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">
                          {getSelectedSettings().length} ajustes seleccionados
                        </p>
                        <p className="text-sm text-blue-600">
                          Solo los ajustes seleccionados serán incluidos en el backup
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}