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

    console.log('🔧 Iniciando restauración de ajustes...')

    // Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get('settings') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Leer y parsear el archivo
    const text = await file.text()
    let backup
    try {
      backup = JSON.parse(text)
    } catch (parseError) {
      console.error('Error parseando archivo JSON:', parseError)
      return NextResponse.json({ error: 'Archivo JSON inválido' }, { status: 400 })
    }

    // Validar estructura del backup
    if (!backup.version || !backup.settings || backup.type !== 'settings') {
      return NextResponse.json({ error: 'Formato de backup de ajustes inválido' }, { status: 400 })
    }

    console.log(`📦 Backup de ajustes detectado: v${backup.version} - ${Object.keys(backup.settings).length} ajustes`)

    let restoredCount = 0
    const errors: string[] = []
    const restoredSettings: string[] = []

    // Restaurar cada configuración
    for (const [key, setting] of Object.entries(backup.settings)) {
      try {
        // Validar que el ajuste tenga la estructura correcta
        if (!setting || typeof setting !== 'object' || !(setting as any).value) {
          console.warn(`⚠️ Ajuste '${key}' no tiene estructura válida, omitiendo...`)
          continue
        }

        await prisma.configuration.upsert({
          where: { key },
          update: {
            value: (setting as any).value,
            description: (setting as any).description,
            updatedAt: new Date()
          },
          create: {
            key,
            value: (setting as any).value,
            description: (setting as any).description || `Ajuste restaurado desde backup`
          }
        })
        
        restoredCount++
        restoredSettings.push(key)
        console.log(`✅ Ajuste restaurado: ${key}`)
      } catch (err) {
        const errorMsg = `Error restaurando ajuste ${key}: ${err}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    // Si hay ajustes de sincronización restaurados, reiniciar el scheduler
    if (restoredSettings.some(key => key.startsWith('sync_'))) {
      console.log('🔄 Ajustes de sincronización detectados, el scheduler se actualizará en el próximo ciclo')
    }

    console.log(`✅ Restauración de ajustes completada: ${restoredCount} configuraciones`)

    // Registrar en logs
    await prisma.syncLog.create({
      data: {
        type: 'restore-settings',
        status: errors.length > 0 ? 'partial' : 'success',
        productsProcessed: restoredCount,
        errors: errors.length,
        metadata: {
          backupVersion: backup.version,
          backupDate: backup.timestamp,
          restoredBy: session.user.email,
          restoredSettings,
          errors: errors.length > 0 ? errors : undefined
        }
      }
    })

    // Limpiar caché si se restauró configuración de caché
    if (restoredSettings.includes('enableCache') || restoredSettings.includes('cacheTime')) {
      console.log('🧹 Limpiando caché después de restaurar configuración de caché...')
      // Aquí puedes agregar lógica para limpiar caché si es necesario
    }

    return NextResponse.json({ 
      success: true,
      restored: restoredCount,
      errors: errors.length,
      restoredSettings,
      message: errors.length > 0 
        ? `Restauración parcial: ${restoredCount} ajustes restaurados, ${errors.length} errores`
        : `Restauración completa: ${restoredCount} ajustes restaurados correctamente`
    })

  } catch (error) {
    console.error('❌ Error restaurando ajustes:', error)
    
    await prisma.syncLog.create({
      data: {
        type: 'restore-settings',
        status: 'error',
        productsProcessed: 0,
        errors: 1,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    return NextResponse.json({ 
      error: 'Error restaurando ajustes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}