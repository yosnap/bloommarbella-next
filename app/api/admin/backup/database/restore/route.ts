import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MongoClient } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔧 Iniciando restauración de base de datos...')

    // Obtener el archivo del FormData
    const formData = await request.formData()
    console.log('📁 FormData keys:', Array.from(formData.keys()))
    const file = formData.get('database') as File
    console.log('📄 File info:', { 
      name: file?.name, 
      size: file?.size, 
      type: file?.type,
      hasFile: !!file 
    })
    
    if (!file) {
      console.log('❌ No se encontró archivo en FormData')
      console.log('📋 FormData entries:')
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${typeof value} - ${value instanceof File ? `File(${value.name})` : value}`)
      }
      return NextResponse.json({ 
        error: 'No se proporcionó archivo',
        debug: {
          formDataKeys: Array.from(formData.keys()),
          expectedKey: 'database'
        }
      }, { status: 400 })
    }

    // Leer y parsear el archivo
    const text = await file.text()
    console.log('📄 File content length:', text.length)
    console.log('📄 First 100 chars:', text.substring(0, 100))
    
    let backup
    try {
      backup = JSON.parse(text)
      console.log('✅ JSON parseado correctamente')
      console.log('📊 Backup keys:', Object.keys(backup))
    } catch (parseError) {
      console.error('❌ Error parseando archivo JSON:', parseError)
      console.log('📄 Archivo recibido (primeros 500 chars):', text.substring(0, 500))
      return NextResponse.json({ 
        error: 'Archivo JSON inválido',
        details: parseError instanceof Error ? parseError.message : 'Error de parseo desconocido'
      }, { status: 400 })
    }

    // Validar estructura del backup
    console.log('🔍 Validando estructura del backup...')
    console.log('📋 backup.version:', backup.version)
    console.log('📋 backup.collections keys:', backup.collections ? Object.keys(backup.collections) : 'undefined')
    
    if (!backup.version || !backup.collections) {
      console.log('❌ Formato de backup inválido')
      return NextResponse.json({ 
        error: 'Formato de backup inválido',
        details: {
          hasVersion: !!backup.version,
          hasCollections: !!backup.collections,
          backupKeys: Object.keys(backup)
        }
      }, { status: 400 })
    }

    console.log(`📦 Backup detectado: v${backup.version} - ${backup.metadata?.totalRecords || 0} registros`)

    let restoredCount = 0
    const errors: string[] = []

    // Conectar a MongoDB usando driver nativo
    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const db = client.db()

    try {
      // IMPORTANTE: Restaurar en orden para respetar las relaciones
      
      // 1. Limpiar datos actuales (excepto el usuario admin actual)
      console.log('🗑️ Limpiando datos actuales...')
      
      await db.collection('favorites').deleteMany({})
      await db.collection('sync_logs').deleteMany({})
      await db.collection('category_visibility').deleteMany({})
      await db.collection('translations').deleteMany({})
      await db.collection('products').deleteMany({})
      
      // Para usuarios, mantener el admin actual
      await db.collection('users').deleteMany({
        email: { $ne: session.user.email }
      })

      // 2. Restaurar usuarios primero (excepto el admin actual)
      if (backup.collections.users?.data) {
        console.log(`👥 Restaurando ${backup.collections.users.count} usuarios...`)
        for (const user of backup.collections.users.data) {
          // No restaurar el usuario admin actual para evitar conflictos
          if (user.email === session.user.email) {
            console.log(`⏭️ Omitiendo usuario admin actual: ${user.email}`)
            continue
          }
          
          try {
            // Convertir fechas string a Date objects
            const userData = {
              ...user,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
              emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
              lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
              associateRequestDate: user.associateRequestDate ? new Date(user.associateRequestDate) : null,
              associateApprovalDate: user.associateApprovalDate ? new Date(user.associateApprovalDate) : null,
            }
            
            await db.collection('users').insertOne(userData)
            restoredCount++
          } catch (err) {
            const errorMsg = `Error restaurando usuario ${user.email}: ${err}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }
        }
      }

      // 3. Restaurar productos
      if (backup.collections.products?.data) {
        console.log(`📦 Restaurando ${backup.collections.products.count} productos...`)
        for (const product of backup.collections.products.data) {
          try {
            const productData = {
              ...product,
              createdAt: new Date(product.createdAt),
              updatedAt: new Date(product.updatedAt),
              lastStockCheck: product.lastStockCheck ? new Date(product.lastStockCheck) : null,
            }
            
            await db.collection('products').insertOne(productData)
            restoredCount++
          } catch (err) {
            const errorMsg = `Error restaurando producto ${product.sku}: ${err}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }
        }
      }

      // 4. Restaurar configuraciones
      if (backup.collections.configurations?.data) {
        console.log(`⚙️ Restaurando ${backup.collections.configurations.count} configuraciones...`)
        for (const config of backup.collections.configurations.data) {
          try {
            const configData = {
              ...config,
              createdAt: config.createdAt ? new Date(config.createdAt) : new Date(),
              updatedAt: new Date(config.updatedAt),
            }
            
            await db.collection('configurations').insertOne(configData)
            restoredCount++
          } catch (err) {
            const errorMsg = `Error restaurando configuración ${config.key}: ${err}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }
        }
      }

      // 5. Restaurar traducciones
      if (backup.collections.translations?.data) {
        console.log(`🌍 Restaurando ${backup.collections.translations.count} traducciones...`)
        for (const translation of backup.collections.translations.data) {
          try {
            const translationData = {
              ...translation,
              createdAt: new Date(translation.createdAt),
              updatedAt: new Date(translation.updatedAt),
            }
            
            await db.collection('translations').insertOne(translationData)
            restoredCount++
          } catch (err) {
            const errorMsg = `Error restaurando traducción: ${err}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }
        }
      }

      // 6. Restaurar visibilidad de categorías
      if (backup.collections.categoryVisibility?.data) {
        console.log(`📂 Restaurando ${backup.collections.categoryVisibility.count} categorías...`)
        for (const category of backup.collections.categoryVisibility.data) {
          try {
            const categoryData = {
              ...category,
              createdAt: new Date(category.createdAt),
              updatedAt: new Date(category.updatedAt),
            }
            
            await db.collection('category_visibility').insertOne(categoryData)
            restoredCount++
          } catch (err) {
            const errorMsg = `Error restaurando categoría ${category.englishName}: ${err}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }
        }
      }

      // 7. Restaurar favoritos
      if (backup.collections.favorites?.data) {
        console.log(`❤️ Restaurando ${backup.collections.favorites.count} favoritos...`)
        for (const favorite of backup.collections.favorites.data) {
          try {
            const favoriteData = {
              ...favorite,
              createdAt: new Date(favorite.createdAt),
            }
            
            await db.collection('favorites').insertOne(favoriteData)
            restoredCount++
          } catch (err) {
            // Los favoritos no son críticos, solo registrar
            console.warn(`Error restaurando favorito: ${err}`)
          }
        }
      }

      // 8. Restaurar logs de sincronización (opcional, solo los más recientes)
      if (backup.collections.syncLogs?.data) {
        console.log(`📋 Restaurando ${backup.collections.syncLogs.count} logs...`)
        const recentLogs = backup.collections.syncLogs.data.slice(0, 100) // Solo los últimos 100
        for (const log of recentLogs) {
          try {
            const logData = {
              ...log,
              createdAt: new Date(log.createdAt),
              updatedAt: log.updatedAt ? new Date(log.updatedAt) : new Date(),
            }
            
            await db.collection('sync_logs').insertOne(logData)
            restoredCount++
          } catch (err) {
            // Los logs no son críticos, solo registrar
            console.warn(`Error restaurando log: ${err}`)
          }
        }
      }

      console.log(`✅ Restauración completada: ${restoredCount} registros`)

      // Registrar en logs usando MongoDB nativo
      await db.collection('sync_logs').insertOne({
        type: 'restore-database',
        status: errors.length > 0 ? 'partial' : 'success',
        productsProcessed: restoredCount,
        errors: errors.length,
        metadata: {
          backupVersion: backup.version,
          backupDate: backup.timestamp,
          restoredBy: session.user.email,
          totalRecords: backup.metadata?.totalRecords || restoredCount,
          errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Solo los primeros 10 errores
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })

    } finally {
      await client.close()
    }

    return NextResponse.json({ 
      success: true,
      restored: restoredCount,
      errors: errors.length,
      message: errors.length > 0 
        ? `Restauración parcial: ${restoredCount} registros restaurados, ${errors.length} errores`
        : `Restauración completa: ${restoredCount} registros restaurados correctamente`
    })

  } catch (error) {
    console.error('❌ Error durante la restauración:', error)
    
    // Registrar error usando MongoDB nativo
    try {
      const logClient = new MongoClient(process.env.DATABASE_URL!)
      await logClient.connect()
      const logDb = logClient.db()
      
      await logDb.collection('sync_logs').insertOne({
        type: 'restore-database',
        status: 'error',
        productsProcessed: 0,
        errors: 1,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      await logClient.close()
    } catch (logError) {
      console.error('Error logging restore failure:', logError)
    }

    return NextResponse.json({ 
      error: 'Error restaurando backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}