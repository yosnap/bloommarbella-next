'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import CatalogoPage from '../../page'
import { fromUrlFriendly, getCategoryOriginalName } from '@/lib/utils/url-helpers'

export default function CategoryPage() {
  const params = useParams()
  const [initialFilters, setInitialFilters] = useState<{
    selectedBrands: string[]
    selectedCategories: string[]
    searchTerm: string
  } | null>(null)

  useEffect(() => {
    const loadCategoryFilters = async () => {
      if (params.category) {
        // Convertir slug a nombre legible (ej: "material" -> "Material")
        const categoryFromUrl = fromUrlFriendly(params.category as string)
        
        // Usar directamente el nombre de la URL como filtro
        // Esto asume que las URLs ya están en español
        setInitialFilters({
          selectedBrands: [],
          selectedCategories: [categoryFromUrl],
          searchTerm: ''
        })
      }
    }

    loadCategoryFilters()
  }, [params.category])

  if (!initialFilters) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categoría...</p>
        </div>
      </div>
    )
  }

  return <CatalogoPage initialFilters={initialFilters} />
}