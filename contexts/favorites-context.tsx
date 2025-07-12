'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'

interface FavoriteProduct {
  id: string
  nieuwkoopId: string
  sku: string
  slug: string
  name: string
  description: string
  category: string
  subcategory: string
  basePrice: number
  stock: number
  images: string[]
  specifications: any
  active: boolean
  createdAt: string
  updatedAt: string
}

interface Favorite {
  id: string
  createdAt: string
  product: FavoriteProduct
}

interface FavoritesContextType {
  favorites: Favorite[]
  favoriteIds: Set<string>
  favoritesCount: number
  loading: boolean
  addToFavorites: (productId: string, productName?: string) => Promise<boolean>
  removeFromFavorites: (productId: string, productName?: string) => Promise<boolean>
  toggleFavorite: (productId: string, productName?: string) => Promise<boolean>
  isFavorite: (productId: string) => boolean
  refetch: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { success, error } = useToast()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // localStorage key for anonymous users
  const ANONYMOUS_FAVORITES_KEY = 'anonymous_favorites'

  // Anonymous favorites functions
  const getAnonymousFavorites = (): string[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(ANONYMOUS_FAVORITES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  const setAnonymousFavorites = (productIds: string[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(ANONYMOUS_FAVORITES_KEY, JSON.stringify(productIds))
    } catch (error) {
      console.error('Error saving anonymous favorites:', error)
    }
  }

  const addAnonymousFavorite = async (productId: string) => {
    const current = getAnonymousFavorites()
    if (!current.includes(productId)) {
      setAnonymousFavorites([...current, productId])
      setFavoriteIds(prev => {
        const newSet = new Set([...prev, productId])
        console.log('🔥 CONTEXT addAnonymousFavorite - New favoriteIds size:', newSet.size)
        return newSet
      })
      
      // Cargar datos del producto y agregarlo a la lista de favoritos
      try {
        const response = await fetch(`/api/products/id/${productId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.product) {
            const newFavorite = {
              id: `anonymous_${productId}`,
              createdAt: new Date().toISOString(),
              product: data.product
            }
            setFavorites(prev => [newFavorite, ...prev])
          }
        }
      } catch (error) {
        console.error('Error loading product for anonymous favorite:', error)
      }
    }
  }

  const removeAnonymousFavorite = (productId: string) => {
    const current = getAnonymousFavorites()
    setAnonymousFavorites(current.filter(id => id !== productId))
    setFavoriteIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      console.log('🔥 CONTEXT removeAnonymousFavorite - New favoriteIds size:', newSet.size)
      return newSet
    })
    
    // Remover el producto de la lista de favoritos
    setFavorites(prev => prev.filter(f => f.product.id !== productId))
  }

  const loadAnonymousFavorites = async () => {
    const anonymousFavorites = getAnonymousFavorites()
    setFavoriteIds(new Set(anonymousFavorites))
    console.log('🔥 CONTEXT loadAnonymousFavorites - size:', anonymousFavorites.length)
    
    // Cargar datos completos de productos para favoritos anónimos
    if (anonymousFavorites.length > 0) {
      try {
        setLoading(true)
        const productsData = []
        
        for (const productId of anonymousFavorites) {
          const response = await fetch(`/api/products/id/${productId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.product) {
              // Crear estructura similar a favoritos autenticados
              productsData.push({
                id: `anonymous_${productId}`,
                createdAt: new Date().toISOString(),
                product: data.product
              })
            }
          }
        }
        
        setFavorites(productsData)
        console.log('🔥 CONTEXT loadAnonymousFavorites - loaded products:', productsData.length)
      } catch (error) {
        console.error('Error loading anonymous favorites products:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const syncAnonymousFavorites = async () => {
    const anonymousFavorites = getAnonymousFavorites()
    
    if (anonymousFavorites.length === 0) return

    try {
      for (const productId of anonymousFavorites) {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })
      }
      
      setAnonymousFavorites([])
    } catch (error) {
      console.error('Error syncing anonymous favorites:', error)
    }
  }

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      await loadAnonymousFavorites()
      setInitialized(true)
      return
    }

    try {
      setLoading(true)
      
      await syncAnonymousFavorites()
      
      const response = await fetch('/api/favorites')
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      setFavorites(data.favorites || [])
      setFavoriteIds(new Set(data.favorites?.map((f: Favorite) => f.product.id) || []))
      setInitialized(true)
      console.log('🔥 CONTEXT fetchFavorites - authenticated size:', data.favorites?.length || 0)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToFavorites = async (productId: string, productName?: string) => {
    if (!isAuthenticated) {
      await addAnonymousFavorite(productId)
      success('Agregado a favoritos', productName ? `${productName} agregado a tus favoritos` : 'Producto agregado a favoritos')
      return true
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add to favorites')
      }

      const data = await response.json()
      
      setFavorites(prev => [data.favorite, ...prev])
      setFavoriteIds(prev => {
        const newSet = new Set([...prev, productId])
        console.log('🔥 CONTEXT addToFavorites (authenticated) - New favoriteIds size:', newSet.size)
        return newSet
      })
      
      success('Agregado a favoritos', productName ? `${productName} agregado a tus favoritos` : 'Producto agregado a favoritos')
      return true
    } catch (err) {
      console.error('Error adding to favorites:', err)
      error('Error al agregar', err instanceof Error ? err.message : 'Error al agregar a favoritos')
      return false
    }
  }

  const removeFromFavorites = async (productId: string, productName?: string) => {
    if (!isAuthenticated) {
      removeAnonymousFavorite(productId)
      success('Eliminado de favoritos', productName ? `${productName} eliminado de tus favoritos` : 'Producto eliminado de favoritos')
      return true
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove from favorites')
      }

      setFavorites(prev => prev.filter(f => f.product.id !== productId))
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        console.log('🔥 CONTEXT removeFromFavorites (authenticated) - New favoriteIds size:', newSet.size)
        return newSet
      })
      
      success('Eliminado de favoritos', productName ? `${productName} eliminado de tus favoritos` : 'Producto eliminado de favoritos')
      return true
    } catch (err) {
      console.error('Error removing from favorites:', err)
      error('Error al eliminar', err instanceof Error ? err.message : 'Error al eliminar de favoritos')
      return false
    }
  }

  const toggleFavorite = async (productId: string, productName?: string) => {
    if (favoriteIds.has(productId)) {
      return await removeFromFavorites(productId, productName)
    } else {
      return await addToFavorites(productId, productName)
    }
  }

  const isFavorite = (productId: string) => {
    return favoriteIds.has(productId)
  }

  // Load favorites on mount and when authentication status changes
  useEffect(() => {
    fetchFavorites()
  }, [isAuthenticated])

  // Initialize on mount - fetchFavorites handles both authenticated and anonymous users
  useEffect(() => {
    if (!initialized) {
      fetchFavorites()
    }
  }, [initialized])

  const value: FavoritesContextType = {
    favorites,
    favoriteIds,
    favoritesCount: favoriteIds.size,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}