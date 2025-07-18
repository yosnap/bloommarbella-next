import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MongoClient } from 'mongodb'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Leer package.json para obtener dependencias
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    let packageInfo = {}
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      packageInfo = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        dependencies: packageJson.dependencies,
        devDependencies: packageJson.devDependencies
      }
    } catch (error) {
      console.warn('No se pudo leer package.json:', error)
    }

    // Información del servidor
    const serverInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    }

    // Estadísticas de la base de datos usando driver nativo para evitar P2031
    let dbStats = {}
    try {
      const client = new MongoClient(process.env.DATABASE_URL!)
      await client.connect()
      const db = client.db()
      
      // Obtener estadísticas de colecciones
      const collections = await db.listCollections().toArray()
      const collectionStats: Record<string, {
        documents: number
        name: string
        error?: string
      }> = {}
      
      for (const collection of collections) {
        try {
          const stats = await db.collection(collection.name).estimatedDocumentCount()
          collectionStats[collection.name] = {
            documents: stats,
            name: collection.name
          }
        } catch (err) {
          console.warn(`Error obteniendo stats de ${collection.name}:`, err)
          collectionStats[collection.name] = {
            documents: 0,
            name: collection.name,
            error: 'No disponible'
          }
        }
      }

      // Información de la base de datos
      const admin = db.admin()
      let dbInfo: {
        version?: string
        platform?: string
        engine: string
        error?: string
      } = { engine: 'MongoDB' }
      try {
        const buildInfo = await admin.buildInfo()
        dbInfo = {
          version: buildInfo.version,
          platform: buildInfo.platform,
          engine: 'MongoDB'
        }
      } catch (err) {
        dbInfo = {
          engine: 'MongoDB',
          version: 'No disponible',
          error: err instanceof Error ? err.message : 'Error desconocido'
        }
      }

      dbStats = {
        collections: collectionStats,
        info: dbInfo,
        connectionString: process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, '//***:***@') || 'No configurada'
      }

      await client.close()
    } catch (error) {
      console.error('Error obteniendo estadísticas de BD:', error)
      dbStats = {
        error: 'No se pudo conectar a la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }
    }

    // Configuraciones principales del sistema
    let systemConfig: Record<string, {
      description: string
      value: any
      lastUpdated: Date
    }> | { error: string } = {}
    try {
      const configs = await prisma.configuration.findMany({
        where: {
          key: {
            in: [
              'priceMultiplier',
              'associateDiscount', 
              'sync_schedule',
              'sync_batch_settings',
              'whatsapp_config'
            ]
          }
        }
      })
      
      systemConfig = configs.reduce((acc: Record<string, any>, config) => {
        acc[config.key] = {
          description: config.description,
          value: config.value,
          lastUpdated: config.updatedAt
        }
        return acc
      }, {})
    } catch (error) {
      console.warn('Error obteniendo configuraciones:', error)
      systemConfig = { error: 'No disponible' }
    }

    // Logs recientes del sistema
    let recentLogs: Array<{
      id: string
      type: string
      status: string
      productsProcessed: number
      errors: number
      createdAt: Date
    }> = []
    try {
      recentLogs = await prisma.syncLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          status: true,
          productsProcessed: true,
          errors: true,
          createdAt: true
        }
      })
    } catch (error) {
      console.warn('Error obteniendo logs:', error)
      recentLogs = []
    }

    // Variables de entorno importantes (sin mostrar secretos)
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, '//***:***@') || 'No configurada',
      NIEUWKOOP_API_URL: process.env.NIEUWKOOP_API_URL || 'No configurada',
      hasApiCredentials: !!(process.env.NIEUWKOOP_API_USER && process.env.NIEUWKOOP_API_PASSWORD),
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
    }

    // Información de Next.js
    const nextjsInfo = {
      version: '15.3.5', // Hardcoded ya que es difícil obtenerla dinámicamente
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      buildTime: new Date().toISOString() // Esto debería ser la fecha de build real
    }

    return NextResponse.json({
      package: packageInfo,
      server: serverInfo,
      database: dbStats,
      configuration: systemConfig,
      recentLogs,
      environment: envVars,
      nextjs: nextjsInfo,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error obteniendo información del sistema:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}