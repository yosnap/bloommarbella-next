import { UserRole } from '@prisma/client'

interface PricingConfig {
  priceMultiplier: number
  associateDiscount: number
  vatRate: number
}

const defaultConfig: PricingConfig = {
  priceMultiplier: parseFloat(process.env.PRICE_MULTIPLIER || '2.5'),
  associateDiscount: parseFloat(process.env.ASSOCIATE_DISCOUNT || '0.20'),
  vatRate: parseFloat(process.env.VAT_RATE || '0.21'), // 21% IVA por defecto
}

export function calculatePrice(
  basePrice: number,
  userRole?: UserRole,
  config: PricingConfig = defaultConfig
): {
  priceWithoutVat: number
  priceWithVat: number
  originalPriceWithoutVat?: number
  originalPriceWithVat?: number
  hasDiscount: boolean
  discountPercentage: number
} {
  // Calculate original price without VAT (PVP sin IVA)
  const originalPriceWithoutVat = basePrice * config.priceMultiplier
  const originalPriceWithVat = originalPriceWithoutVat * (1 + config.vatRate)
  
  let finalPriceWithoutVat = originalPriceWithoutVat
  let hasDiscount = false
  let discountPercentage = 0
  
  // Apply associate discount if applicable
  if (userRole === 'ASSOCIATE') {
    finalPriceWithoutVat = originalPriceWithoutVat * (1 - config.associateDiscount)
    hasDiscount = true
    discountPercentage = Math.round(config.associateDiscount * 100)
  }
  
  const finalPriceWithVat = finalPriceWithoutVat * (1 + config.vatRate)
  
  return {
    priceWithoutVat: Math.round(finalPriceWithoutVat * 100) / 100,
    priceWithVat: Math.round(finalPriceWithVat * 100) / 100,
    originalPriceWithoutVat: userRole === 'ASSOCIATE' ? Math.round(originalPriceWithoutVat * 100) / 100 : undefined,
    originalPriceWithVat: userRole === 'ASSOCIATE' ? Math.round(originalPriceWithVat * 100) / 100 : undefined,
    hasDiscount,
    discountPercentage
  }
}

export function formatPrice(price: number, currency: string = 'EUR', showVat: boolean = false): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(price)
  
  // No agregamos sufijo de IVA para usuarios públicos
  return formatted
}

export function calculateDiscount(
  originalPrice: number,
  discountedPrice: number
): number {
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
  return Math.round(discount)
}

export function getDisplayPrice(
  basePrice: number,
  userRole?: UserRole,
  config: PricingConfig = defaultConfig,
  showVatForAssociate: boolean = false
): {
  displayPrice: number
  originalPrice?: number
  showWithVat: boolean
  currency: string
} {
  const pricing = calculatePrice(basePrice, userRole, config)
  
  if (userRole === 'ASSOCIATE') {
    // Asociados pueden elegir ver precios con o sin IVA
    if (showVatForAssociate) {
      return {
        displayPrice: pricing.priceWithVat,
        originalPrice: pricing.originalPriceWithVat,
        showWithVat: true,
        currency: 'EUR'
      }
    } else {
      return {
        displayPrice: pricing.priceWithoutVat,
        originalPrice: pricing.originalPriceWithoutVat,
        showWithVat: false,
        currency: 'EUR'
      }
    }
  } else {
    // Usuarios finales siempre ven precios con IVA (sin sufijo)
    return {
      displayPrice: pricing.priceWithVat,
      originalPrice: undefined,
      showWithVat: false, // No mostrar sufijo para usuarios públicos
      currency: 'EUR'
    }
  }
}