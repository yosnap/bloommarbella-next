import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔧 Iniciando restauración de base de datos...')

    // Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get('backup') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Leer y parsear el archivo
    const text = await file.text()
    const backup = JSON.parse(text)

    // Validar estructura del backup
    if (!backup.version || !backup.collections) {
      return NextResponse.json({ error: 'Formato de backup inválido' }, { status: 400 })
    }

    console.log(`📦 Backup detectado: v${backup.version} - ${backup.metadata?.totalRecords || 0} registros`)

    let restoredCount = 0
    const errors: string[] = []

    // Iniciar transacción
    try {
      // IMPORTANTE: Restaurar en orden para respetar las relaciones
      
      // 1. Limpiar datos actuales (excepto el usuario admin actual)
      console.log('🗑️ Limpiando datos actuales...')
      
      await prisma.favorite.deleteMany()
      await prisma.syncLog.deleteMany()
      await prisma.categoryVisibility.deleteMany()
      await prisma.translation.deleteMany()
      await prisma.product.deleteMany()
      
      // Para usuarios, mantener el admin actual
      await prisma.user.deleteMany({
        where: {
          email: {
            not: session.user.email
          }
        }
      })

      // 2. Restaurar usuarios (excepto el admin actual)
      if (backup.collections.users?.data) {
        console.log(`👥 Restaurando ${backup.collections.users.count} usuarios...`)
        const usersToRestore = backup.collections.users.data.filter(
          (user: any) => user.email !== session.user.email
        )
        
        for (const user of usersToRestore) {
          try {
            await prisma.user.create({
              data: {
                ...user,
                emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
                associateRequestDate: user.associateRequestDate ? new Date(user.associateRequestDate) : null,
                associateApprovalDate: user.associateApprovalDate ? new Date(user.associateApprovalDate) : null,
                lastLogin: user.lastLogin ? new Date(user.lastLogin) : null
              }
            })
            restoredCount++
          } catch (err) {
            errors.push(`Error restaurando usuario ${user.email}: ${err}`)
          }
        }
      }

      // 3. Restaurar productos
      if (backup.collections.products?.data) {
        console.log(`📦 Restaurando ${backup.collections.products.count} productos...`)
        for (const product of backup.collections.products.data) {
          try {
            await prisma.product.create({
              data: {
                ...product,
                createdAt: new Date(product.createdAt),
                updatedAt: new Date(product.updatedAt)
              }
            })
            restoredCount++
          } catch (err) {
            errors.push(`Error restaurando producto ${product.itemCode}: ${err}`)
          }
        }
      }

      // 4. Restaurar configuraciones
      if (backup.collections.configurations?.data) {
        console.log(`⚙️ Restaurando ${backup.collections.configurations.count} configuraciones...`)
        for (const config of backup.collections.configurations.data) {
          try {
            await prisma.configuration.upsert({
              where: { key: config.key },
              update: {
                value: config.value,
                description: config.description,
                updatedAt: new Date()
              },
              create: {
                ...config,
                createdAt: new Date(config.createdAt),
                updatedAt: new Date(config.updatedAt)
              }
            })
            restoredCount++
          } catch (err) {
            errors.push(`Error restaurando configuración ${config.key}: ${err}`)
          }
        }
      }

      // 5. Restaurar traducciones
      if (backup.collections.translations?.data) {
        console.log(`🌐 Restaurando ${backup.collections.translations.count} traducciones...`)
        for (const translation of backup.collections.translations.data) {
          try {
            await prisma.translation.create({
              data: {
                ...translation,
                createdAt: new Date(translation.createdAt),
                updatedAt: new Date(translation.updatedAt)
              }
            })
            restoredCount++
          } catch (err) {
            errors.push(`Error restaurando traducción: ${err}`)
          }
        }
      }

      // 6. Restaurar visibilidad de categorías
      if (backup.collections.categoryVisibility?.data) {
        console.log(`🏷️ Restaurando ${backup.collections.categoryVisibility.count} categorías...`)
        for (const category of backup.collections.categoryVisibility.data) {
          try {
            await prisma.categoryVisibility.create({
              data: {
                ...category,
                createdAt: new Date(category.createdAt),
                updatedAt: new Date(category.updatedAt)
              }
            })
            restoredCount++
          } catch (err) {
            errors.push(`Error restaurando categoría ${category.englishName}: ${err}`)
          }
        }
      }

      // 7. Restaurar favoritos
      if (backup.collections.favorites?.data) {
        console.log(`⭐ Restaurando ${backup.collections.favorites.count} favoritos...`)
        for (const favorite of backup.collections.favorites.data) {
          try {
            // Verificar que el usuario y producto existan
            const userExists = await prisma.user.findUnique({ where: { id: favorite.userId } })
            const productExists = await prisma.product.findUnique({ where: { id: favorite.productId } })
            
            if (userExists && productExists) {
              await prisma.favorite.create({
                data: {
                  ...favorite,
                  createdAt: new Date(favorite.createdAt)
                }
              })
              restoredCount++
            }
          } catch (err) {
            errors.push(`Error restaurando favorito: ${err}`)
          }
        }
      }

      // 8. Restaurar logs de sincronización (opcional, solo los más recientes)
      if (backup.collections.syncLogs?.data) {
        console.log(`📋 Restaurando ${backup.collections.syncLogs.count} logs...`)
        const recentLogs = backup.collections.syncLogs.data.slice(0, 100) // Solo los últimos 100
        for (const log of recentLogs) {
          try {
            await prisma.syncLog.create({
              data: {
                ...log,
                createdAt: new Date(log.createdAt),
                updatedAt: new Date(log.updatedAt)
              }
            })
            restoredCount++
          } catch (err) {
            // Los logs no son críticos, solo registrar
            console.warn(`Error restaurando log: ${err}`)
          }
        }
      }

      console.log(`✅ Restauración completada: ${restoredCount} registros`)

      // Registrar en logs
      await prisma.syncLog.create({
        data: {
          type: 'restore-database',
          status: errors.length > 0 ? 'partial' : 'success',
          productsProcessed: restoredCount,
          errors: errors.length,
          metadata: {
            backupVersion: backup.version,
            backupDate: backup.timestamp,
            restoredBy: session.user.email,
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Solo primeros 10 errores
          }
        }
      })

      return NextResponse.json({ 
        success: true,
        restored: restoredCount,
        errors: errors.length,
        message: errors.length > 0 
          ? `Restauración parcial: ${restoredCount} registros restaurados, ${errors.length} errores`
          : `Restauración completa: ${restoredCount} registros restaurados`
      })

    } catch (error) {
      console.error('❌ Error durante la restauración:', error)
      throw error
    }

  } catch (error) {
    console.error('❌ Error restaurando backup:', error)
    
    await prisma.syncLog.create({
      data: {
        type: 'restore-database',
        status: 'error',
        productsProcessed: 0,
        errors: 1,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    return NextResponse.json({ 
      error: 'Error restaurando backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}