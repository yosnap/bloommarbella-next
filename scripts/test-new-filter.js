/**
 * Script para probar el impacto del nuevo filtro (sin IsStockItem)
 */

const { NieuwkoopRealClient } = require('../lib/nieuwkoop/real-client')

async function testNewFilter() {
  console.log('🔍 Probando impacto del nuevo filtro...')
  console.log('=' .repeat(50))
  
  const client = new NieuwkoopRealClient()
  
  try {
    console.log('1. Obteniendo productos con filtro anterior (ShowOnWebsite + ItemStatus=A + IsStockItem)...')
    const oldFilterResponse = await client.getProducts({ limit: 1000 })
    
    if (!oldFilterResponse.success) {
      console.log('❌ Error:', oldFilterResponse.error)
      return
    }
    
    // Simular filtro anterior
    const oldFilterProducts = oldFilterResponse.data.filter(p => 
      p.ShowOnWebsite && p.ItemStatus === 'A' && p.IsStockItem
    )
    
    // Simular filtro nuevo
    const newFilterProducts = oldFilterResponse.data.filter(p => 
      p.ShowOnWebsite && p.ItemStatus === 'A'
    )
    
    console.log('2. Resultados del filtro:')
    console.log(`   📊 Filtro anterior: ${oldFilterProducts.length} productos`)
    console.log(`   📊 Filtro nuevo: ${newFilterProducts.length} productos`)
    console.log(`   📈 Productos adicionales: ${newFilterProducts.length - oldFilterProducts.length}`)
    
    // Analizar productos que ahora se incluirán
    const additionalProducts = newFilterProducts.filter(newP => 
      !oldFilterProducts.some(oldP => oldP.Itemcode === newP.Itemcode)
    )
    
    console.log('\\n3. Productos adicionales que ahora se importarán:')
    console.log(`   Total: ${additionalProducts.length}`)
    
    // Agrupar por ProductGroupCode
    const groupCounts = {}
    additionalProducts.forEach(p => {
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
    
    console.log('\\n4. Nuevos productos por ProductGroupCode:')
    Object.entries(groupCounts)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .forEach(([groupCode, info]) => {
        console.log(`   📦 ${groupCode}: ${info.description} (${info.count} productos)`)
        info.samples.forEach(sample => {
          console.log(`      - ${sample.itemCode}: ${sample.description}`)
        })
      })
    
    // Verificar CC0061247 específicamente
    const cc0061247 = additionalProducts.find(p => p.Itemcode === 'CC0061247')
    if (cc0061247) {
      console.log('\\n5. ✅ CC0061247 encontrado en productos adicionales:')
      console.log(`   📝 ${cc0061247.Itemcode}: ${cc0061247.ItemDescription_EN || cc0061247.Description}`)
      console.log(`   💰 Precio: €${cc0061247.SellingPriceExVAT}`)
      console.log(`   📦 Grupo: ${cc0061247.ProductGroupCode} - ${cc0061247.ProductGroupDescription_EN}`)
    } else {
      console.log('\\n5. ❌ CC0061247 no encontrado en productos adicionales')
    }
    
  } catch (error) {
    console.error('❌ Error durante el test:', error)
  }
}

// Ejecutar test
testNewFilter()
  .then(() => {
    console.log('\\n🏁 Test completado')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })