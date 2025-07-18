import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MongoClient } from 'mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener versión del sistema desde la base de datos
    let systemVersion = '1.0.1' // Versión por defecto
    
    try {
      const versionConfig = await prisma.configuration.findUnique({
        where: { key: 'system_version' }
      })
      
      if (versionConfig && versionConfig.value) {
        systemVersion = versionConfig.value as string
      }
    } catch (error) {
      console.warn('Error obteniendo versión del sistema:', error)
    }

    return NextResponse.json({
      version: systemVersion,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error obteniendo versión del sistema:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { version } = await request.json()
    
    if (!version || typeof version !== 'string') {
      return NextResponse.json({ error: 'Versión requerida' }, { status: 400 })
    }

    // Validar formato de versión (x.y.z)
    const versionRegex = /^\d+\.\d+\.\d+$/
    if (!versionRegex.test(version)) {
      return NextResponse.json({ 
        error: 'Formato de versión inválido. Use formato x.y.z (ej: 1.0.1)' 
      }, { status: 400 })
    }

    // Actualizar versión usando MongoDB nativo para evitar P2031
    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const db = client.db()
    
    await db.collection('configurations').updateOne(
      { key: 'system_version' },
      {
        $set: {
          value: version,
          description: 'Versión actual del sistema Bloom Marbella',
          updatedAt: new Date()
        },
        $setOnInsert: {
          key: 'system_version',
          createdAt: new Date()
        }
      },
      { upsert: true }
    )
    
    // Registrar cambio de versión en logs
    await db.collection('sync_logs').insertOne({
      type: 'system-version-update',
      status: 'success',
      productsProcessed: 0,
      errors: 0,
      metadata: {
        oldVersion: 'unknown',
        newVersion: version,
        updatedBy: session.user.email,
        timestamp: new Date().toISOString()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    await client.close()

    return NextResponse.json({
      success: true,
      version: version,
      message: `Versión del sistema actualizada a ${version}`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error actualizando versión del sistema:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}