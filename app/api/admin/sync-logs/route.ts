import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MongoClient } from 'mongodb'

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

    // Usar MongoDB nativo para evitar P2031
    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const db = client.db()

    try {
      const logs = await db.collection('sync_logs')
        .find({})
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray()

      const totalCount = await db.collection('sync_logs').countDocuments()

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

    } finally {
      await client.close()
    }

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

    // Usar MongoDB nativo para evitar P2031
    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const db = client.db()

    try {
      let deleteResult
      
      if (olderThan === 0) {
        // Eliminar todos los logs
        deleteResult = await db.collection('sync_logs').deleteMany({})
      } else {
        // Eliminar logs más antiguos que X días
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - olderThan)
        
        deleteResult = await db.collection('sync_logs').deleteMany({
          createdAt: { $lt: cutoffDate }
        })
      }

      const message = olderThan === 0 
        ? `Se eliminaron ${deleteResult.deletedCount} registros (todos los logs)`
        : `Se eliminaron ${deleteResult.deletedCount} registros de más de ${olderThan} días`
      
      return NextResponse.json({
        success: true,
        deletedCount: deleteResult.deletedCount,
        message
      })

    } finally {
      await client.close()
    }

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