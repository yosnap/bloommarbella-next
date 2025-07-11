/**
 * Client-side translation functions
 * These functions call API endpoints to get translations without using Prisma directly
 */

/**
 * Translate product tags on the client side
 */
export async function translateProductTagsClient(
  tags: Array<string | { code: string; value: string }>
): Promise<Array<{ code: string; value: string }>> {
  try {
    const response = await fetch('/api/translations/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags })
    })
    
    if (!response.ok) {
      throw new Error('Failed to translate tags')
    }
    
    const { translatedTags } = await response.json()
    return translatedTags
  } catch (error) {
    console.error('Error translating tags:', error)
    // Return original tags with consistent structure as fallback
    return tags.map(tag => {
      if (typeof tag === 'string') {
        return { code: 'Característica', value: tag }
      } else if (tag && typeof tag === 'object' && 'code' in tag && 'value' in tag) {
        return { code: tag.code, value: tag.value }
      } else {
        return { code: 'Característica', value: 'Información no disponible' }
      }
    })
  }
}

/**
 * Get common tag translations for immediate display
 * This can be used while the async translation is loading
 */
export const commonTagTranslationsClient: Record<string, string> = {
  // Tag codes
  'location': 'Ubicación',
  'light': 'Luz',
  'water': 'Agua',
  'temperature': 'Temperatura',
  'humidity': 'Humedad',
  'growth': 'Crecimiento',
  'flowering': 'Floración',
  'difficulty': 'Dificultad',
  'toxicity': 'Toxicidad',
  'air_purifying': 'Purifica el aire',
  'pet_friendly': 'Apto para mascotas',
  
  // Tag values
  'indoor': 'Interior',
  'outdoor': 'Exterior',
  'both': 'Ambos',
  'full sun': 'Sol directo',
  'partial sun': 'Sol parcial',
  'shade': 'Sombra',
  'low': 'Bajo',
  'medium': 'Medio',
  'high': 'Alto',
  'easy': 'Fácil',
  'moderate': 'Moderado',
  'difficult': 'Difícil',
  'toxic': 'Tóxico',
  'non-toxic': 'No tóxico',
  'yes': 'Sí',
  'no': 'No',
  'spring': 'Primavera',
  'summer': 'Verano',
  'fall': 'Otoño',
  'autumn': 'Otoño',
  'winter': 'Invierno',
  'slow': 'Lento',
  'fast': 'Rápido'
}