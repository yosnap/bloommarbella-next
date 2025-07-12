export interface WhatsAppConfig {
  whatsappEnabled: boolean
  whatsappNumber: string
  whatsappContactName: string
  whatsappMessage: string
}

export interface ProductInfo {
  name: string
  slug: string
}

/**
 * Genera el mensaje de WhatsApp formateado con las variables reemplazadas
 */
export function generateWhatsAppMessage(
  template: string,
  productInfo: ProductInfo,
  contactName: string,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://bloommarbella.es'
): string {
  const productUrl = `${baseUrl}/productos/${productInfo.slug}`
  
  return template
    .replace(/{contactName}/g, contactName)
    .replace(/{productName}/g, productInfo.name)
    .replace(/{productUrl}/g, productUrl)
}

/**
 * Genera la URL de WhatsApp para abrir en el navegador
 * NOTA: WhatsApp Web solo pre-rellena el mensaje, el usuario debe hacer clic en enviar manualmente
 * Esto es una limitación de seguridad de WhatsApp y no se puede evitar
 */
export function generateWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}

/**
 * Función completa para generar URL de WhatsApp con configuración
 */
export function createWhatsAppLink(
  config: WhatsAppConfig,
  productInfo: ProductInfo,
  baseUrl?: string
): string {
  if (!config.whatsappEnabled) {
    return '#'
  }

  const message = generateWhatsAppMessage(
    config.whatsappMessage,
    productInfo,
    config.whatsappContactName,
    baseUrl
  )

  return generateWhatsAppUrl(config.whatsappNumber, message)
}

/**
 * Valida la configuración de WhatsApp
 */
export function validateWhatsAppConfig(config: Partial<WhatsAppConfig>): string[] {
  const errors: string[] = []

  if (config.whatsappEnabled) {
    if (!config.whatsappNumber?.trim()) {
      errors.push('El número de WhatsApp es requerido cuando está habilitado')
    } else if (!/^\d{8,15}$/.test(config.whatsappNumber.trim())) {
      errors.push('El número de WhatsApp debe contener solo dígitos y tener entre 8 y 15 caracteres')
    }

    if (!config.whatsappContactName?.trim()) {
      errors.push('El nombre de contacto es requerido cuando WhatsApp está habilitado')
    }

    if (!config.whatsappMessage?.trim()) {
      errors.push('La plantilla del mensaje es requerida cuando WhatsApp está habilitado')
    } else if (!config.whatsappMessage.includes('{productName}')) {
      errors.push('La plantilla del mensaje debe incluir la variable {productName}')
    }
  }

  return errors
}