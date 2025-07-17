const { PrismaClient } = require('@prisma/client')
const cron = require('node-cron')

const prisma = new PrismaClient()

class SmartScheduler {
  constructor() {
    this.jobs = new Map()
    this.isRunning = false
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Smart Scheduler ya está ejecutándose')
      return
    }

    this.isRunning = true
    console.log('🚀 Iniciando Smart Scheduler...')

    try {
      // Cargar configuración inicial
      await this.loadScheduleConfig()
      
      // Verificar configuración cada minuto
      cron.schedule('* * * * *', async () => {
        await this.checkConfigUpdates()
      })

      console.log('✅ Smart Scheduler iniciado exitosamente')
    } catch (error) {
      console.error('❌ Error iniciando Smart Scheduler:', error)
      this.isRunning = false
    }
  }

  async loadScheduleConfig() {
    try {
      const config = await prisma.configuration.findUnique({
        where: { key: 'sync_schedule' }
      })

      if (!config) {
        console.log('⚠️  No se encontró configuración de sincronización')
        return
      }

      const scheduleConfig = config.value

      // Limpiar jobs existentes
      this.clearAllJobs()

      // Crear nuevo job si está habilitado
      if (scheduleConfig.enabled) {
        await this.createScheduledJob(scheduleConfig)
      }

    } catch (error) {
      console.error('❌ Error cargando configuración:', error)
    }
  }

  async createScheduledJob(config) {
    let cronExpression = this.getCronExpression(config)
    
    if (!cronExpression) {
      console.log('⚠️  No se pudo generar expresión cron válida')
      return
    }

    console.log(`📅 Programando job con expresión: ${cronExpression}`)

    // Validar expresión cron
    if (!cron.validate(cronExpression)) {
      console.error('❌ Expresión cron no válida:', cronExpression)
      return
    }

    // Crear y iniciar job
    const job = cron.schedule(cronExpression, async () => {
      console.log('🔄 Ejecutando sincronización programada...')
      await this.executeScheduledSync()
    }, {
      scheduled: true,
      timezone: 'Europe/Madrid'
    })

    this.jobs.set('sync', job)
    console.log(`✅ Job programado: ${this.getIntervalDescription(config)}`)
  }

  getCronExpression(config) {
    const { interval, time, dayOfWeek, dayOfMonth, customCron } = config

    switch (interval) {
      case 'hourly':
        return '0 * * * *' // Cada hora en el minuto 0

      case 'daily':
        if (time) {
          const [hours, minutes] = time.split(':')
          return `${minutes} ${hours} * * *` // Diario a la hora especificada
        }
        return '0 2 * * *' // Por defecto a las 2:00 AM

      case 'weekly':
        if (time && dayOfWeek) {
          const [hours, minutes] = time.split(':')
          return `${minutes} ${hours} * * ${dayOfWeek}` // Semanal en día y hora específica
        }
        return '0 2 * * 1' // Por defecto lunes a las 2:00 AM

      case 'monthly':
        if (time && dayOfMonth) {
          const [hours, minutes] = time.split(':')
          return `${minutes} ${hours} ${dayOfMonth} * *` // Mensual en día y hora específica
        }
        return '0 2 1 * *' // Por defecto el día 1 a las 2:00 AM

      case 'custom':
        return customCron || null

      default:
        return null
    }
  }

  getIntervalDescription(config) {
    const { interval, time, dayOfWeek, dayOfMonth, customCron } = config

    switch (interval) {
      case 'hourly':
        return 'Cada hora'

      case 'daily':
        return `Diario a las ${time || '02:00'}`

      case 'weekly':
        const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        return `Semanal los ${days[dayOfWeek] || 'Lunes'} a las ${time || '02:00'}`

      case 'monthly':
        return `Mensual el día ${dayOfMonth || 1} a las ${time || '02:00'}`

      case 'custom':
        return `Personalizado: ${customCron}`

      default:
        return 'Configuración no válida'
    }
  }

  async executeScheduledSync() {
    try {
      // Verificar si ya hay una sincronización en progreso
      const ongoingSync = await prisma.syncLog.findFirst({
        where: {
          type: { startsWith: 'sync-' },
          status: 'in_progress'
        },
        orderBy: { createdAt: 'desc' }
      })

      if (ongoingSync) {
        console.log('⚠️  Ya hay una sincronización en progreso, saltando ejecución')
        return
      }

      // Crear log de inicio
      const syncLog = await prisma.syncLog.create({
        data: {
          type: 'sync-scheduled',
          status: 'in_progress',
          productsProcessed: 0,
          errors: 0,
          metadata: {
            startedBy: 'scheduler',
            startedAt: new Date().toISOString()
          }
        }
      })

      // Obtener configuraciones
      const [batchConfig, lastSyncConfig] = await Promise.all([
        prisma.configuration.findUnique({ where: { key: 'sync_batch_settings' } }),
        prisma.configuration.findUnique({ where: { key: 'last_sync_date' } })
      ])

      // Determinar fecha de última sincronización
      const lastSyncDate = lastSyncConfig?.value?.timestamp 
        ? new Date(lastSyncConfig.value.timestamp)
        : new Date(Date.now() - 24 * 60 * 60 * 1000)

      console.log(`📅 Sincronizando desde: ${lastSyncDate.toISOString()}`)

      // Importar HybridSync dinámicamente
      const { hybridSync } = require('../lib/nieuwkoop/hybrid-sync')

      // Ejecutar sincronización
      const result = await hybridSync.syncChanges(lastSyncDate, batchConfig?.value)

      // Actualizar log con resultado
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: result.errors > 0 ? 'partial' : 'success',
          productsProcessed: result.newProducts + result.updatedProducts,
          errors: result.errors,
          metadata: {
            ...result,
            completedAt: new Date().toISOString(),
            lastSyncDate: lastSyncDate.toISOString()
          }
        }
      })

      // Actualizar última sincronización exitosa
      if (result.errors === 0) {
        await prisma.configuration.upsert({
          where: { key: 'last_sync_date' },
          update: {
            value: {
              timestamp: new Date().toISOString(),
              status: 'success'
            },
            updatedAt: new Date()
          },
          create: {
            key: 'last_sync_date',
            value: {
              timestamp: new Date().toISOString(),
              status: 'success'
            },
            description: 'Última sincronización exitosa de productos'
          }
        })
      }

      console.log(`✅ Sincronización programada completada: ${result.newProducts} nuevos, ${result.updatedProducts} actualizados, ${result.errors} errores`)

    } catch (error) {
      console.error('❌ Error en sincronización programada:', error)
      
      // Actualizar log con error
      await prisma.syncLog.create({
        data: {
          type: 'sync-error',
          status: 'error',
          productsProcessed: 0,
          errors: 1,
          metadata: {
            error: error.message,
            source: 'scheduled-sync',
            completedAt: new Date().toISOString()
          }
        }
      }).catch(console.error)
    }
  }

  async checkConfigUpdates() {
    try {
      const config = await prisma.configuration.findUnique({
        where: { key: 'sync_schedule' }
      })

      if (!config) return

      const scheduleConfig = config.value

      // Verificar si la configuración ha cambiado
      const currentJob = this.jobs.get('sync')
      const needsUpdate = !currentJob || 
        (scheduleConfig.enabled && !currentJob) ||
        (!scheduleConfig.enabled && currentJob)

      if (needsUpdate) {
        console.log('🔄 Detectado cambio en configuración, actualizando scheduler...')
        await this.loadScheduleConfig()
      }

    } catch (error) {
      console.error('❌ Error verificando actualizaciones de configuración:', error)
    }
  }

  clearAllJobs() {
    this.jobs.forEach((job, key) => {
      job.stop()
      job.destroy()
      console.log(`🗑️  Job ${key} eliminado`)
    })
    this.jobs.clear()
  }

  async stop() {
    console.log('🛑 Deteniendo Smart Scheduler...')
    this.clearAllJobs()
    this.isRunning = false
    await prisma.$disconnect()
    process.exit(0)
  }

  async getStatus() {
    try {
      const config = await prisma.configuration.findUnique({
        where: { key: 'sync_schedule' }
      })

      const recentLogs = await prisma.syncLog.findMany({
        where: {
          type: { startsWith: 'sync-' }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      return {
        isRunning: this.isRunning,
        activeJobs: Array.from(this.jobs.keys()),
        config: config?.value || null,
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

const scheduler = new SmartScheduler()

// Manejar señales del sistema
process.on('SIGINT', () => {
  console.log('\n🔄 Recibida señal SIGINT, cerrando scheduler...')
  scheduler.stop()
})

process.on('SIGTERM', () => {
  console.log('\n🔄 Recibida señal SIGTERM, cerrando scheduler...')
  scheduler.stop()
})

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'start':
    scheduler.start()
    break
  
  case 'status':
    scheduler.getStatus().then(status => {
      console.log('\n📊 Estado del Smart Scheduler:')
      console.log(JSON.stringify(status, null, 2))
      process.exit(0)
    })
    break
  
  default:
    console.log(`
🔧 Uso: node smart-scheduler.js <comando>

Comandos disponibles:
  start   - Iniciar el scheduler inteligente
  status  - Mostrar estado del scheduler

Ejemplos:
  node smart-scheduler.js start
  node smart-scheduler.js status
`)
    process.exit(1)
}

module.exports = scheduler