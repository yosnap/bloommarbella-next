import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MongoClient } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { syncType } = await request.json()

    if (!syncType || !['changes', 'full'].includes(syncType)) {
      return NextResponse.json({ error: 'syncType debe ser "changes" o "full"' }, { status: 400 })
    }

    // Verificar si hay una sincronización en progreso
    const ongoingSync = await prisma.syncLog.findFirst({
      where: {
        type: { startsWith: 'sync-' },
        status: 'in_progress'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (ongoingSync) {
      return NextResponse.json({ 
        error: 'Ya hay una sincronización en progreso',
        ongoingSync: {
          id: ongoingSync.id,
          type: ongoingSync.type,
          startedAt: ongoingSync.createdAt
        }
      }, { status: 409 })
    }

    // Crear log de inicio usando MongoDB nativo
    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const db = client.db()
    
    const syncLogResult = await db.collection('sync_logs').insertOne({
      type: `sync-${syncType}`,
      status: 'in_progress',
      productsProcessed: 0,
      errors: 0,
      metadata: {
        startedBy: session.user.email,
        startedAt: new Date().toISOString(),
        syncType
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    await client.close()
    
    const syncLog = { 
      id: syncLogResult.insertedId.toString(), 
      type: `sync-${syncType}`,
      status: 'in_progress',
      createdAt: new Date() 
    }

    // Obtener configuraciones
    const [scheduleConfig, batchConfig, lastSyncConfig] = await Promise.all([
      prisma.configuration.findUnique({ where: { key: 'sync_schedule' } }),
      prisma.configuration.findUnique({ where: { key: 'sync_batch_settings' } }),
      prisma.configuration.findUnique({ where: { key: 'last_sync_date' } })
    ])

    // Determinar fecha de última sincronización
    let lastSyncDate: Date
    if (syncType === 'full') {
      // Para sincronización completa, usar fecha de hace 30 días
      lastSyncDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    } else {
      // Para sincronización de cambios, usar la última fecha exitosa
      const lastSyncValue = lastSyncConfig?.value as { timestamp?: string } | undefined
      lastSyncDate = lastSyncValue?.timestamp 
        ? new Date(lastSyncValue.timestamp)
        : new Date(Date.now() - 24 * 60 * 60 * 1000)
    }

    // Responder inmediatamente y procesar en background
    const response = NextResponse.json({
      success: true,
      message: `Sincronización ${syncType} iniciada`,
      syncLog: {
        id: syncLog.id,
        type: syncLog.type,
        status: syncLog.status,
        startedAt: syncLog.createdAt
      },
      lastSyncDate: lastSyncDate.toISOString()
    })

    // Procesar en background (no await para no bloquear la respuesta)
    processSyncInBackground(syncLog.id, syncType, lastSyncDate, batchConfig?.value)

    return response

  } catch (error) {
    console.error('Error ejecutando sincronización:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

async function processSyncInBackground(
  syncLogId: string,
  syncType: string,
  lastSyncDate: Date,
  batchConfig: any
) {
  try {
    const { hybridSync } = await import('@/lib/nieuwkoop/hybrid-sync')
    
    console.log(`🔄 Iniciando sincronización ${syncType} desde ${lastSyncDate.toISOString()}`)
    
    // Ejecutar sincronización con configuración de lotes
    const result = await hybridSync.syncChanges(lastSyncDate, batchConfig)
    
    // Actualizar log con resultado exitoso usando MongoDB nativo
    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const db = client.db()
    const { ObjectId } = require('mongodb')
    
    await db.collection('sync_logs').updateOne(
      { _id: new ObjectId(syncLogId) },
      {
        $set: {
          status: result.errors > 0 ? 'partial' : 'success',
          productsProcessed: result.newProducts + result.updatedProducts,
          errors: result.errors,
          metadata: {
            ...result,
            completedAt: new Date().toISOString(),
            syncType,
            lastSyncDate: lastSyncDate.toISOString()
          },
          updatedAt: new Date()
        }
      }
    )

    // Actualizar última sincronización exitosa solo si no hubo errores
    if (result.errors === 0) {
      await db.collection('configurations').updateOne(
        { key: 'last_sync_date' },
        {
          $set: {
            value: {
              timestamp: new Date().toISOString(),
              status: 'success'
            },
            updatedAt: new Date()
          },
          $setOnInsert: {
            key: 'last_sync_date',
            description: 'Última sincronización exitosa de productos',
            createdAt: new Date()
          }
        },
        { upsert: true }
      )
    }
    
    await client.close()

    console.log(`✅ Sincronización ${syncType} completada: ${result.newProducts} nuevos, ${result.updatedProducts} actualizados, ${result.errors} errores`)

  } catch (error) {
    console.error(`❌ Error en sincronización ${syncType}:`, error)
    
    // Actualizar log con error usando MongoDB nativo
    try {
      const client = new MongoClient(process.env.DATABASE_URL!)
      await client.connect()
      const db = client.db()
      const { ObjectId } = require('mongodb')
      
      await db.collection('sync_logs').updateOne(
        { _id: new ObjectId(syncLogId) },
        {
          $set: {
            status: 'error',
            errors: 1,
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
              completedAt: new Date().toISOString(),
              syncType,
              lastSyncDate: lastSyncDate.toISOString()
            },
            updatedAt: new Date()
          }
        }
      )
      
      await client.close()
    } catch (logError) {
      console.error('Error updating sync log:', logError)
    }
  }
}