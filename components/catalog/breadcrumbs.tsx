'use client'

import Link from 'next/link'
import { ChevronRight, Home, Package, Search, Tag, Layers3 } from 'lucide-react'
import { toUrlFriendly } from '@/lib/utils/url-helpers'
import { memo, useMemo } from 'react'

interface BreadcrumbsProps {
  searchTerm?: string
  selectedCategories?: string[]
  selectedBrands?: string[]
}

export const Breadcrumbs = memo(function Breadcrumbs({ searchTerm, selectedCategories = [], selectedBrands = [] }: BreadcrumbsProps) {
  const breadcrumbs = useMemo(() => {
    const items = [
      { name: 'Inicio', href: '/', icon: Home }
    ]

    // Agregar catálogo como segundo nivel
    items.push({ name: 'Catálogo', href: '/catalogo', icon: Package })

    // Agregar filtros activos con URLs amigables
    if (searchTerm) {
      const searchSlug = toUrlFriendly(searchTerm)
      items.push({ 
        name: `Búsqueda: "${searchTerm}"`, 
        href: `/catalogo/search/${searchSlug}`,
        icon: Search
      })
    } else if (selectedBrands.length === 1) {
      const brandSlug = toUrlFriendly(selectedBrands[0])
      items.push({ 
        name: selectedBrands[0], 
        href: `/catalogo/marca/${brandSlug}`,
        icon: Tag
      })
    } else if (selectedCategories.length === 1) {
      const categorySlug = toUrlFriendly(selectedCategories[0])
      items.push({ 
        name: selectedCategories[0], 
        href: `/catalogo/categoria/${categorySlug}`,
        icon: Layers3
      })
    } else if (selectedCategories.length > 1) {
      items.push({ 
        name: `${selectedCategories.length} categorías`, 
        href: `/catalogo?categories=${selectedCategories.join(',')}`,
        icon: Layers3
      })
    } else if (selectedBrands.length > 1) {
      items.push({ 
        name: `${selectedBrands.length} marcas`, 
        href: `/catalogo?brands=${selectedBrands.join(',')}`,
        icon: Tag
      })
    }

    return items
  }, [searchTerm, selectedCategories, selectedBrands])

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index > 0 && <ChevronRight size={14} className="mx-2 text-gray-400" />}
          
          {index === breadcrumbs.length - 1 ? (
            // Último elemento - no es clickeable
            <span className="text-gray-800 font-medium flex items-center gap-1">
              {breadcrumb.icon && <breadcrumb.icon size={16} />}
              {breadcrumb.name}
            </span>
          ) : (
            // Elementos anteriores - clickeables
            <Link
              href={breadcrumb.href}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              {breadcrumb.icon && <breadcrumb.icon size={16} />}
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
})