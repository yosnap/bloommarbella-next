/**
 * Script para sincronización completa de productos
 * Esto garantiza que obtenemos todos los productos que se habían perdido
 */

const { HybridSync } = require('../lib/nieuwkoop/hybrid-sync')
const { prisma } = require('../lib/prisma')

async function fullSync() {
  console.log('🔄 Iniciando sincronización completa...')
  console.log('Esta operación puede tardar varios minutos')
  console.log('=' .repeat(60))
  
  const hybridSync = new HybridSync()
  
  try {
    // Estado inicial
    const initialCount = await prisma.product.count()
    console.log(`📊 Productos actuales en BD: ${initialCount}`)
    
    // Verificar si CC0061247 existe antes de la sincronización
    const cc0061247Before = await prisma.product.findFirst({
      where: {
        OR: [
          { nieuwkoopId: 'CC0061247' },
          { sku: 'CC0061247' }
        ]
      }
    })
    
    console.log(`🔍 CC0061247 existe antes: ${cc0061247Before ? '✅ SÍ' : '❌ NO'}`)
    
    console.log('\\n🚀 Iniciando sincronización completa desde 2020-01-01...')
    
    // Forzar sincronización completa
    const historicDate = new Date('2020-01-01')
    const startTime = Date.now()
    
    const result = await hybridSync.syncChanges(historicDate)
    
    const endTime = Date.now()
    const duration = Math.round((endTime - startTime) / 1000)
    
    // Estado final
    const finalCount = await prisma.product.count()
    const newProductsCount = finalCount - initialCount
    
    console.log('\\n✅ Sincronización completa finalizada')
    console.log('=' .repeat(60))
    console.log(`⏱️  Duración: ${duration}s`)
    console.log(`📊 Productos antes: ${initialCount}`)
    console.log(`📊 Productos después: ${finalCount}`)
    console.log(`📈 Productos nuevos: ${newProductsCount}`)
    console.log(`🔄 Productos actualizados: ${result.updatedProducts}`)
    console.log(`❌ Errores: ${result.errors}`)
    
    // Verificar si CC0061247 existe después de la sincronización
    const cc0061247After = await prisma.product.findFirst({
      where: {
        OR: [
          { nieuwkoopId: 'CC0061247' },
          { sku: 'CC0061247' }
        ]
      },
      select: {
        id: true,
        nieuwkoopId: true,
        name: true,
        category: true,
        subcategory: true,
        active: true,
        createdAt: true
      }
    })
    
    console.log(`\\n🔍 CC0061247 existe después: ${cc0061247After ? '✅ SÍ' : '❌ NO'}`)
    
    if (cc0061247After) {
      console.log('📝 Datos de CC0061247:')
      console.log(`   - ID: ${cc0061247After.id}`)
      console.log(`   - Nombre: ${cc0061247After.name}`)
      console.log(`   - Categoría: ${cc0061247After.category}`)
      console.log(`   - Subcategoría: ${cc0061247After.subcategory}`)
      console.log(`   - Activo: ${cc0061247After.active}`)
      console.log(`   - Creado: ${cc0061247After.createdAt}`)
    }
    
    // Verificar productos del grupo 275
    const group275Count = await prisma.product.count({
      where: {
        specifications: {
          path: ['productGroupCode'],
          equals: '275'
        }
      }
    })
    
    console.log(`\\n📦 Productos del grupo 275 (All-in-1 concepts): ${group275Count}`)
    
    if (group275Count > 0) {
      const group275Sample = await prisma.product.findMany({
        where: {
          specifications: {
            path: ['productGroupCode'],
            equals: '275'
          }
        },
        select: {
          nieuwkoopId: true,
          name: true
        },
        take: 5
      })
      
      console.log('📋 Muestra de productos del grupo 275:')
      group275Sample.forEach(p => {
        console.log(`   - ${p.nieuwkoopId}: ${p.name}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar sincronización
fullSync()
  .then(() => {
    console.log('\\n🏁 Sincronización completada exitosamente')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })