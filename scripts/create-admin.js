const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

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
      console.log('⚠️  El usuario ya existe, actualizando...')
      
      // Actualizar contraseña y rol
      const hashedPassword = await bcrypt.hash(password, 12)
      
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name,
          isActive: true
        }
      })
      
      console.log('✅ Usuario administrador actualizado:')
    } else {
      console.log('📝 Creando nuevo usuario administrador...')
      
      // Crear hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12)
      
      // Crear usuario
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN',
          isActive: true
        }
      })
      
      console.log('✅ Usuario administrador creado:')
    }
    
    console.log(`   📧 Email: ${email}`)
    console.log(`   🔐 Contraseña: ${password}`)
    console.log(`   👤 Nombre: ${name}`)
    console.log(`   🎯 Rol: ADMIN`)
    
    console.log('\n🚀 Ahora puedes:')
    console.log('   1. Iniciar sesión en http://localhost:3000/auth/login')
    console.log('   2. Acceder a la sincronización de productos')
    console.log('   3. Gestionar el catálogo completo')
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
createAdmin()
  .then(() => {
    console.log('✨ Administrador creado exitosamente')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })