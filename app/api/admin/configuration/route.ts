import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get all configuration values
    const configurations = await prisma.configuration.findMany({
      where: {
        key: {
          in: [
            'price_multiplier',
            'associate_discount',
            'default_delivery_time',
            'min_stock_alert',
            'max_stock_alert',
            'enable_cache',
            'cache_time'
          ]
        }
      }
    })

    // Convert to object format
    const config = {
      priceMultiplier: 2.5,
      associateDiscount: 20,
      defaultDeliveryTime: 7,
      minStockAlert: 5,
      maxStockAlert: 100,
      enableCache: true,
      cacheTime: 30
    }

    configurations.forEach(item => {
      switch (item.key) {
        case 'price_multiplier':
          config.priceMultiplier = parseFloat(item.value?.toString() || '2.5') || 2.5
          break
        case 'associate_discount':
          config.associateDiscount = parseInt(item.value?.toString() || '20') || 20
          break
        case 'default_delivery_time':
          config.defaultDeliveryTime = parseInt(item.value?.toString() || '7') || 7
          break
        case 'min_stock_alert':
          config.minStockAlert = parseInt(item.value?.toString() || '5') || 5
          break
        case 'max_stock_alert':
          config.maxStockAlert = parseInt(item.value?.toString() || '100') || 100
          break
        case 'enable_cache':
          config.enableCache = item.value === 'true' || item.value === true
          break
        case 'cache_time':
          config.cacheTime = parseInt(item.value?.toString() || '30') || 30
          break
      }
    })

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error: any) {
    console.error('Configuration GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener configuración' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      priceMultiplier,
      associateDiscount,
      defaultDeliveryTime,
      minStockAlert,
      maxStockAlert,
      enableCache,
      cacheTime
    } = body

    // Update each configuration value
    const configUpdates = [
      { key: 'price_multiplier', value: priceMultiplier.toString() },
      { key: 'associate_discount', value: associateDiscount.toString() },
      { key: 'default_delivery_time', value: defaultDeliveryTime.toString() },
      { key: 'min_stock_alert', value: minStockAlert.toString() },
      { key: 'max_stock_alert', value: maxStockAlert.toString() },
      { key: 'enable_cache', value: enableCache.toString() },
      { key: 'cache_time', value: cacheTime.toString() }
    ]

    for (const config of configUpdates) {
      await prisma.configuration.upsert({
        where: { key: config.key },
        update: { 
          value: config.value,
          updatedAt: new Date()
        },
        create: {
          key: config.key,
          value: config.value,
          description: getConfigDescription(config.key)
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente'
    })
  } catch (error: any) {
    console.error('Configuration POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al guardar configuración' 
      },
      { status: 500 }
    )
  }
}

function getConfigDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'price_multiplier': 'Multiplicador de precios sobre el precio base',
    'associate_discount': 'Porcentaje de descuento para usuarios asociados',
    'default_delivery_time': 'Tiempo de entrega por defecto en días',
    'min_stock_alert': 'Cantidad mínima de stock para alertas',
    'max_stock_alert': 'Cantidad máxima de stock para alertas',
    'enable_cache': 'Habilitar cache para mejorar rendimiento',
    'cache_time': 'Tiempo de cache en minutos'
  }
  return descriptions[key] || 'Configuración del sistema'
}