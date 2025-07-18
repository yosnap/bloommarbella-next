import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hybridSync } from '@/lib/nieuwkoop/hybrid-sync'
import { prisma } from '@/lib/prisma'
import { MongoClient } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { type = 'changes' } = await request.json()

    let result: any = {}

    switch (type) {
      case 'changes':
        // Sincronizar solo cambios desde la última sincronización
        const lastSync = await prisma.configuration.findUnique({
          where: { key: 'last_sync_date' }
        })
        
        const lastSyncDate = (lastSync?.value && typeof lastSync.value === 'object' && 'timestamp' in lastSync.value) 
          ? new Date(lastSync.value.timestamp as string) 
          : new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas por defecto

        result = await hybridSync.syncChanges(lastSyncDate)
        break

      case 'full':
        // Sincronización completa (desde 2020-01-01 para obtener todo el catálogo)
        result = await hybridSync.syncChanges(new Date('2020-01-01'))
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de sincronización no válido' },
          { status: 400 }
        )
    }

    // Registrar la sincronización usando MongoDB nativo
    try {
      const logClient = new MongoClient(process.env.DATABASE_URL!)
      await logClient.connect()
      const logDb = logClient.db()
      
      await logDb.collection('sync_logs').insertOne({
        type: `hybrid-${type}`,
        status: result.errors > 0 ? 'partial' : 'success',
        productsProcessed: result.newProducts + result.updatedProducts,
        errors: result.errors,
        metadata: {
          newProducts: result.newProducts,
          updatedProducts: result.updatedProducts,
          totalErrors: result.errors,
          errorDetails: result.errorDetails || [],
          syncType: type,
          completedAt: new Date().toISOString()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      await logClient.close()
    } catch (logError) {
      console.warn('Error logging hybrid sync success:', logError)
      // Continuar aunque el log falle
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        newProducts: result.newProducts,
        updatedProducts: result.updatedProducts,
        errors: result.errors,
        total: result.newProducts + result.updatedProducts,
        timestamp: new Date().toISOString()
      },
      message: `Sincronización ${type} completada: ${result.newProducts} nuevos, ${result.updatedProducts} actualizados`
    })

  } catch (error: any) {
    console.error('Error en sincronización híbrida:', error)
    
    // Registrar error en logs usando MongoDB nativo
    try {
      const logClient = new MongoClient(process.env.DATABASE_URL!)
      await logClient.connect()
      const logDb = logClient.db()
      
      await logDb.collection('sync_logs').insertOne({
        type: 'hybrid-error',
        status: 'error',
        productsProcessed: 0,
        errors: 1,
        metadata: {
          error: error.message,
          stack: error.stack
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      await logClient.close()
    } catch (logError) {
      console.error('Error logging hybrid sync failure:', logError)
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en sincronización híbrida',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status':
        const lastSync = await prisma.configuration.findUnique({
          where: { key: 'last_sync_date' }
        })

        const recentLogs = await prisma.syncLog.findMany({
          where: {
            type: { startsWith: 'hybrid-' }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })

        const stats = await prisma.product.aggregate({
          _count: { _all: true },
          where: { active: true }
        })

        return NextResponse.json({
          success: true,
          data: {
            lastSync: (lastSync?.value && typeof lastSync.value === 'object' && 'timestamp' in lastSync.value) ? lastSync.value.timestamp : null,
            totalProducts: stats._count._all,
            recentLogs,
            systemStatus: 'ready'
          }
        })

      case 'test':
        // Probar conexión con Nieuwkoop
        const testProduct = await prisma.product.findFirst({
          where: { active: true },
          select: { sku: true }
        })

        if (!testProduct) {
          return NextResponse.json({
            success: false,
            error: 'No hay productos para probar'
          })
        }

        const testData = await hybridSync.getProductWithRealtimeData(testProduct.sku)
        
        return NextResponse.json({
          success: true,
          data: {
            testSku: testProduct.sku,
            hasRealTimeData: testData.isRealTimeData,
            currentPrice: testData.currentPrice,
            currentStock: testData.currentStock,
            timestamp: new Date().toISOString()
          }
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Error en GET sync-hybrid:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}