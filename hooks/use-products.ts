'use client'

import { useState, useEffect } from 'react'
import type { TransformedProduct } from '@/lib/nieuwkoop/transformers'

interface ProductFilters {
  category?: string
  subcategory?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  availability?: 'in_stock' | 'out_of_stock' | 'limited'
  featured?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

interface UseProductsResult {
  products: TransformedProduct[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null
  refetch: () => void
  setFilters: (filters: ProductFilters) => void
  filters: ProductFilters
}

export function useProducts(initialFilters: ProductFilters = {}): UseProductsResult {
  const [products, setProducts] = useState<TransformedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value))
        }
      })

      const response = await fetch(`/api/products?${queryParams.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar productos')
      }

      if (data.success) {
        setProducts(data.data || [])
        setPagination(data.pagination || null)
      } else {
        throw new Error(data.error || 'Error en la respuesta')
      }
    } catch (err: any) {
      setError(err.message)
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const refetch = () => {
    fetchProducts()
  }

  const updateFilters = (newFilters: ProductFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })) // Reset to page 1 when filters change
  }

  return {
    products,
    loading,
    error,
    pagination,
    refetch,
    setFilters: updateFilters,
    filters
  }
}

interface UseProductResult {
  product: TransformedProduct | null
  relatedProducts: Partial<TransformedProduct>[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<TransformedProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Partial<TransformedProduct>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar producto')
      }

      if (data.success) {
        setProduct(data.data)
        setRelatedProducts(data.related || [])
      } else {
        throw new Error(data.error || 'Producto no encontrado')
      }
    } catch (err: any) {
      setError(err.message)
      setProduct(null)
      setRelatedProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  const refetch = () => {
    fetchProduct()
  }

  return {
    product,
    relatedProducts,
    loading,
    error,
    refetch
  }
}

interface Category {
  name: string
  slug: string
  displayName: string
  count: number
  subcategories: Array<{
    name: string
    slug: string
    displayName: string
    count: number
  }>
}

interface UseCategoriesResult {
  categories: Category[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/categories')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar categorías')
      }

      if (data.success) {
        setCategories(data.data || [])
      } else {
        throw new Error(data.error || 'Error en la respuesta')
      }
    } catch (err: any) {
      setError(err.message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const refetch = () => {
    fetchCategories()
  }

  return {
    categories,
    loading,
    error,
    refetch
  }
}