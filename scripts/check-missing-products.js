/**
 * Script para verificar productos faltantes
 * Compara lo que hay en la API vs lo que hay en la BD
 */

const { NieuwkoopRealClient } = require('../lib/nieuwkoop/real-client')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkMissingProducts() {
  console.log('🔍 Verificando productos faltantes...')
  console.log('=' .repeat(50))
  
  const client = new NieuwkoopRealClient()
  
  try {
    // 1. Obtener productos de la API con el filtro ACTUAL (sin IsStockItem)
    console.log('1. Obteniendo productos de la API Nieuwkoop...')
    const apiResponse = await client.getProducts({
      sysmodified: '2020-01-01' // Fecha antigua para obtener todos
    })
    
    if (!apiResponse.success) {
      console.log('❌ Error obteniendo productos de la API:', apiResponse.error)
      return
    }
    
    const apiProducts = apiResponse.data
    console.log(`   📊 Productos en API: ${apiProducts.length}`)
    
    // 2. Obtener productos de la base de datos
    console.log('2. Obteniendo productos de la base de datos...')
    const dbProducts = await prisma.product.findMany({
      select: {
        nieuwkoopId: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log(`   📊 Productos en BD: ${dbProducts.length}`)
    
    // 3. Encontrar productos que están en la API pero no en la BD
    console.log('3. Comparando productos...')
    const dbProductIds = new Set(dbProducts.map(p => p.nieuwkoopId))
    
    const missingProducts = apiProducts.filter(apiProduct => 
      !dbProductIds.has(apiProduct.Itemcode)
    )
    
    console.log(`   📊 Productos faltantes: ${missingProducts.length}`)
    
    // 4. Verificar CC0061247 específicamente
    const cc0061247InAPI = apiProducts.find(p => p.Itemcode === 'CC0061247')
    const cc0061247InDB = dbProducts.find(p => p.nieuwkoopId === 'CC0061247')
    
    console.log('\\n4. Verificación específica CC0061247:')
    console.log(`   🌐 En API: ${cc0061247InAPI ? '✅ SÍ' : '❌ NO'}`)
    console.log(`   💾 En BD: ${cc0061247InDB ? '✅ SÍ' : '❌ NO'}`)
    
    if (cc0061247InAPI && !cc0061247InDB) {
      console.log('   ⚠️  CC0061247 está en la API pero NO en la BD')
      console.log(`   📝 Descripción: ${cc0061247InAPI.ItemDescription_EN || cc0061247InAPI.Description}`)
      console.log(`   📦 Grupo: ${cc0061247InAPI.ProductGroupCode} - ${cc0061247InAPI.ProductGroupDescription_EN}`)
    }
    
    // 5. Agrupar productos faltantes por ProductGroupCode
    if (missingProducts.length > 0) {
      console.log('\\n5. Productos faltantes por grupo:')
      
      const groupCounts = {}
      missingProducts.forEach(p => {
        const group = p.ProductGroupCode || 'SIN_GRUPO'
        const groupDesc = p.ProductGroupDescription_EN || p.ProductGroupDescription_NL || 'Sin descripción'
        
        if (!groupCounts[group]) {
          groupCounts[group] = {
            count: 0,
            description: groupDesc,
            samples: []
          }
        }
        
        groupCounts[group].count++
        if (groupCounts[group].samples.length < 3) {
          groupCounts[group].samples.push({
            itemCode: p.Itemcode,
            description: p.ItemDescription_EN || p.ItemDescription_NL || p.Description
          })
        }
      })
      
      Object.entries(groupCounts)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10)
        .forEach(([groupCode, info]) => {
          console.log(`   📦 ${groupCode}: ${info.description} (${info.count} productos)`)
          info.samples.forEach(sample => {
            console.log(`      - ${sample.itemCode}: ${sample.description}`)
          })
        })
    }
    
    // 6. Mostrar resumen
    console.log('\\n6. Resumen:')
    console.log(`   📊 Total productos API: ${apiProducts.length}`)
    console.log(`   💾 Total productos BD: ${dbProducts.length}`)
    console.log(`   ❌ Productos faltantes: ${missingProducts.length}`)
    console.log(`   📈 Porcentaje sincronizado: ${((dbProducts.length / apiProducts.length) * 100).toFixed(1)}%`)
    
    if (missingProducts.length > 0) {
      console.log('\\n⚠️  RECOMENDACIÓN: Ejecutar sincronización completa para obtener todos los productos')
    } else {
      console.log('\\n✅ Todos los productos están sincronizados')
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar verificación
checkMissingProducts()
  .then(() => {
    console.log('\\n🏁 Verificación completada')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })