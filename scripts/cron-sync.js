const { PrismaClient } = require('@prisma/client')
const { hybridSync } = require('../lib/nieuwkoop/hybrid-sync')

const prisma = new PrismaClient()

class CronSync {
  constructor() {
    this.isRunning = false
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Cron sync ya está ejecutándose')
      return
    }

    this.isRunning = true
    console.log('🚀 Iniciando Cron Sync híbrido...')

    try {
      // Programar tareas
      this.scheduleJobs()
      
      // Ejecutar sincronización inicial
      await this.syncChanges()
      
      console.log('✅ Cron Sync iniciado exitosamente')
    } catch (error) {
      console.error('❌ Error iniciando Cron Sync:', error)
      this.isRunning = false
    }
  }

  scheduleJobs() {
    // Cada 30 minutos: Sincronizar cambios
    setInterval(() => {
      this.syncChanges()
    }, 30 * 60 * 1000)

    // Cada 6 horas: Limpieza de cache
    setInterval(() => {
      this.cleanupCache()
    }, 6 * 60 * 60 * 1000)

    // Cada 24 horas: Sincronización completa
    setInterval(() => {
      this.fullSync()
    }, 24 * 60 * 60 * 1000)

    console.log('📅 Jobs programados:')
    console.log('   - Cambios: cada 30 minutos')
    console.log('   - Limpieza: cada 6 horas')
    console.log('   - Sync completo: cada 24 horas')
  }

  async syncChanges() {
    try {
      console.log('🔄 Sincronizando cambios...')
      
      // Obtener última sincronización
      const lastSync = await prisma.configuration.findUnique({
        where: { key: 'last_sync_date' }
      })

      const lastSyncDate = lastSync?.value?.timestamp 
        ? new Date(lastSync.value.timestamp)
        : new Date(Date.now() - 24 * 60 * 60 * 1000)

      // Ejecutar sincronización
      const result = await hybridSync.syncChanges(lastSyncDate)

      // Registrar resultado
      await prisma.syncLog.create({
        data: {
          type: 'cron-changes',
          status: result.errors > 0 ? 'partial' : 'success',
          productsProcessed: result.newProducts + result.updatedProducts,
          errors: result.errors,
          createdAt: new Date(),
          metadata: {
            newProducts: result.newProducts,
            updatedProducts: result.updatedProducts,
            totalErrors: result.errors
          }
        }
      })

      console.log(`✅ Cambios sincronizados: ${result.newProducts} nuevos, ${result.updatedProducts} actualizados`)
    } catch (error) {
      console.error('❌ Error sincronizando cambios:', error)
      
      await prisma.syncLog.create({
        data: {
          type: 'cron-error',
          status: 'error',
          productsProcessed: 0,
          errors: 1,
          createdAt: new Date(),
          metadata: {
            error: error.message,
            source: 'syncChanges'
          }
        }
      }).catch(console.error)
    }
  }

  async fullSync() {
    try {
      console.log('🔄 Sincronización completa...')
      
      const result = await hybridSync.syncChanges() // Sin fecha límite
      
      await prisma.syncLog.create({
        data: {
          type: 'cron-full',
          status: result.errors > 0 ? 'partial' : 'success',
          productsProcessed: result.newProducts + result.updatedProducts,
          errors: result.errors,
          createdAt: new Date(),
          metadata: {
            newProducts: result.newProducts,
            updatedProducts: result.updatedProducts,
            totalErrors: result.errors,
            fullSync: true
          }
        }
      })

      console.log(`✅ Sincronización completa: ${result.newProducts} nuevos, ${result.updatedProducts} actualizados`)
    } catch (error) {
      console.error('❌ Error en sincronización completa:', error)
      
      await prisma.syncLog.create({
        data: {
          type: 'cron-error',
          status: 'error',
          productsProcessed: 0,
          errors: 1,
          createdAt: new Date(),
          metadata: {
            error: error.message,
            source: 'fullSync'
          }
        }
      }).catch(console.error)
    }
  }

  async cleanupCache() {
    try {
      console.log('🧹 Limpiando cache...')
      
      // Limpiar cache de híbrido
      hybridSync.cleanExpiredCache()
      
      // Limpiar logs antiguos (más de 30 días)
      const deleted = await prisma.syncLog.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })

      console.log(`✅ Cache limpiado, ${deleted.count} logs antiguos eliminados`)
    } catch (error) {
      console.error('❌ Error limpiando cache:', error)
    }
  }

  async stop() {
    console.log('🛑 Deteniendo Cron Sync...')
    this.isRunning = false
    await prisma.$disconnect()
    process.exit(0)
  }

  async getStatus() {
    try {
      const lastSync = await prisma.configuration.findUnique({
        where: { key: 'last_sync_date' }
      })

      const recentLogs = await prisma.syncLog.findMany({
        where: {
          type: { startsWith: 'cron-' }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      const totalProducts = await prisma.product.count({
        where: { active: true }
      })

      return {
        isRunning: this.isRunning,
        lastSync: lastSync?.value?.timestamp || null,
        totalProducts,
        recentLogs: recentLogs.map(log => ({
          type: log.type,
          status: log.status,
          processed: log.productsProcessed,
          errors: log.errors,
          date: log.createdAt
        }))
      }
    } catch (error) {
      console.error('Error obteniendo estado:', error)
      return { error: error.message }
    }
  }
}

const cronSync = new CronSync()

// Manejar señales del sistema
process.on('SIGINT', () => {
  console.log('\n🔄 Recibida señal SIGINT, cerrando...')
  cronSync.stop()
})

process.on('SIGTERM', () => {
  console.log('\n🔄 Recibida señal SIGTERM, cerrando...')
  cronSync.stop()
})

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'start':
    cronSync.start()
    break
  
  case 'sync':
    cronSync.syncChanges().then(() => {
      console.log('✅ Sincronización manual completada')
      process.exit(0)
    })
    break
  
  case 'full':
    cronSync.fullSync().then(() => {
      console.log('✅ Sincronización completa manual completada')
      process.exit(0)
    })
    break
  
  case 'status':
    cronSync.getStatus().then(status => {
      console.log('\n📊 Estado del Cron Sync:')
      console.log(JSON.stringify(status, null, 2))
      process.exit(0)
    })
    break
  
  default:
    console.log(`
🔧 Uso: node cron-sync.js <comando>

Comandos disponibles:
  start   - Iniciar el servicio de sincronización automática
  sync    - Ejecutar sincronización de cambios manualmente
  full    - Ejecutar sincronización completa manualmente
  status  - Mostrar estado del sistema

Ejemplos:
  node cron-sync.js start
  node cron-sync.js sync
  node cron-sync.js status
`)
    process.exit(1)
}

module.exports = cronSync