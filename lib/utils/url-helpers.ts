/**
 * Utilidades para generar URLs amigables del catálogo
 */

/**
 * Convierte un nombre a formato URL amigable
 * Ejemplo: "Lechuza Premium" -> "lechuza-premium"
 */
export function toUrlFriendly(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
}

/**
 * Convierte una URL amigable de vuelta al nombre original
 * Ejemplo: "lechuza-premium" -> "Lechuza Premium"
 */
export function fromUrlFriendly(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Obtiene la traducción de una categoría desde la API
 */
export async function getCategoryTranslation(categorySlug: string): Promise<string | null> {
  try {
    const categoryName = fromUrlFriendly(categorySlug)
    
    const response = await fetch('/api/translations/public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [categoryName],
        category: 'categories'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.translations[categoryName] || categoryName
    }
    
    return categoryName
  } catch (error) {
    console.error('Error getting category translation:', error)
    return fromUrlFriendly(categorySlug)
  }
}

/**
 * Obtiene el nombre original (en inglés) de una categoría traducida
 */
export async function getCategoryOriginalName(translatedName: string): Promise<string> {
  try {
    // Primero intentar obtener todas las traducciones para encontrar la original
    const response = await fetch('/api/translations/reverse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        translatedText: translatedName,
        category: 'categories'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.originalText || translatedName
    }
    
    return translatedName
  } catch (error) {
    console.error('Error getting original category name:', error)
    return translatedName
  }
}

/**
 * Traduce una categoría de inglés a español
 */
export async function translateCategoryForUrl(originalName: string): Promise<string> {
  try {
    const response = await fetch('/api/translations/public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [originalName],
        category: 'categories'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.translations[0] || originalName
    }
    
    return originalName
  } catch (error) {
    console.error('Error translating category:', error)
    return originalName
  }
}

/**
 * Genera URLs del catálogo basadas en filtros
 */
export async function generateCatalogUrl(filters: {
  brands?: string[]
  categories?: string[]
  search?: string
}): Promise<string> {
  const { brands, categories, search } = filters

  // Prioridad: search > brands > categories
  if (search && search.trim()) {
    const searchSlug = toUrlFriendly(search.trim())
    return `/catalogo/search/${searchSlug}`
  }

  if (brands && brands.length === 1) {
    const brandSlug = toUrlFriendly(brands[0])
    return `/catalogo/marca/${brandSlug}`
  }

  if (categories && categories.length === 1) {
    // Para categorías, traducir primero y luego usar en la URL
    const translatedCategory = await translateCategoryForUrl(categories[0])
    const categorySlug = toUrlFriendly(translatedCategory)
    return `/catalogo/categoria/${categorySlug}`
  }

  // Para múltiples filtros o casos complejos, usar query params
  if ((brands && brands.length > 1) || (categories && categories.length > 1) || 
      (brands && brands.length > 0 && categories && categories.length > 0)) {
    const params = new URLSearchParams()
    
    if (brands && brands.length > 0) {
      params.set('brands', brands.join(','))
    }
    
    if (categories && categories.length > 0) {
      params.set('categories', categories.join(','))
    }
    
    return `/catalogo?${params.toString()}`
  }

  // Sin filtros - catálogo base
  return '/catalogo'
}

/**
 * Navega a la URL del catálogo usando router.push()
 */
export async function navigateToCatalog(
  router: any,
  filters: {
    brands?: string[]
    categories?: string[]
    search?: string
  }
) {
  const url = await generateCatalogUrl(filters)
  router.push(url)
}

/**
 * Parsea los filtros desde la URL actual
 */
export function parseFiltersFromUrl(pathname: string, searchParams: URLSearchParams): {
  brands: string[]
  categories: string[]
  search: string
} {
  const result = {
    brands: [] as string[],
    categories: [] as string[],
    search: ''
  }

  // Rutas dinámicas
  if (pathname.startsWith('/catalogo/marca/')) {
    const brandSlug = pathname.split('/catalogo/marca/')[1]
    if (brandSlug) {
      result.brands = [fromUrlFriendly(brandSlug)]
    }
  } else if (pathname.startsWith('/catalogo/categoria/')) {
    const categorySlug = pathname.split('/catalogo/categoria/')[1]
    if (categorySlug) {
      result.categories = [fromUrlFriendly(categorySlug)]
    }
  } else if (pathname.startsWith('/catalogo/search/')) {
    const searchSlug = pathname.split('/catalogo/search/')[1]
    if (searchSlug) {
      result.search = decodeURIComponent(searchSlug).replace(/-/g, ' ')
    }
  }

  // Query parameters (para múltiples filtros)
  const brandsParam = searchParams.get('brands')
  const categoriesParam = searchParams.get('categories')
  const searchParam = searchParams.get('search')

  if (brandsParam) {
    result.brands = brandsParam.split(',').map(b => b.trim()).filter(b => b)
  }

  if (categoriesParam) {
    result.categories = categoriesParam.split(',').map(c => c.trim()).filter(c => c)
  }

  if (searchParam) {
    result.search = searchParam
  }

  return result
}