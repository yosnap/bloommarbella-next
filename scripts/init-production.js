#!/usr/bin/env node

/**
 * Script de inicialización para producción
 * Se ejecuta después del deploy para configurar la base de datos
 */

console.log('🚀 Iniciando configuración de producción...')

// Verificar variables de entorno críticas
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NIEUWKOOP_API_URL',
  'NIEUWKOOP_API_USER',
  'NIEUWKOOP_API_PASSWORD'
]

console.log('📋 Verificando variables de entorno...')
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:')
  missingVars.forEach(envVar => {
    console.error(`   - ${envVar}`)
  })
  process.exit(1)
}

console.log('✅ Variables de entorno verificadas')

// Mostrar configuración (sin secrets)
console.log('📊 Configuración de producción:')
console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL.replace(/\/\/.*@/, '//***@')}`)
console.log(`   - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
console.log(`   - NIEUWKOOP_API_URL: ${process.env.NIEUWKOOP_API_URL}`)
console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`)

console.log('🏁 Configuración completada - La aplicación está lista para usar')
console.log('💡 Para sincronizar productos, accede al panel de administración')