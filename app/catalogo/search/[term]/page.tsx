'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import CatalogoPage from '../../page'

export default function SearchPage() {
  const params = useParams()
  const [initialFilters, setInitialFilters] = useState<{
    selectedBrands: string[]
    selectedCategories: string[]
    searchTerm: string
  } | null>(null)

  useEffect(() => {
    if (params.term) {
      // Decodificar término de búsqueda
      const searchTerm = decodeURIComponent(params.term as string).replace(/-/g, ' ')
      
      setInitialFilters({
        selectedBrands: [],
        selectedCategories: [],
        searchTerm
      })
    }
  }, [params.term])

  if (!initialFilters) {
    return <div>Cargando...</div>
  }

  return <CatalogoPage initialFilters={initialFilters} />
}