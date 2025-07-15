/**
 * Script para diagnosticar productos faltantes en la migración
 * Uso: node scripts/debug-missing-products.js CC0061247
 */

const { NieuwkoopRealClient } = require('../lib/nieuwkoop/real-client')

async function debugMissingProduct(itemCode) {
  console.log(`🔍 Investigando producto: ${itemCode}`)
  console.log('=' .repeat(50))
  
  const client = new NieuwkoopRealClient()
  
  try {
    // Buscar el producto específico
    console.log('1. Buscando producto en API Nieuwkoop...')
    const response = await client.getProducts({ itemCode })
    
    if (!response.success) {
      console.log('❌ Error en la API:', response.error)
      return
    }
    
    if (response.data.length === 0) {
      console.log('❌ Producto no encontrado en API Nieuwkoop')
      return
    }
    
    const product = response.data[0]
    console.log('✅ Producto encontrado en API')
    
    // Verificar criterios de filtrado
    console.log('\n2. Verificando criterios de filtrado:')
    console.log('   ShowOnWebsite:', product.ShowOnWebsite ? '✅' : '❌')
    console.log('   ItemStatus:', product.ItemStatus, product.ItemStatus === 'A' ? '✅' : '❌')
    console.log('   IsStockItem:', product.IsStockItem ? '✅' : '❌')
    
    const passesFilter = product.ShowOnWebsite && 
                        product.ItemStatus === 'A' && 
                        product.IsStockItem
    
    console.log('\n3. Resultado del filtro:')
    console.log('   Pasa filtro:', passesFilter ? '✅' : '❌')
    
    if (!passesFilter) {
      console.log('\n❌ MOTIVO DE EXCLUSIÓN:')
      if (!product.ShowOnWebsite) console.log('   - ShowOnWebsite es false')
      if (product.ItemStatus !== 'A') console.log('   - ItemStatus no es "A" (es "' + product.ItemStatus + '")')
      if (!product.IsStockItem) console.log('   - IsStockItem es false')
    }
    
    // Mostrar información del producto
    console.log('\n4. Información del producto:')
    console.log('   Código:', product.Itemcode)
    console.log('   Nombre:', product.ItemDescription_EN || product.ItemDescription_NL)
    console.log('   ProductGroupCode:', product.ProductGroupCode)
    console.log('   MainGroupCode:', product.MainGroupCode)
    console.log('   Precio base:', product.SellingPriceExVAT)
    console.log('   Stock:', product.StockQuantity)
    
    // Buscar otros productos del mismo ProductGroupCode
    console.log('\n5. Buscando otros productos del mismo ProductGroupCode...')
    const groupResponse = await client.getProducts({ 
      productGroupCode: product.ProductGroupCode 
    })
    
    if (groupResponse.success) {
      console.log(`   Total productos en grupo ${product.ProductGroupCode}: ${groupResponse.data.length}`)
      
      const filteredInGroup = groupResponse.data.filter(p => 
        p.ShowOnWebsite && p.ItemStatus === 'A' && p.IsStockItem
      )
      
      console.log(`   Productos que pasan filtro en grupo: ${filteredInGroup.length}`)
      
      if (filteredInGroup.length > 0) {
        console.log('   Algunos productos del grupo SÍ se importan:')
        filteredInGroup.slice(0, 3).forEach(p => {
          console.log(`     - ${p.Itemcode}: ${p.ItemDescription_EN || p.ItemDescription_NL}`)
        })
      } else {
        console.log('   ❌ NINGÚN producto del grupo pasa el filtro')
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error)
  }
}

// Ejecutar script
const itemCode = process.argv[2] || 'CC0061247'
debugMissingProduct(itemCode)
  .then(() => {
    console.log('\n🏁 Diagnóstico completado')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })