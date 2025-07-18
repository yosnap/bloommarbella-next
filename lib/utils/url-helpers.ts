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
 * Genera URLs del catálogo basadas en filtros, paginación y orden
 */
export async function generateCatalogUrl(filters: {
  brands?: string[]
  categories?: string[]
  search?: string
  page?: number
  sortBy?: string
  sortOrder?: string
  itemsPerPage?: number
  // Filtros avanzados
  priceRange?: [number, number]
  heightRange?: [number, number]
  widthRange?: [number, number]
  inStock?: boolean
  location?: string[]
  plantingSystem?: string[]
  colors?: string[]
  advancedCategories?: string[]
  // Rangos dinámicos para comparación
  dynamicRanges?: {
    priceRange: { min: number; max: number }
    heightRange: { min: number; max: number }
    widthRange: { min: number; max: number }
  }
}): Promise<string> {
  const { 
    brands, categories, search, page, sortBy, sortOrder, itemsPerPage,
    priceRange, heightRange, widthRange, inStock, location, plantingSystem, colors, advancedCategories,
    dynamicRanges
  } = filters

  let baseUrl = '/catalogo'
  const params = new URLSearchParams()

  // Usar rangos dinámicos o valores por defecto si no se proporcionan
  const defaultRanges = {
    priceRange: { min: 0, max: 500 },
    heightRange: { min: 0, max: 200 },
    widthRange: { min: 0, max: 100 }
  }
  const ranges = dynamicRanges || defaultRanges

  // Verificar si hay filtros avanzados activos
  const isPriceFiltered = priceRange !== undefined
  const isHeightFiltered = heightRange !== undefined
  const isWidthFiltered = widthRange !== undefined
  
  const hasAdvancedFilters = isPriceFiltered || isHeightFiltered || isWidthFiltered || inStock || 
    location?.length || plantingSystem?.length || colors?.length || advancedCategories?.length

  // Prioridad para URL amigable: search > brands > categories (solo para casos simples sin filtros avanzados)
  if (search && search.trim() && !brands?.length && !categories?.length && !hasAdvancedFilters) {
    const searchSlug = toUrlFriendly(search.trim())
    baseUrl = `/catalogo/search/${searchSlug}`
  } else if (brands && brands.length === 1 && !categories?.length && !search?.trim() && !hasAdvancedFilters) {
    const brandSlug = toUrlFriendly(brands[0])
    baseUrl = `/catalogo/marca/${brandSlug}`
  } else if (categories && categories.length === 1 && !brands?.length && !search?.trim() && !hasAdvancedFilters) {
    // Para categorías, traducir primero y luego usar en la URL
    const translatedCategory = await translateCategoryForUrl(categories[0])
    const categorySlug = toUrlFriendly(translatedCategory)
    baseUrl = `/catalogo/categoria/${categorySlug}`
  } else {
    // Para múltiples filtros o casos complejos, usar query params
    if (brands && brands.length > 0) {
      params.set('brands', brands.join(','))
    }
    
    if (categories && categories.length > 0) {
      params.set('categories', categories.join(','))
    }
    
    if (search && search.trim()) {
      params.set('search', search.trim())
    }
    
    // Filtros avanzados (solo agregar si están realmente filtrados)
    if (isPriceFiltered) {
      params.set('price_min', priceRange[0].toString())
      params.set('price_max', priceRange[1].toString())
    }
    
    if (isHeightFiltered) {
      params.set('height_min', heightRange[0].toString())
      params.set('height_max', heightRange[1].toString())
    }
    
    if (isWidthFiltered) {
      params.set('width_min', widthRange[0].toString())
      params.set('width_max', widthRange[1].toString())
    }
    
    if (inStock) {
      params.set('in_stock', 'true')
    }
    
    if (location && location.length > 0) {
      params.set('location', location.join(','))
    }
    
    if (plantingSystem && plantingSystem.length > 0) {
      params.set('planting_system', plantingSystem.join(','))
    }
    
    if (colors && colors.length > 0) {
      params.set('colors', colors.join(','))
    }
    
    if (advancedCategories && advancedCategories.length > 0) {
      params.set('advanced_categories', advancedCategories.join(','))
    }
  }

  // Añadir parámetros de paginación y orden
  if (page && page > 1) {
    params.set('page', page.toString())
  }
  
  if (sortBy && sortBy !== 'alphabetical') {
    params.set('sort', sortBy)
  }
  
  if (sortOrder && sortOrder !== 'asc' && sortBy && sortBy !== 'alphabetical') {
    params.set('order', sortOrder)
  }
  
  if (itemsPerPage && itemsPerPage !== 15) {
    params.set('per_page', itemsPerPage.toString())
  }

  // Construir URL final
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
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
    page?: number
    sortBy?: string
    sortOrder?: string
    itemsPerPage?: number
    // Filtros avanzados
    priceRange?: [number, number]
    heightRange?: [number, number]
    widthRange?: [number, number]
    inStock?: boolean
    location?: string[]
    plantingSystem?: string[]
    colors?: string[]
    advancedCategories?: string[]
  }
) {
  const url = await generateCatalogUrl(filters)
  router.push(url)
}

/**
 * Parsea los filtros desde la URL actual incluyendo paginación y orden
 */
export function parseFiltersFromUrl(pathname: string, searchParams: URLSearchParams): {
  brands: string[]
  categories: string[]
  search: string
  page: number
  sortBy: string
  sortOrder: string
  itemsPerPage: number
  // Filtros avanzados
  priceRange: [number, number] | undefined
  heightRange: [number, number] | undefined
  widthRange: [number, number] | undefined
  inStock: boolean
  location: string[]
  plantingSystem: string[]
  colors: string[]
  advancedCategories: string[]
} {
  const result = {
    brands: [] as string[],
    categories: [] as string[],
    search: '',
    page: 1,
    sortBy: 'alphabetical',
    sortOrder: 'asc',
    itemsPerPage: 15,
    // Filtros avanzados - sin valores por defecto
    priceRange: undefined as [number, number] | undefined,
    heightRange: undefined as [number, number] | undefined,
    widthRange: undefined as [number, number] | undefined,
    inStock: false,
    location: [] as string[],
    plantingSystem: [] as string[],
    colors: [] as string[],
    advancedCategories: [] as string[]
  }

  // Rutas dinámicas
  if (pathname.startsWith('/catalogo/marca/')) {
    const brandSlug = pathname.split('/catalogo/marca/')[1]?.split('?')[0]
    if (brandSlug) {
      result.brands = [fromUrlFriendly(brandSlug)]
    }
  } else if (pathname.startsWith('/catalogo/categoria/')) {
    const categorySlug = pathname.split('/catalogo/categoria/')[1]?.split('?')[0]
    if (categorySlug) {
      result.categories = [fromUrlFriendly(categorySlug)]
    }
  } else if (pathname.startsWith('/catalogo/search/')) {
    const searchSlug = pathname.split('/catalogo/search/')[1]?.split('?')[0]
    if (searchSlug) {
      result.search = decodeURIComponent(searchSlug).replace(/-/g, ' ')
    }
  }

  // Query parameters (para múltiples filtros)
  const brandsParam = searchParams.get('brands')
  const categoriesParam = searchParams.get('categories')
  const searchParam = searchParams.get('search')
  const pageParam = searchParams.get('page')
  const sortParam = searchParams.get('sort')
  const orderParam = searchParams.get('order')
  const perPageParam = searchParams.get('per_page')
  
  // Filtros avanzados
  const priceMinParam = searchParams.get('price_min')
  const priceMaxParam = searchParams.get('price_max')
  const heightMinParam = searchParams.get('height_min')
  const heightMaxParam = searchParams.get('height_max')
  const widthMinParam = searchParams.get('width_min')
  const widthMaxParam = searchParams.get('width_max')
  const inStockParam = searchParams.get('in_stock')
  const locationParam = searchParams.get('location')
  const plantingSystemParam = searchParams.get('planting_system')
  const colorsParam = searchParams.get('colors')
  const advancedCategoriesParam = searchParams.get('advanced_categories')

  if (brandsParam) {
    result.brands = brandsParam.split(',').map(b => b.trim()).filter(b => b)
  }

  if (categoriesParam) {
    result.categories = categoriesParam.split(',').map(c => c.trim()).filter(c => c)
  }

  if (searchParam) {
    result.search = searchParam
  }

  if (pageParam) {
    const page = parseInt(pageParam)
    if (!isNaN(page) && page > 0) {
      result.page = page
    }
  }

  if (sortParam) {
    result.sortBy = sortParam
  }

  if (orderParam) {
    result.sortOrder = orderParam
  }

  if (perPageParam) {
    const perPage = parseInt(perPageParam)
    if (!isNaN(perPage) && perPage > 0) {
      result.itemsPerPage = perPage
    }
  }

  // Procesar filtros avanzados - solo si están explícitamente en la URL
  if (priceMinParam && priceMaxParam) {
    const priceMin = parseInt(priceMinParam)
    const priceMax = parseInt(priceMaxParam)
    if (!isNaN(priceMin) && !isNaN(priceMax)) {
      result.priceRange = [priceMin, priceMax]
    }
  }

  if (heightMinParam && heightMaxParam) {
    const heightMin = parseInt(heightMinParam)
    const heightMax = parseInt(heightMaxParam)
    if (!isNaN(heightMin) && !isNaN(heightMax)) {
      result.heightRange = [heightMin, heightMax]
    }
  }

  if (widthMinParam && widthMaxParam) {
    const widthMin = parseInt(widthMinParam)
    const widthMax = parseInt(widthMaxParam)
    if (!isNaN(widthMin) && !isNaN(widthMax)) {
      result.widthRange = [widthMin, widthMax]
    }
  }

  if (inStockParam) {
    result.inStock = inStockParam === 'true'
  }

  if (locationParam) {
    result.location = locationParam.split(',').map(l => l.trim()).filter(l => l)
  }

  if (plantingSystemParam) {
    result.plantingSystem = plantingSystemParam.split(',').map(p => p.trim()).filter(p => p)
  }

  if (colorsParam) {
    result.colors = colorsParam.split(',').map(c => c.trim()).filter(c => c)
  }

  if (advancedCategoriesParam) {
    result.advancedCategories = advancedCategoriesParam.split(',').map(c => c.trim()).filter(c => c)
  }

  return result
}