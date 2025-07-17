const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function createAutomaticBackup() {
  try {
    console.log('🔧 Iniciando backup automático...')
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
    const backupDir = path.join(process.cwd(), 'backups')
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Obtener todos los datos
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
          // No incluir password por seguridad
        }
      }),
      prisma.configuration.findMany(),
      prisma.translation.findMany(),
      prisma.categoryVisibility.findMany(),
      prisma.syncLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100 // Solo los últimos 100 logs
      }),
      prisma.favorite.findMany()
    ])

    // Crear backup completo
    const fullBackup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      type: 'automated',
      collections: {
        products: { count: products.length, data: products },
        users: { count: users.length, data: users },
        configurations: { count: configurations.length, data: configurations },
        translations: { count: translations.length, data: translations },
        categoryVisibility: { count: categoryVisibility.length, data: categoryVisibility },
        syncLogs: { count: syncLogs.length, data: syncLogs },
        favorites: { count: favorites.length, data: favorites }
      },
      metadata: {
        createdBy: 'system',
        totalRecords: products.length + users.length + configurations.length + 
                     translations.length + categoryVisibility.length + 
                     syncLogs.length + favorites.length,
        automated: true
      }
    }

    // Crear backup de ajustes
    const settingsKeys = [
      'priceMultiplier', 'associateDiscount', 'defaultDeliveryTime',
      'minStockAlert', 'maxStockAlert', 'enableCache', 'cacheTime',
      'newBadgeDays', 'whatsappEnabled', 'whatsappNumber', 'whatsappContactName',
      'sync_schedule', 'sync_batch_settings', 'sync_settings'
    ]

    const settingsBackup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      type: 'settings',
      settings: configurations
        .filter(c => settingsKeys.includes(c.key))
        .reduce((acc, config) => {
          acc[config.key] = {
            value: config.value,
            description: config.description,
            updatedAt: config.updatedAt
          }
          return acc
        }, {}),
      metadata: {
        createdBy: 'system',
        totalSettings: configurations.filter(c => settingsKeys.includes(c.key)).length,
        automated: true
      }
    }

    // Guardar archivos
    const fullBackupPath = path.join(backupDir, `full_backup_${timestamp}.json`)
    const settingsBackupPath = path.join(backupDir, `settings_backup_${timestamp}.json`)

    fs.writeFileSync(fullBackupPath, JSON.stringify(fullBackup, null, 2))
    fs.writeFileSync(settingsBackupPath, JSON.stringify(settingsBackup, null, 2))

    // Limpiar backups antiguos (mantener últimos 7 días)
    const files = fs.readdirSync(backupDir)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    files.forEach(file => {
      const filePath = path.join(backupDir, file)
      const stats = fs.statSync(filePath)
      if (stats.mtime < sevenDaysAgo) {
        fs.unlinkSync(filePath)
        console.log(`🗑️ Eliminado backup antiguo: ${file}`)
      }
    })

    // Registrar en logs
    await prisma.syncLog.create({
      data: {
        type: 'backup-automated',
        status: 'success',
        productsProcessed: fullBackup.metadata.totalRecords,
        errors: 0,
        metadata: {
          fullBackupSize: `${(fs.statSync(fullBackupPath).size / 1024 / 1024).toFixed(2)} MB`,
          settingsBackupSize: `${(fs.statSync(settingsBackupPath).size / 1024).toFixed(2)} KB`,
          backupPath: backupDir,
          automated: true
        }
      }
    })

    console.log(`✅ Backup automático completado:`)
    console.log(`   - Backup completo: ${fullBackupPath}`)
    console.log(`   - Backup ajustes: ${settingsBackupPath}`)
    console.log(`   - Total registros: ${fullBackup.metadata.totalRecords}`)

  } catch (error) {
    console.error('❌ Error en backup automático:', error)
    
    await prisma.syncLog.create({
      data: {
        type: 'backup-automated',
        status: 'error',
        productsProcessed: 0,
        errors: 1,
        metadata: {
          error: error.message,
          automated: true
        }
      }
    })
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAutomaticBackup()
    .then(() => {
      console.log('✨ Backup automático completado con éxito')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Error en backup automático:', error)
      process.exit(1)
    })
}

module.exports = { createAutomaticBackup }