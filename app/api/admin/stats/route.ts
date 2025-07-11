import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener estadísticas
    const [
      totalProducts,
      lastSyncConfig,
      recentErrors
    ] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.configuration.findUnique({ where: { key: 'last_sync_date' } }),
      prisma.syncLog.count({
        where: {
          status: 'error',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      })
    ])

    const stats = {
      totalProducts,
      lastSync: (lastSyncConfig?.value && typeof lastSyncConfig.value === 'object' && 'timestamp' in lastSyncConfig.value) ? lastSyncConfig.value.timestamp : null,
      syncInProgress: false, // TODO: Implementar verificación de sync en progreso
      recentErrors
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}