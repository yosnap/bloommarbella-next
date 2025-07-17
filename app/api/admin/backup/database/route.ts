import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔧 Iniciando backup de base de datos...')

    // Obtener todos los datos de las colecciones
    const [
      products,
      users,
      configurations,
      translations,
      categoryVisibility,
      syncLogs,
      favorites
    ] = await Promise.all([
      prisma.product.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          emailVerified: true,
          name: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          companyName: true,
          taxId: true,
          phone: true,
          address: true,
          city: true,
          postalCode: true,
          associateStatus: true,
          associateRequestDate: true,
          associateApprovalDate: true,
          isActive: true,
          isEmailNotificationsEnabled: true,
          lastLogin: true,
          // No incluir el campo password por seguridad
        }
      }),
      prisma.configuration.findMany(),
      prisma.translation.findMany(),
      prisma.categoryVisibility.findMany(),
      prisma.syncLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1000 // Limitar logs para no hacer el backup muy grande
      }),
      prisma.favorite.findMany()
    ])

    // Crear objeto de backup
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      collections: {
        products: {
          count: products.length,
          data: products
        },
        users: {
          count: users.length,
          data: users
        },
        configurations: {
          count: configurations.length,
          data: configurations
        },
        translations: {
          count: translations.length,
          data: translations
        },
        categoryVisibility: {
          count: categoryVisibility.length,
          data: categoryVisibility
        },
        syncLogs: {
          count: syncLogs.length,
          data: syncLogs
        },
        favorites: {
          count: favorites.length,
          data: favorites
        }
      },
      metadata: {
        createdBy: session.user.email,
        totalRecords: products.length + users.length + configurations.length + 
                     translations.length + categoryVisibility.length + 
                     syncLogs.length + favorites.length
      }
    }

    // Convertir a JSON
    const jsonString = JSON.stringify(backup, null, 2)
    const buffer = Buffer.from(jsonString, 'utf-8')

    console.log(`✅ Backup creado: ${backup.metadata.totalRecords} registros`)

    // Registrar en logs
    await prisma.syncLog.create({
      data: {
        type: 'backup-database',
        status: 'success',
        productsProcessed: backup.metadata.totalRecords,
        errors: 0,
        metadata: {
          collections: Object.keys(backup.collections).map(key => ({
            name: key,
            count: backup.collections[key as keyof typeof backup.collections].count
          })),
          size: `${(buffer.length / 1024 / 1024).toFixed(2)} MB`
        }
      }
    })

    // Devolver el archivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bloom_backup_${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('❌ Error creando backup:', error)
    
    await prisma.syncLog.create({
      data: {
        type: 'backup-database',
        status: 'error',
        productsProcessed: 0,
        errors: 1,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    return NextResponse.json({ 
      error: 'Error creando backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}