'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CatalogoPage from '../../page'

export default function BrandPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.brand) {
      // Convertir de URL amigable a nombre real de marca y redirigir
      const brandName = decodeURIComponent(params.brand as string)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      router.replace(`/catalogo?brands=${encodeURIComponent(brandName)}`)
    }
  }, [params.brand, router])

  return <CatalogoPage />
}