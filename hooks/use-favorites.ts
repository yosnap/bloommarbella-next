'use client'

import { useState, useEffect } from 'react'
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

export function useFavorites() {
  const { isAuthenticated } = useAuth()
  const { success, error } = useToast()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

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

  const addAnonymousFavorite = (productId: string) => {
    const current = getAnonymousFavorites()
    if (!current.includes(productId)) {
      setAnonymousFavorites([...current, productId])
      setFavoriteIds(prev => new Set([...prev, productId]))
    }
  }

  const removeAnonymousFavorite = (productId: string) => {
    const current = getAnonymousFavorites()
    setAnonymousFavorites(current.filter(id => id !== productId))
    setFavoriteIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      // Load anonymous favorites from localStorage
      const anonymousFavorites = getAnonymousFavorites()
      setFavoriteIds(new Set(anonymousFavorites))
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/favorites')
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      setFavorites(data.favorites || [])
      setFavoriteIds(new Set(data.favorites?.map((f: Favorite) => f.product.id) || []))
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToFavorites = async (productId: string, productName?: string) => {
    if (!isAuthenticated) {
      // Handle anonymous user
      addAnonymousFavorite(productId)
      success('Agregado a favoritos', productName ? `${productName} agregado a tus favoritos` : 'Producto agregado a favoritos')
      return true
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add to favorites')
      }

      const data = await response.json()
      
      // Update local state
      setFavorites(prev => [data.favorite, ...prev])
      setFavoriteIds(prev => new Set([...prev, productId]))
      
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
      // Handle anonymous user
      removeAnonymousFavorite(productId)
      success('Eliminado de favoritos', productName ? `${productName} eliminado de tus favoritos` : 'Producto eliminado de favoritos')
      return true
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove from favorites')
      }

      // Update local state
      setFavorites(prev => prev.filter(f => f.product.id !== productId))
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
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

  useEffect(() => {
    fetchFavorites()
  }, [isAuthenticated])

  return {
    favorites,
    favoriteIds,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  }
}