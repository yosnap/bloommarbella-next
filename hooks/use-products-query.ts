'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import { useCacheSettings } from './use-cache-config'

interface ProductsFilters {
  category?: string
  categories?: string[]
  brands?: string[]
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
  // Advanced filters
  priceMin?: number
  priceMax?: number
  heightMin?: number
  heightMax?: number
  widthMin?: number
  widthMax?: number
  inStock?: boolean
  location?: string[]
  plantingSystem?: string[]
  colors?: string[]
  advancedCategories?: string[]
}

interface ProductsResponse {
  data: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  config?: {
    priceMultiplier: number
    associateDiscount: number
    vatRate: number
  }
  filters?: {
    categories: Array<{ name: string; count: number }>
    brands: Array<{ name: string; count: number }>
  }
}

// Función para construir query string
function buildQueryString(filters: ProductsFilters): string {
  const params = new URLSearchParams()
  
  // Validar y agregar parámetros
  if (filters.page && filters.page > 0) params.append('page', filters.page.toString())
  if (filters.limit && filters.limit > 0) params.append('limit', filters.limit.toString())
  if (filters.category) params.append('category', filters.category)
  if (filters.categories && filters.categories.length > 0) {
    params.append('categories', filters.categories.join(','))
  }
  if (filters.brands && filters.brands.length > 0) {
    params.append('brands', filters.brands.join(','))
  }
  if (filters.search) params.append('search', filters.search)
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
  
  // Advanced filters
  if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString())
  if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString())
  if (filters.heightMin !== undefined) params.append('heightMin', filters.heightMin.toString())
  if (filters.heightMax !== undefined) params.append('heightMax', filters.heightMax.toString())
  if (filters.widthMin !== undefined) params.append('widthMin', filters.widthMin.toString())
  if (filters.widthMax !== undefined) params.append('widthMax', filters.widthMax.toString())
  if (filters.inStock) params.append('inStock', 'true')
  if (filters.location && filters.location.length > 0) {
    params.append('location', filters.location.join(','))
  }
  if (filters.plantingSystem && filters.plantingSystem.length > 0) {
    params.append('plantingSystem', filters.plantingSystem.join(','))
  }
  if (filters.colors && filters.colors.length > 0) {
    params.append('colors', filters.colors.join(','))
  }
  if (filters.advancedCategories && filters.advancedCategories.length > 0) {
    params.append('advancedCategories', filters.advancedCategories.join(','))
  }
  
  return params.toString()
}

// Hook principal para obtener productos
export function useProductsQuery(filters: ProductsFilters = {}) {
  const cacheSettings = useCacheSettings()
  
  return useQuery({
    queryKey: queryKeys.productsList(filters),
    queryFn: async (): Promise<ProductsResponse> => {
      const queryString = buildQueryString(filters)
      const url = `/api/products?${queryString}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      
      return response.json()
    },
    staleTime: cacheSettings.pricesStaleTime, // Configurable desde admin
    gcTime: cacheSettings.pricesGcTime, // Configurable desde admin
    retry: 1, // Solo 1 retry para ser más rápido
    refetchOnWindowFocus: false,
    // Mantener datos anteriores mientras se cargan nuevos
    placeholderData: (previousData) => previousData,
    // Refetch al montar para obtener datos frescos
    refetchOnMount: true,
    // Siempre habilitado
    enabled: true,
  })
}

// Hook para obtener configuración de precios
export function usePricingConfigQuery() {
  return useQuery({
    queryKey: queryKeys.pricingConfig(),
    queryFn: async () => {
      const response = await fetch('/api/config/pricing')
      if (!response.ok) {
        throw new Error('Error al cargar configuración de precios')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutos para configuración
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

// Hook para obtener categorías
export function useCategoriesQuery() {
  const cacheSettings = useCacheSettings()
  
  return useQuery({
    queryKey: queryKeys.categoryList(),
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Error al cargar categorías')
      }
      return response.json()
    },
    staleTime: cacheSettings.categoriesStaleTime, // Configurable desde admin
    gcTime: cacheSettings.categoriesGcTime, // Configurable desde admin
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

// Hook para prefetch de productos (útil para paginación)
export function usePrefetchProducts() {
  const queryClient = useQueryClient()
  
  return (filters: ProductsFilters) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.productsList(filters),
      queryFn: async (): Promise<ProductsResponse> => {
        const queryString = buildQueryString(filters)
        const url = `/api/products?${queryString}`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Error al cargar productos')
        }
        
        return response.json()
      },
      staleTime: 2 * 60 * 1000,
    })
  }
}

// Hook para invalidar cache de productos
export function useInvalidateProducts() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.products
    })
  }
}

// Hook para obtener datos de cache sin hacer fetch
export function useProductsCache(filters: ProductsFilters = {}) {
  const queryClient = useQueryClient()
  
  return queryClient.getQueryData<ProductsResponse>(queryKeys.productsList(filters))
}