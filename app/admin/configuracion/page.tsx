'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { Save, Settings, DollarSign, Users, Clock, Tag, MessageCircle } from 'lucide-react'

interface Configuration {
  priceMultiplier: number
  associateDiscount: number
  defaultDeliveryTime: number
  minStockAlert: number
  maxStockAlert: number
  enableCache: boolean
  cacheTime: number
  newBadgeDays: number
  whatsappEnabled: boolean
  whatsappNumber: string
  whatsappContactName: string
  whatsappMessage: string
}

export default function ConfigurationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [config, setConfig] = useState<Configuration>({
    priceMultiplier: 2.5,
    associateDiscount: 20,
    defaultDeliveryTime: 7,
    minStockAlert: 5,
    maxStockAlert: 100,
    enableCache: true,
    cacheTime: 30,
    newBadgeDays: 30,
    whatsappEnabled: true,
    whatsappNumber: '34952123456',
    whatsappContactName: 'Elisabeth',
    whatsappMessage: 'Hola {contactName}, me interesa el producto "{productName}" cuyo enlace es: {productUrl}. ¿Me podrías dar información para realizar la compra?'
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push('/auth/unauthorized')
      return
    }

    loadConfiguration()
  }, [session, status, router])

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/admin/configuration')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConfig(data.data)
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error)
    }
  }

  const saveConfiguration = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Configuración guardada correctamente' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar la configuración' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Configuration, value: number | boolean | string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Configuración de Precios */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="h-5 w-5 text-[#f0a04b]" />
                <h2 className="text-lg font-semibold text-gray-900">Configuración de Precios</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Multiplicador de Precios
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={config.priceMultiplier}
                    onChange={(e) => handleInputChange('priceMultiplier', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Factor por el que se multiplican los precios base (ej: 2.5 = 150% de margen)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descuento Asociados (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={config.associateDiscount}
                    onChange={(e) => handleInputChange('associateDiscount', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Porcentaje de descuento para usuarios asociados
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración de Logística */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-5 w-5 text-[#f0a04b]" />
                <h2 className="text-lg font-semibold text-gray-900">Configuración de Logística</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Entrega por Defecto (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={config.defaultDeliveryTime}
                    onChange={(e) => handleInputChange('defaultDeliveryTime', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alerta Stock Bajo
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={config.minStockAlert}
                    onChange={(e) => handleInputChange('minStockAlert', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alerta Stock Alto
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    value={config.maxStockAlert}
                    onChange={(e) => handleInputChange('maxStockAlert', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
                  />
                </div>
              </div>
            </div>

            {/* Configuración de Cache */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-5 w-5 text-[#f0a04b]" />
                <h2 className="text-lg font-semibold text-gray-900">Configuración de Cache</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.enableCache}
                      onChange={(e) => handleInputChange('enableCache', e.target.checked)}
                      className="rounded border-gray-300 text-[#183a1d] focus:ring-[#183a1d]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Habilitar Cache
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Mejora el rendimiento pero puede mostrar datos menos actualizados
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Cache (minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={config.cacheTime}
                    onChange={(e) => handleInputChange('cacheTime', parseInt(e.target.value))}
                    disabled={!config.enableCache}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d] disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Configuración de Badges */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="h-5 w-5 text-[#f0a04b]" />
                <h2 className="text-lg font-semibold text-gray-900">Configuración de Badges</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días para mostrar badge "Nuevo"
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={config.newBadgeDays}
                    onChange={(e) => handleInputChange('newBadgeDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Productos dados de alta en Nieuwkoop hace menos de estos días mostrarán el badge "Nuevo"
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración de WhatsApp */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="h-5 w-5 text-[#f0a04b]" />
                <h2 className="text-lg font-semibold text-gray-900">Configuración de WhatsApp</h2>
              </div>
              
              <div className="space-y-6">
                {/* Habilitar WhatsApp */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="whatsappEnabled"
                      checked={config.whatsappEnabled}
                      onChange={(e) => handleInputChange('whatsappEnabled', e.target.checked)}
                      className="h-4 w-4 text-[#183a1d] focus:ring-[#183a1d] border-gray-300 rounded"
                    />
                    <label htmlFor="whatsappEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                      Habilitar botón de WhatsApp en lugar del carrito
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Si está activado, se mostrará un botón de WhatsApp en lugar del botón de carrito de compras
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de WhatsApp
                    </label>
                    <input
                      type="text"
                      value={config.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      placeholder="34952123456"
                      disabled={!config.whatsappEnabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d] disabled:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Número de WhatsApp con código de país (sin +)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de contacto
                    </label>
                    <input
                      type="text"
                      value={config.whatsappContactName}
                      onChange={(e) => handleInputChange('whatsappContactName', e.target.value)}
                      placeholder="Elisabeth"
                      disabled={!config.whatsappEnabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d] disabled:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nombre de la persona de contacto que aparecerá en el mensaje
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plantilla del mensaje
                  </label>
                  <textarea
                    rows={4}
                    value={config.whatsappMessage}
                    onChange={(e) => handleInputChange('whatsappMessage', e.target.value)}
                    disabled={!config.whatsappEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183a1d] disabled:bg-gray-100"
                    placeholder="Hola {contactName}, me interesa el producto &quot;{productName}&quot; cuyo enlace es: {productUrl}. ¿Me podrías dar información para realizar la compra?"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variables disponibles: <code className="bg-gray-200 px-1 rounded">{'{contactName}'}</code>, <code className="bg-gray-200 px-1 rounded">{'{productName}'}</code>, <code className="bg-gray-200 px-1 rounded">{'{productUrl}'}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Mensaje de estado */}
            {message && (
              <div className={`p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Botón de guardar */}
            <div className="flex justify-end">
              <button
                onClick={saveConfiguration}
                disabled={saving}
                className="flex items-center gap-2 bg-[#183a1d] text-white px-6 py-3 rounded-lg hover:bg-[#2a5530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}