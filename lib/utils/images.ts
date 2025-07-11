/**
 * Utilidades para manejo de imágenes de productos
 */

/**
 * Genera la URL de la imagen del producto usando el ItemCode
 * @param itemCode - Código del producto de Nieuwkoop
 * @returns URL de la imagen proxy
 */
export function getProductImageUrl(itemCode: string): string {
  if (!itemCode) {
    return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80'
  }
  
  return `/api/images/${itemCode}`
}

/**
 * Genera array de URLs de imágenes para un producto
 * @param itemCode - Código del producto de Nieuwkoop
 * @param count - Número de imágenes (por defecto 1)
 * @returns Array de URLs de imágenes
 */
export function getProductImageUrls(itemCode: string, count: number = 1): string[] {
  if (!itemCode) {
    return ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80']
  }
  
  // Por ahora, Nieuwkoop solo tiene una imagen por producto
  // Pero dejamos la estructura para futuras expansiones
  return [getProductImageUrl(itemCode)]
}

/**
 * URL de imagen fallback por defecto
 */
export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80'