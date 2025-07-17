const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initSyncConfig() {
  try {
    console.log('🔧 Inicializando configuraciones de sincronización...')

    // Configuración del scheduler
    await prisma.configuration.upsert({
      where: { key: 'sync_schedule' },
      update: {
        value: {
          enabled: true,
          interval: 'daily', // hourly, daily, weekly, monthly, custom
          time: '02:00', // Para daily/weekly (formato HH:MM)
          dayOfWeek: 1, // Para weekly (1=Monday, 7=Sunday)
          dayOfMonth: 1, // Para monthly
          customCron: null // Para custom: "0 */6 * * *" (cada 6 horas)
        },
        description: 'Configuración de horarios de sincronización automática'
      },
      create: {
        key: 'sync_schedule',
        value: {
          enabled: true,
          interval: 'daily',
          time: '02:00',
          dayOfWeek: 1,
          dayOfMonth: 1,
          customCron: null
        },
        description: 'Configuración de horarios de sincronización automática'
      }
    })

    // Configuración de lotes
    await prisma.configuration.upsert({
      where: { key: 'sync_batch_settings' },
      update: {
        value: {
          batchSize: 500,
          pauseBetweenBatches: 2000, // ms
          maxConcurrentRequests: 5,
          enableProgressLogging: true
        },
        description: 'Configuración de lotes para importación de productos'
      },
      create: {
        key: 'sync_batch_settings',
        value: {
          batchSize: 500,
          pauseBetweenBatches: 2000,
          maxConcurrentRequests: 5,
          enableProgressLogging: true
        },
        description: 'Configuración de lotes para importación de productos'
      }
    })

    // Configuración general de sincronización
    await prisma.configuration.upsert({
      where: { key: 'sync_settings' },
      update: {
        value: {
          autoSync: true,
          notifyOnErrors: true,
          keepLogsDays: 30,
          enableRealTimeStock: true,
          fallbackToLocalData: true
        },
        description: 'Configuración general del sistema de sincronización'
      },
      create: {
        key: 'sync_settings',
        value: {
          autoSync: true,
          notifyOnErrors: true,
          keepLogsDays: 30,
          enableRealTimeStock: true,
          fallbackToLocalData: true
        },
        description: 'Configuración general del sistema de sincronización'
      }
    })

    // Inicializar última sincronización si no existe
    const lastSync = await prisma.configuration.findUnique({
      where: { key: 'last_sync_date' }
    })

    if (!lastSync) {
      await prisma.configuration.create({
        key: 'last_sync_date',
        value: { 
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        },
        description: 'Última sincronización exitosa de productos'
      })
    }

    console.log('✅ Configuraciones inicializadas correctamente')
    console.log('📋 Configuraciones creadas:')
    console.log('   - sync_schedule: Horarios de sincronización')
    console.log('   - sync_batch_settings: Configuración de lotes')
    console.log('   - sync_settings: Configuración general')
    console.log('   - last_sync_date: Última sincronización')

  } catch (error) {
    console.error('❌ Error inicializando configuraciones:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initSyncConfig()
    .then(() => {
      console.log('✨ Inicialización completada')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Error en inicialización:', error)
      process.exit(1)
    })
}

module.exports = { initSyncConfig }