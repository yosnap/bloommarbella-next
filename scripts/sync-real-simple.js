async function syncRealProducts() {
  try {
    console.log('🌱 Sincronizando productos reales de Nieuwkoop...')
    
    // Usar fetch nativo de Node.js 18+
    const response = await fetch('http://localhost:3000/api/admin/sync-hybrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'changes'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Sincronización completada:')
      console.log(`   📦 Productos nuevos: ${result.data.newProducts}`)
      console.log(`   🔄 Productos actualizados: ${result.data.updatedProducts}`)
      console.log(`   ❌ Errores: ${result.data.errors}`)
      console.log(`   📊 Total procesados: ${result.data.total}`)
      
      console.log('\n🎉 ¡Productos reales sincronizados exitosamente!')
      console.log('💡 Ahora puedes ver los productos en: http://localhost:3000/catalogo')
    } else {
      console.error('❌ Error en sincronización:', result.error)
      console.error('📋 Detalles:', result.details)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔗 Asegúrate de que el servidor Next.js esté corriendo en localhost:3000')
      console.error('   Ejecuta: npm run dev')
    }
  }
}

// Ejecutar
syncRealProducts()
  .then(() => {
    console.log('✨ Proceso completado')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })