import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hybridSync } from '@/lib/nieuwkoop/hybrid-sync'
import { prisma } from '@/lib/prisma'

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

    // Get last sync date
    const lastSyncConfig = await prisma.configuration.findUnique({
      where: { key: 'last_sync_date' }
    })

    const lastSyncDate = (lastSyncConfig?.value && typeof lastSyncConfig.value === 'object' && 'timestamp' in lastSyncConfig.value) ? 
      new Date(lastSyncConfig.value.timestamp as string) : 
      new Date('2020-01-01')

    // Perform sync
    const result = await hybridSync.syncChanges(lastSyncDate)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Sincronización completada: ${result.newProducts} nuevos, ${result.updatedProducts} actualizados`
    })
  } catch (error: any) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en la sincronización',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

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

    // Get sync status
    const lastSyncConfig = await prisma.configuration.findUnique({
      where: { key: 'last_sync_date' }
    })

    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({
      where: { active: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        lastSync: (lastSyncConfig?.value && typeof lastSyncConfig.value === 'object' && 'timestamp' in lastSyncConfig.value) ? 
          lastSyncConfig.value.timestamp : null,
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts
      }
    })
  } catch (error: any) {
    console.error('Sync status API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener estado de sincronización' 
      },
      { status: 500 }
    )
  }
}