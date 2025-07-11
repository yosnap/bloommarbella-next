import { PrismaClient } from '@prisma/client'
import { NieuwkoopSyncService } from '../lib/nieuwkoop/sync'

const prisma = new PrismaClient()

async function syncDemoData() {
  try {
    console.log('🌱 Iniciando sincronización de datos demo de Nieuwkoop...')
    
    // Run the sync
    const result = await NieuwkoopSyncService.syncAllProducts({
      forceUpdate: true
    })

    console.log('📊 Resultado de la sincronización:')
    console.log(`   ✅ Productos creados: ${result.created}`)
    console.log(`   🔄 Productos actualizados: ${result.updated}`)
    console.log(`   📈 Total procesados: ${result.totalProcessed}`)
    
    if (result.errors.length > 0) {
      console.log(`   ❌ Errores: ${result.errors.length}`)
      result.errors.forEach(error => console.log(`      - ${error}`))
    }

    if (result.success) {
      console.log('✅ Sincronización completada exitosamente')
    } else {
      console.log('❌ Sincronización completada con errores')
    }

    // Show some stats
    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({ where: { active: true } })
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: { _all: true }
    })

    console.log('\n📈 Estadísticas de la base de datos:')
    console.log(`   📦 Total productos: ${totalProducts}`)
    console.log(`   ✅ Productos activos: ${activeProducts}`)
    console.log('   📂 Por categorías:')
    categories.forEach(cat => {
      console.log(`      - ${cat.category}: ${cat._count._all} productos`)
    })

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
if (require.main === module) {
  syncDemoData()
    .then(() => {
      console.log('🎉 Proceso completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error)
      process.exit(1)
    })
}

export { syncDemoData }