'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbsProps {
  searchTerm?: string
  selectedCategories?: string[]
}

export function Breadcrumbs({ searchTerm, selectedCategories = [] }: BreadcrumbsProps) {
  const breadcrumbs = [
    { name: 'Inicio', href: '/', icon: Home }
  ]

  // Agregar catálogo como segundo nivel
  breadcrumbs.push({ name: 'Catálogo', href: '/catalogo' })

  // Agregar filtros activos
  if (selectedCategories.length > 0) {
    if (selectedCategories.length === 1) {
      breadcrumbs.push({ 
        name: selectedCategories[0], 
        href: `/catalogo?categories=${selectedCategories[0]}` 
      })
    } else {
      breadcrumbs.push({ 
        name: `${selectedCategories.length} categorías`, 
        href: `/catalogo?categories=${selectedCategories.join(',')}` 
      })
    }
  }

  if (searchTerm) {
    breadcrumbs.push({ 
      name: `Búsqueda: "${searchTerm}"`, 
      href: `/catalogo?search=${encodeURIComponent(searchTerm)}` 
    })
  }

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
}