'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CatalogoPage from '../../page'

export default function SearchPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.term) {
      // Decodificar término de búsqueda y redirigir
      const searchTerm = decodeURIComponent(params.term as string).replace(/-/g, ' ')
      router.replace(`/catalogo?search=${encodeURIComponent(searchTerm)}`)
    }
  }, [params.term, router])

  return <CatalogoPage />
}