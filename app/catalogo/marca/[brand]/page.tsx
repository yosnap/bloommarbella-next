'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CatalogoPage from '../../page'

export default function BrandPage() {
  const params = useParams()
  const router = useRouter()
  const [initialFilters, setInitialFilters] = useState<{
    selectedBrands: string[]
    selectedCategories: string[]
    searchTerm: string
  } | null>(null)

  useEffect(() => {
    if (params.brand) {
      // Convertir de URL amigable a nombre real de marca
      const brandName = decodeURIComponent(params.brand as string)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      setInitialFilters({
        selectedBrands: [brandName],
        selectedCategories: [],
        searchTerm: ''
      })
    }
  }, [params.brand])

  if (!initialFilters) {
    return <div>Cargando...</div>
  }

  return <CatalogoPage initialFilters={initialFilters} />
}