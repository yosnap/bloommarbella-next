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

    // Obtener todas las configuraciones de sincronización
    const configs = await prisma.configuration.findMany({
      where: {
        key: {
          in: ['sync_schedule', 'sync_batch_settings', 'sync_settings', 'last_sync_date']
        }
      }
    })

    // Organizar configuraciones por tipo
    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value
      return acc
    }, {} as Record<string, any>)

    // Obtener estadísticas recientes
    const recentLogs = await prisma.syncLog.findMany({
      where: {
        type: { startsWith: 'sync-' }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const totalProducts = await prisma.product.count({
      where: { active: true }
    })

    return NextResponse.json({
      config: configMap,
      stats: {
        totalProducts,
        recentLogs: recentLogs.map(log => ({
          id: log.id,
          type: log.type,
          status: log.status,
          processed: log.productsProcessed,
          errors: log.errors,
          createdAt: log.createdAt,
          metadata: log.metadata
        }))
      }
    })

  } catch (error) {
    console.error('Error obteniendo configuración de sync:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { configType, value } = await request.json()

    if (!configType || !value) {
      return NextResponse.json({ error: 'Tipo de configuración y valor son requeridos' }, { status: 400 })
    }

    // Validar tipos de configuración permitidos
    const allowedTypes = ['sync_schedule', 'sync_batch_settings', 'sync_settings']
    if (!allowedTypes.includes(configType)) {
      return NextResponse.json({ error: 'Tipo de configuración no válido' }, { status: 400 })
    }

    // Validar valores según el tipo
    if (configType === 'sync_schedule') {
      const { enabled, interval, time, dayOfWeek, dayOfMonth, customCron } = value
      
      if (typeof enabled !== 'boolean') {
        return NextResponse.json({ error: 'enabled debe ser boolean' }, { status: 400 })
      }
      
      if (!['hourly', 'daily', 'weekly', 'monthly', 'custom'].includes(interval)) {
        return NextResponse.json({ error: 'interval no válido' }, { status: 400 })
      }
      
      if (interval === 'custom' && !customCron) {
        return NextResponse.json({ error: 'customCron es requerido para interval custom' }, { status: 400 })
      }
    }

    if (configType === 'sync_batch_settings') {
      const { batchSize, pauseBetweenBatches, maxConcurrentRequests } = value
      
      if (typeof batchSize !== 'number' || batchSize < 100 || batchSize > 5000) {
        return NextResponse.json({ error: 'batchSize debe ser un número entre 100 y 5000' }, { status: 400 })
      }
      
      if (typeof pauseBetweenBatches !== 'number' || pauseBetweenBatches < 500 || pauseBetweenBatches > 10000) {
        return NextResponse.json({ error: 'pauseBetweenBatches debe ser un número entre 500 y 10000' }, { status: 400 })
      }
      
      if (typeof maxConcurrentRequests !== 'number' || maxConcurrentRequests < 1 || maxConcurrentRequests > 20) {
        return NextResponse.json({ error: 'maxConcurrentRequests debe ser un número entre 1 y 20' }, { status: 400 })
      }
    }

    // Actualizar configuración
    await prisma.configuration.upsert({
      where: { key: configType },
      update: {
        value,
        updatedAt: new Date()
      },
      create: {
        key: configType,
        value,
        description: `Configuración de ${configType}`
      }
    })

    // Registrar cambio en logs
    await prisma.syncLog.create({
      data: {
        type: 'config-update',
        status: 'success',
        productsProcessed: 0,
        errors: 0,
        metadata: {
          configType,
          updatedBy: session.user.email,
          changes: value
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Configuración actualizada correctamente'
    })

  } catch (error) {
    console.error('Error actualizando configuración de sync:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}