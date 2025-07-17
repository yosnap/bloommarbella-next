const { PrismaClient } = require('@prisma/client')

console.log('🔍 Probando conexión a MongoDB...')
console.log('📍 DATABASE_URL:', process.env.DATABASE_URL)

const prisma = new PrismaClient()

async function testConnection() {
  try {
    // Probar conexión básica
    console.log('⚡ Conectando a la base de datos...')
    await prisma.$connect()
    console.log('✅ Conexión exitosa!')
    
    // Probar una query simple
    console.log('🔍 Probando query...')
    const userCount = await prisma.user.count()
    console.log(`👥 Usuarios en BD: ${userCount}`)
    
    const productCount = await prisma.product.count()
    console.log(`📦 Productos en BD: ${productCount}`)
    
    console.log('🎉 Todo funciona correctamente!')
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    console.error('📋 Detalles del error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()