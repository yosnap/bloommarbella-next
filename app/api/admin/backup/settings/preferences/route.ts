import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener preferencias de backup de ajustes
    const preferences = await prisma.configuration.findUnique({
      where: { key: 'backup_settings_preferences' }
    })

    if (!preferences) {
      // Si no hay preferencias, devolver configuración por defecto
      return NextResponse.json({
        preferences: {
          priceMultiplier: true,
          associateDiscount: true,
          defaultDeliveryTime: true,
          minStockAlert: true,
          maxStockAlert: true,
          enableCache: true,
          cacheTime: true,
          newBadgeDays: true,
          whatsappEnabled: true,
          whatsappNumber: true,
          whatsappContactName: true,
          sync_schedule: true,
          sync_batch_settings: true,
          sync_settings: true,
          emailNotifications: false,
          maintenanceMode: false,
          apiRateLimit: false,
          siteTitle: false,
          siteDescription: false,
        }
      })
    }

    return NextResponse.json({
      preferences: preferences.value
    })

  } catch (error) {
    console.error('Error obteniendo preferencias de backup:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { preferences } = await request.json()

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json({ error: 'Preferencias inválidas' }, { status: 400 })
    }

    // Guardar preferencias de backup
    await prisma.configuration.upsert({
      where: { key: 'backup_settings_preferences' },
      update: {
        value: preferences,
        updatedAt: new Date()
      },
      create: {
        key: 'backup_settings_preferences',
        value: preferences,
        description: 'Preferencias de selección para backup de ajustes'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Preferencias guardadas correctamente'
    })

  } catch (error) {
    console.error('Error guardando preferencias de backup:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}