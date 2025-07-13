const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
})

async function createAdmin() {
  try {
    console.log('👑 Creando cuenta de administrador...')
    
    const email = 'paulo@bloommarbella.es'
    const password = 'Paulo'
    const name = 'Paulo'
    
    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('⚠️  El usuario ya existe')
      return
    }
    
    console.log('📝 Creando nuevo usuario administrador...')
    
    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Crear usuario sin transacción
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        isActive: true
      }
    })
    
    console.log('✅ Usuario administrador creado:')
    console.log(`   📧 Email: ${email}`)
    console.log(`   🔐 Contraseña: ${password}`)
    console.log(`   👤 Nombre: ${name}`)
    console.log(`   🎯 Rol: ADMIN`)
    console.log(`   🆔 ID: ${user.id}`)
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error)
    console.error('Detalles completos:', JSON.stringify(error, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()