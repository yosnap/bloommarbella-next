import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MongoClient } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sync', 'restore', 'error', etc.
    const limit = parseInt(searchParams.get('limit') || '20')
    const since = searchParams.get('since') // ISO date string

    // Usar MongoDB nativo para evitar P2031
    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const db = client.db()

    try {
      // Construir filtros
      const filter: any = {}
      
      if (type) {
        filter.type = { $regex: type, $options: 'i' }
      }
      
      if (since) {
        filter.createdAt = { $gte: new Date(since) }
      }

      console.log('🔍 Debug logs filter:', filter)

      // Obtener logs con detalles completos
      const logs = await db.collection('sync_logs')
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()

      console.log(`📋 Found ${logs.length} logs`)

      // Agregar estadísticas adicionales
      const stats = {
        total: await db.collection('sync_logs').countDocuments(),
        byStatus: {},
        byType: {},
        recent: await db.collection('sync_logs')
          .countDocuments({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          })
      }

      // Estadísticas por estado y tipo
      const statusAgg = await db.collection('sync_logs').aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray()

      const typeAgg = await db.collection('sync_logs').aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray()

      stats.byStatus = Object.fromEntries(
        statusAgg.map(s => [s._id, s.count])
      )
      stats.byType = Object.fromEntries(
        typeAgg.map(t => [t._id, t.count])
      )

      return NextResponse.json({
        success: true,
        logs: logs.map(log => ({
          ...log,
          id: log._id.toString(),
          _id: undefined
        })),
        stats,
        filter: {
          type,
          since,
          limit
        }
      })

    } finally {
      await client.close()
    }

  } catch (error) {
    console.error('Error fetching debug logs:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Endpoint para agregar log de prueba (solo para debugging)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { type, status, message, metadata } = await request.json()

    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const db = client.db()

    try {
      const testLog = {
        type: type || 'debug-test',
        status: status || 'info',
        productsProcessed: 0,
        errors: 0,
        metadata: {
          message: message || 'Log de prueba generado desde debug endpoint',
          createdBy: session.user.email,
          ...metadata
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await db.collection('sync_logs').insertOne(testLog)

      return NextResponse.json({
        success: true,
        logId: result.insertedId.toString(),
        message: 'Log de prueba creado'
      })

    } finally {
      await client.close()
    }

  } catch (error) {
    console.error('Error creating debug log:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}