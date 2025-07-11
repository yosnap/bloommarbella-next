import { prisma } from '@/lib/prisma'

// Cache en memoria para las traducciones dinámicas
const translationCache = new Map<string, string>()
let cacheLastUpdated = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Obtener traducciones dinámicas de la base de datos
 */
async function loadDynamicTranslations() {
  const now = Date.now()
  
  // Si el cache es reciente, no recargar
  if (cacheLastUpdated && now - cacheLastUpdated < CACHE_DURATION) {
    return
  }
  
  try {
    const translations = await prisma.translation.findMany({
      select: {
        category: true,
        englishText: true,
        spanishText: true
      }
    })
    
    // Limpiar y recargar cache
    translationCache.clear()
    
    translations.forEach(t => {
      const key = `${t.category}:${t.englishText.toLowerCase()}`
      translationCache.set(key, t.spanishText)
    })
    
    cacheLastUpdated = now
    console.log(`✅ Cargadas ${translations.length} traducciones dinámicas`)
  } catch (error) {
    console.error('Error cargando traducciones dinámicas:', error)
  }
}

/**
 * Traducir texto usando traducciones dinámicas y estáticas
 */
export async function translateDynamicText(
  text: string, 
  category: string = 'general',
  fallbackTranslations?: Record<string, string>
): Promise<string> {
  if (!text) return text
  
  // Cargar traducciones si es necesario
  await loadDynamicTranslations()
  
  // Buscar en cache dinámico
  const key = `${category}:${text.toLowerCase()}`
  const cachedTranslation = translationCache.get(key)
  if (cachedTranslation) {
    return cachedTranslation
  }
  
  // Buscar en traducciones de fallback
  if (fallbackTranslations) {
    const fallback = fallbackTranslations[text] || fallbackTranslations[text.toLowerCase()]
    if (fallback) {
      return fallback
    }
  }
  
  // Si no hay traducción, devolver el texto original
  return text
}

/**
 * Traducir múltiples textos de manera eficiente
 */
export async function translateDynamicBatch(
  texts: string[],
  category: string = 'general',
  fallbackTranslations?: Record<string, string>
): Promise<string[]> {
  await loadDynamicTranslations()
  
  return texts.map(text => {
    if (!text) return text
    
    const key = `${category}:${text.toLowerCase()}`
    const cachedTranslation = translationCache.get(key)
    
    if (cachedTranslation) {
      return cachedTranslation
    }
    
    if (fallbackTranslations) {
      const fallback = fallbackTranslations[text] || fallbackTranslations[text.toLowerCase()]
      if (fallback) return fallback
    }
    
    return text
  })
}

/**
 * Traducir tags del producto (clave-valor)
 */
export async function translateProductTags(
  tags: Array<string | { code: string; value: string }>
): Promise<Array<{ code: string; value: string }>> {
  if (!tags || tags.length === 0) return []
  
  await loadDynamicTranslations()
  
  const translatedTags = await Promise.all(
    tags.map(async (tag) => {
      if (typeof tag === 'string') {
        return {
          code: await translateDynamicText('Característica', 'tag-codes'),
          value: await translateDynamicText(tag, 'tag-values')
        }
      }
      
      return {
        code: await translateDynamicText(tag.code, 'tag-codes'),
        value: await translateDynamicText(tag.value, 'tag-values')
      }
    })
  )
  
  return translatedTags
}

/**
 * Limpiar cache de traducciones
 */
export function clearTranslationCache() {
  translationCache.clear()
  cacheLastUpdated = 0
}

/**
 * Agregar o actualizar una traducción dinámica
 */
export async function addDynamicTranslation(
  category: string,
  englishText: string,
  spanishText: string
): Promise<boolean> {
  try {
    await prisma.translation.upsert({
      where: {
        category_englishText: {
          category,
          englishText
        }
      },
      update: {
        spanishText,
        updatedAt: new Date()
      },
      create: {
        category,
        englishText,
        spanishText
      }
    })
    
    // Actualizar cache inmediatamente
    const key = `${category}:${englishText.toLowerCase()}`
    translationCache.set(key, spanishText)
    
    return true
  } catch (error) {
    console.error('Error agregando traducción dinámica:', error)
    return false
  }
}

// Traducciones estáticas comunes para tags
export const commonTagTranslations: Record<string, string> = {
  // Códigos de tags
  'location': 'Ubicación',
  'light': 'Luz',
  'water': 'Riego',
  'temperature': 'Temperatura',
  'humidity': 'Humedad',
  'size': 'Tamaño',
  'growth': 'Crecimiento',
  'care': 'Cuidado',
  'type': 'Tipo',
  'season': 'Temporada',
  'color': 'Color',
  'feature': 'Característica',
  
  // Valores comunes
  'indoor': 'Interior',
  'outdoor': 'Exterior',
  'both': 'Ambos',
  'full sun': 'Sol directo',
  'partial shade': 'Semisombra',
  'shade': 'Sombra',
  'low': 'Bajo',
  'medium': 'Medio',
  'high': 'Alto',
  'easy': 'Fácil',
  'moderate': 'Moderado',
  'difficult': 'Difícil',
  'fast': 'Rápido',
  'slow': 'Lento',
  'spring': 'Primavera',
  'summer': 'Verano',
  'autumn': 'Otoño',
  'winter': 'Invierno',
  'evergreen': 'Perenne',
  'deciduous': 'Caduco',
  'flowering': 'Floración',
  'foliage': 'Follaje',
  'fragrant': 'Fragante',
  'edible': 'Comestible',
  'toxic': 'Tóxico',
  'pet friendly': 'Apto mascotas',
  'air purifying': 'Purifica el aire'
}