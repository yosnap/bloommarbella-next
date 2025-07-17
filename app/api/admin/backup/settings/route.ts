import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Lista de claves de configuración que se incluyen en el backup de ajustes
const SETTINGS_KEYS = [
  // Configuración general
  'priceMultiplier',
  'associateDiscount',
  'defaultDeliveryTime',
  'minStockAlert',
  'maxStockAlert',
  'enableCache',
  'cacheTime',
  'newBadgeDays',
  
  // Configuración de WhatsApp
  'whatsappEnabled',
  'whatsappNumber',
  'whatsappContactName',
  
  // Configuración de sincronización
  'sync_schedule',
  'sync_batch_settings',
  'sync_settings',
  
  // Otras configuraciones del sistema
  'emailNotifications',
  'maintenanceMode',
  'googleAnalyticsId',
  'facebookPixelId',
  'cookieConsentEnabled',
  'termsAndConditionsUrl',
  'privacyPolicyUrl',
  
  // Configuraciones de SEO
  'siteTitle',
  'siteDescription',
  'siteKeywords',
  'defaultMetaImage',
  
  // Configuraciones de API
  'apiRateLimit',
  'apiTimeout',
  'enableApiLogs',
  
  // Configuraciones de backup
  'backup_settings_preferences',
  
  // Cualquier configuración futura se agregará aquí
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔧 Iniciando backup de ajustes...')

    // Obtener ajustes seleccionados del request
    const body = await request.json()
    const selectedSettings = body.selectedSettings || SETTINGS_KEYS

    // Validar que todos los ajustes seleccionados estén permitidos
    const invalidSettings = selectedSettings.filter((key: string) => !SETTINGS_KEYS.includes(key))
    if (invalidSettings.length > 0) {
      return NextResponse.json({ 
        error: `Ajustes no permitidos: ${invalidSettings.join(', ')}` 
      }, { status: 400 })
    }

    // Obtener las configuraciones seleccionadas
    const configurations = await prisma.configuration.findMany({
      where: {
        key: {
          in: selectedSettings
        }
      }
    })

    // Crear objeto de backup de ajustes
    const settingsBackup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      type: 'settings',
      settings: configurations.reduce((acc, config) => {
        acc[config.key] = {
          value: config.value,
          description: config.description,
          updatedAt: config.updatedAt
        }
        return acc
      }, {} as Record<string, any>),
      metadata: {
        createdBy: session.user.email,
        totalSettings: configurations.length,
        includedKeys: selectedSettings,
        availableKeys: SETTINGS_KEYS
      }
    }

    // Convertir a JSON
    const jsonString = JSON.stringify(settingsBackup, null, 2)
    const buffer = Buffer.from(jsonString, 'utf-8')

    console.log(`✅ Backup de ajustes creado: ${configurations.length} configuraciones`)

    // Registrar en logs
    await prisma.syncLog.create({
      data: {
        type: 'backup-settings',
        status: 'success',
        productsProcessed: configurations.length,
        errors: 0,
        metadata: {
          settings: configurations.map(c => c.key),
          size: `${(buffer.length / 1024).toFixed(2)} KB`
        }
      }
    })

    // Devolver el archivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bloom_settings_${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('❌ Error creando backup de ajustes:', error)
    
    await prisma.syncLog.create({
      data: {
        type: 'backup-settings',
        status: 'error',
        productsProcessed: 0,
        errors: 1,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    return NextResponse.json({ 
      error: 'Error creando backup de ajustes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}