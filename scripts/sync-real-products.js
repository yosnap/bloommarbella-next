const { hybridSync } = require('../lib/nieuwkoop/hybrid-sync')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function syncRealProducts() {
  try {
    console.log('🌱 Sincronizando productos reales de Nieuwkoop...')
    
    // Limpiar productos demo anteriores
    console.log('🧹 Limpiando productos demo...')
    await prisma.product.deleteMany({
      where: {
        nieuwkoopId: {
          startsWith: 'demo_'
        }
      }
    })
    
    // Sincronizar productos reales
    console.log('🔄 Obteniendo productos reales desde Nieuwkoop...')
    
    const result = await hybridSync.syncChanges()
    
    console.log('✅ Sincronización completada:')
    console.log(`   📦 Productos nuevos: ${result.newProducts}`)
    console.log(`   🔄 Productos actualizados: ${result.updatedProducts}`)
    console.log(`   ❌ Errores: ${result.errors}`)
    
    // Mostrar estadísticas
    const stats = await prisma.product.aggregate({
      _count: { _all: true },
      where: { active: true }
    })
    
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: { _all: true },
      where: { active: true }
    })
    
    console.log('\n📊 Estadísticas de productos:')
    console.log(`   📦 Total productos activos: ${stats._count._all}`)
    console.log('   📂 Por categorías:')
    categories.forEach(cat => {
      console.log(`      - ${cat.category}: ${cat._count._all} productos`)
    })
    
    // Mostrar algunos productos de ejemplo
    const sampleProducts = await prisma.product.findMany({
      where: { active: true },
      take: 5,
      select: {
        sku: true,
        name: true,
        category: true,
        basePrice: true
      }
    })
    
    console.log('\n🔍 Productos de ejemplo:')
    sampleProducts.forEach(product => {
      console.log(`   - ${product.sku}: ${product.name} (${product.category}) - €${product.basePrice}`)
    })
    
    console.log('\n🎉 ¡Sincronización completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncRealProducts()
    .then(() => {
      console.log('✨ Proceso completado')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Error fatal:', error)
      process.exit(1)
    })
}

module.exports = syncRealProducts