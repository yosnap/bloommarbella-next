const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

async function initSystemVersion() {
  try {
    console.log('🔧 Inicializando versión del sistema...')

    // Leer versión del package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const currentVersion = packageJson.version

    console.log(`📦 Versión encontrada en package.json: ${currentVersion}`)

    // Conectar a MongoDB
    const client = new MongoClient(process.env.DATABASE_URL)
    await client.connect()
    const db = client.db()

    // Verificar si ya existe la configuración de versión
    const existingVersion = await db.collection('configurations').findOne({
      key: 'system_version'
    })

    if (existingVersion) {
      console.log(`✅ Versión del sistema ya configurada: ${existingVersion.value}`)
      console.log(`🔄 Actualizando a versión actual: ${currentVersion}`)
      
      await db.collection('configurations').updateOne(
        { key: 'system_version' },
        {
          $set: {
            value: currentVersion,
            description: 'Versión actual del sistema Bloom Marbella',
            updatedAt: new Date()
          }
        }
      )
    } else {
      console.log(`🆕 Creando configuración de versión inicial: ${currentVersion}`)
      
      await db.collection('configurations').insertOne({
        key: 'system_version',
        value: currentVersion,
        description: 'Versión actual del sistema Bloom Marbella',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Registrar la inicialización en logs
    await db.collection('sync_logs').insertOne({
      type: 'system-version-init',
      status: 'success',
      productsProcessed: 0,
      errors: 0,
      metadata: {
        version: currentVersion,
        action: existingVersion ? 'updated' : 'created',
        timestamp: new Date().toISOString()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await client.close()

    console.log(`✅ Versión del sistema inicializada correctamente: ${currentVersion}`)

  } catch (error) {
    console.error('❌ Error inicializando versión del sistema:', error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  // Cargar variables de entorno
  require('dotenv').config()
  
  initSystemVersion()
    .then(() => {
      console.log('🎉 Inicialización de versión completada')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Error fatal:', error)
      process.exit(1)
    })
}

module.exports = { initSystemVersion }