import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const logs = await prisma.syncLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    })

    const totalCount = await prisma.syncLog.count()

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error: any) {
    console.error('Error fetching sync logs:', error)
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { olderThan } = await request.json()
    
    if (olderThan === null || olderThan === undefined || olderThan < 0) {
      return NextResponse.json(
        { success: false, error: 'Debe especificar un número de días válido' },
        { status: 400 }
      )
    }

    let deletedCount
    
    if (olderThan === 0) {
      // Eliminar todos los logs
      deletedCount = await prisma.syncLog.deleteMany({})
    } else {
      // Eliminar logs más antiguos que X días
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThan)
      
      deletedCount = await prisma.syncLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })
    }

    const message = olderThan === 0 
      ? `Se eliminaron ${deletedCount.count} registros (todos los logs)`
      : `Se eliminaron ${deletedCount.count} registros de más de ${olderThan} días`
    
    return NextResponse.json({
      success: true,
      deletedCount: deletedCount.count,
      message
    })

  } catch (error: any) {
    console.error('Error deleting sync logs:', error)
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