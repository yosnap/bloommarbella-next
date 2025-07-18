'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState, useEffect } from 'react'

// Configuración del QueryClient
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache por 5 minutos por defecto
      staleTime: 5 * 60 * 1000,
      // Mantener en cache por 10 minutos (gcTime en v5)
      gcTime: 10 * 60 * 1000,
      // Reintento en caso de error
      retry: 2,
      // Refetch cuando la ventana vuelve a tener foco
      refetchOnWindowFocus: false,
      // No refetch al montar componente si los datos son "fresh"
      refetchOnMount: false,
    },
  },
}

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Usar useState para crear el QueryClient solo una vez
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Solo mostrar devtools en desarrollo */}
      {process.env.NODE_ENV === 'development' && <DevTools />}
    </QueryClientProvider>
  )
}

// Componente separado para devtools que solo se carga en desarrollo
function DevTools() {
  // No renderizar nada en producción
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // En desarrollo, intentar cargar las devtools dinámicamente
  const [DevtoolsComponent, setDevtoolsComponent] = useState<any>(null)

  useEffect(() => {
    // Solo intentar importar en el cliente y en desarrollo
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Usar string para evitar que TypeScript trate de resolver el módulo en build time
      const devtoolsModule = '@tanstack/react-query-devtools'
      import(devtoolsModule)
        .then((module: any) => {
          setDevtoolsComponent(() => module.ReactQueryDevtools)
        })
        .catch(() => {
          // Silently fail si las devtools no están disponibles
        })
    }
  }, [])

  // No renderizar hasta que las devtools estén cargadas
  if (!DevtoolsComponent) {
    return null
  }

  return <DevtoolsComponent initialIsOpen={false} />
}

// Hook para keys de queries estandarizadas
export const queryKeys = {
  // Productos
  products: ['products'] as const,
  productsList: (filters?: any) => ['products', 'list', filters] as const,
  product: (id: string) => ['products', 'detail', id] as const,
  
  // Categorías
  categories: ['categories'] as const,
  categoryList: () => ['categories', 'list'] as const,
  
  // Configuración
  config: ['config'] as const,
  pricingConfig: () => ['config', 'pricing'] as const,
  
  // Filtros
  filters: ['filters'] as const,
  filterCounts: (filters?: any) => ['filters', 'counts', filters] as const,
}

// Función helper para crear query keys consistentes
export function createQueryKey(key: string, params?: Record<string, any>) {
  if (!params) return [key]
  
  // Serializar parámetros de forma consistente
  const serializedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as Record<string, any>)
  
  return [key, serializedParams]
}