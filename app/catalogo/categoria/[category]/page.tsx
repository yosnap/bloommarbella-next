'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CatalogoPage from '../../page'
import { fromUrlFriendly } from '@/lib/utils/url-helpers'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.category) {
      // Convertir slug a nombre legible y redirigir a la URL del catálogo con filtros
      const categoryFromUrl = fromUrlFriendly(params.category as string)
      router.replace(`/catalogo?categories=${encodeURIComponent(categoryFromUrl)}`)
    }
  }, [params.category, router])

  return <CatalogoPage />
}