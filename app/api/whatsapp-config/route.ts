import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get WhatsApp configuration (public endpoint)
    const configurations = await prisma.configuration.findMany({
      where: {
        key: {
          in: [
            'whatsapp_enabled',
            'whatsapp_number',
            'whatsapp_contact_name',
            'whatsapp_message'
          ]
        }
      }
    })

    // Default WhatsApp config
    const whatsappConfig = {
      whatsappEnabled: true,
      whatsappNumber: '34952123456',
      whatsappContactName: 'Elisabeth',
      whatsappMessage: 'Hola {contactName}, me interesa el producto "{productName}" cuyo enlace es: {productUrl}. ¿Me podrías dar información para realizar la compra?'
    }

    configurations.forEach(item => {
      switch (item.key) {
        case 'whatsapp_enabled':
          whatsappConfig.whatsappEnabled = item.value === 'true' || item.value === true
          break
        case 'whatsapp_number':
          whatsappConfig.whatsappNumber = item.value?.toString() || '34952123456'
          break
        case 'whatsapp_contact_name':
          whatsappConfig.whatsappContactName = item.value?.toString() || 'Elisabeth'
          break
        case 'whatsapp_message':
          whatsappConfig.whatsappMessage = item.value?.toString() || 'Hola {contactName}, me interesa el producto "{productName}" cuyo enlace es: {productUrl}. ¿Me podrías dar información para realizar la compra?'
          break
      }
    })

    return NextResponse.json({
      success: true,
      data: whatsappConfig
    })
  } catch (error: any) {
    console.error('WhatsApp config GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener configuración de WhatsApp' 
      },
      { status: 500 }
    )
  }
}