const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Usar la variable de entorno DATABASE_URL del contenedor
const prisma = new PrismaClient()

async function createAdminProduction() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...')
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL)
    
    // Test de conexión
    await prisma.$connect()
    console.log('✅ Conexión a MongoDB exitosa')
    
    console.log('👑 Creando cuenta de administrador para PRODUCCIÓN...')
    
    const email = 'admin@bloommarbella.es'
    const password = 'AdminBloom2025!'
    const name = 'Administrador Bloom'
    
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
    console.log('   1. Iniciar sesión en el panel de administración')
    console.log('   2. Gestionar el catálogo completo')
    
    // Test adicional: contar usuarios
    const userCount = await prisma.user.count()
    console.log(`\n📊 Total de usuarios en la base de datos: ${userCount}`)
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error)
    console.error('🔍 Detalles del error:', error.message)
    
    if (error.code === 'P2002') {
      console.error('⚠️  Error: El email ya está en uso')
    } else if (error.code === 'P2010') {
      console.error('⚠️  Error: No se puede conectar a la base de datos')
      console.error('   - Verifica que MongoDB esté corriendo')
      console.error('   - Verifica la URL de conexión DATABASE_URL')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
createAdminProduction()
  .then(() => {
    console.log('✨ Administrador creado exitosamente')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })