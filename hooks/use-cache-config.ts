'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'

interface CacheConfig {
  enableCache: boolean
  cacheTime: number // en minutos (catálogo general)
  pricesCacheTime?: number // en minutos (precios específicos)
  categoriesCacheTime?: number // en minutos (categorías)
}

// Hook para obtener la configuración de cache del admin
export function useCacheConfig() {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: async (): Promise<CacheConfig> => {
      const response = await fetch('/api/admin/configuration')
      if (!response.ok) {
        // Fallback values if API fails
        return {
          enableCache: true,
          cacheTime: 30
        }
      }
      const data = await response.json()
      return {
        enableCache: data.enableCache ?? true,
        cacheTime: data.cacheTime ?? 30,
        pricesCacheTime: data.pricesCacheTime ?? 2,
        categoriesCacheTime: data.categoriesCacheTime ?? 10
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

// Hook para obtener tiempos de cache en milisegundos
export function useCacheSettings() {
  const { data: config } = useCacheConfig()
  
  return {
    isEnabled: config?.enableCache ?? true,
    // Cache general (catálogo)
    staleTime: config?.cacheTime ? config.cacheTime * 60 * 1000 : 30 * 60 * 1000,
    gcTime: config?.cacheTime ? config.cacheTime * 2 * 60 * 1000 : 60 * 60 * 1000,
    // Cache específico para precios
    pricesStaleTime: config?.pricesCacheTime ? config.pricesCacheTime * 60 * 1000 : 2 * 60 * 1000,
    pricesGcTime: config?.pricesCacheTime ? config.pricesCacheTime * 2 * 60 * 1000 : 4 * 60 * 1000,
    // Cache específico para categorías
    categoriesStaleTime: config?.categoriesCacheTime ? config.categoriesCacheTime * 60 * 1000 : 10 * 60 * 1000,
    categoriesGcTime: config?.categoriesCacheTime ? config.categoriesCacheTime * 2 * 60 * 1000 : 20 * 60 * 1000,
  }
}