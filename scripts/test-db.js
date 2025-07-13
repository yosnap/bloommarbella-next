const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a MongoDB...')
    
    // Intentar contar usuarios
    const userCount = await prisma.user.count()
    console.log(`✅ Conexión exitosa. Usuarios en BD: ${userCount}`)
    
    // Intentar contar traducciones
    const translationCount = await prisma.translation.count()
    console.log(`📚 Traducciones en BD: ${translationCount}`)
    
    // Verificar si podemos hacer queries
    const translations = await prisma.translation.findMany({
      take: 5
    })
    console.log('\n📝 Primeras traducciones:')
    translations.forEach(t => {
      console.log(`   ${t.englishText} -> ${t.spanishText}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Detalles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()