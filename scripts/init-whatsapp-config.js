const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initWhatsAppConfig() {
  try {
    console.log('🚀 Inicializando configuración de WhatsApp...')

    const whatsappConfigs = [
      {
        key: 'whatsapp_enabled',
        value: 'true',
        description: 'Habilitar botón de WhatsApp en lugar del carrito'
      },
      {
        key: 'whatsapp_number',
        value: '34952123456',
        description: 'Número de WhatsApp para contacto'
      },
      {
        key: 'whatsapp_contact_name',
        value: 'Elisabeth',
        description: 'Nombre de la persona de contacto'
      },
      {
        key: 'whatsapp_message',
        value: 'Hola {contactName}, me interesa el producto "{productName}" cuyo enlace es: {productUrl}. ¿Me podrías dar información para realizar la compra?',
        description: 'Plantilla del mensaje de WhatsApp'
      }
    ]

    for (const config of whatsappConfigs) {
      await prisma.configuration.upsert({
        where: { key: config.key },
        update: {
          value: config.value,
          description: config.description
        },
        create: {
          key: config.key,
          value: config.value,
          description: config.description
        }
      })
      console.log(`✅ Configurado: ${config.key}`)
    }

    console.log('🎉 Configuración de WhatsApp inicializada correctamente')
  } catch (error) {
    console.error('❌ Error inicializando configuración de WhatsApp:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initWhatsAppConfig()