const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdminNative() {
  const url = process.env.DATABASE_URL || 'mongodb://bloom:Bloom.5050!@bloom_bloommarbella-mongodb:27017/bloommarbella?authSource=admin&tls=false';
  
  console.log('🔍 Verificando conexión a la base de datos...');
  console.log('🔗 DATABASE_URL:', url);
  
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('✅ Conexión a MongoDB exitosa');
    
    const db = client.db('bloommarbella');
    const usersCollection = db.collection('User');
    
    console.log('👑 Creando cuenta de administrador para PRODUCCIÓN...');
    
    const email = 'admin@bloommarbella.es';
    const password = 'AdminBloom2025!';
    const name = 'Administrador Bloom';
    
    console.log('📝 Verificando si el usuario ya existe...');
    
    // Verificar si ya existe
    const existingUser = await usersCollection.findOne({ email });
    
    if (existingUser) {
      console.log('⚠️  El usuario ya existe, actualizando...');
      
      // Actualizar contraseña y rol
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
            role: 'ADMIN',
            name,
            isActive: true,
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Usuario administrador actualizado:');
    } else {
      console.log('📝 Creando nuevo usuario administrador...');
      
      // Crear hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Crear usuario
      await usersCollection.insertOne({
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Usuario administrador creado:');
    }
    
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔐 Contraseña: ${password}`);
    console.log(`   👤 Nombre: ${name}`);
    console.log(`   🎯 Rol: ADMIN`);
    
    console.log('\n🚀 Ahora puedes:');
    console.log('   1. Iniciar sesión en el panel de administración');
    console.log('   2. Gestionar el catálogo completo');
    
    // Test adicional: contar usuarios
    const userCount = await usersCollection.countDocuments();
    console.log(`\n📊 Total de usuarios en la base de datos: ${userCount}`);
    
    // Listar colecciones
    const collections = await db.listCollections().toArray();
    console.log('\n📚 Colecciones en la base de datos:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error);
    console.error('🔍 Detalles del error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('⚠️  Error: Credenciales de autenticación incorrectas');
    } else if (error.message.includes('connection')) {
      console.error('⚠️  Error: No se puede conectar a la base de datos');
    }
    
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔐 Conexión cerrada');
  }
}

// Ejecutar
createAdminNative()
  .then(() => {
    console.log('✨ Administrador creado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });