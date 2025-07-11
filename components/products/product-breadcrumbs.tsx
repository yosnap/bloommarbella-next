'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface ProductBreadcrumbsProps {
  productName: string
  category?: string
  subcategory?: string
}

export function ProductBreadcrumbs({ productName, category, subcategory }: ProductBreadcrumbsProps) {
  const breadcrumbs = [
    { name: 'Inicio', href: '/', icon: Home }
  ]

  // Agregar catálogo como segundo nivel
  breadcrumbs.push({ name: 'Catálogo', href: '/catalogo' })

  // Agregar categoría si existe
  if (category) {
    breadcrumbs.push({ 
      name: category, 
      href: `/catalogo?categories=${encodeURIComponent(category)}` 
    })
  }

  // Agregar subcategoría si existe y es diferente de la categoría
  if (subcategory && subcategory !== category) {
    breadcrumbs.push({ 
      name: subcategory, 
      href: `/catalogo?categories=${encodeURIComponent(subcategory)}` 
    })
  }

  // Agregar producto actual (no clickeable)
  breadcrumbs.push({ name: productName, href: '' })

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight size={14} className="mx-2 text-gray-400" />}
              
              {index === breadcrumbs.length - 1 ? (
                // Último elemento (producto actual) - no es clickeable
                <span className="text-gray-800 font-medium flex items-center gap-1 truncate max-w-xs">
                  {breadcrumb.icon && <breadcrumb.icon size={16} />}
                  {breadcrumb.name}
                </span>
              ) : (
                // Elementos anteriores - clickeables
                <Link
                  href={breadcrumb.href}
                  className="text-gray-600 hover:text-[#183a1d] flex items-center gap-1 transition-colors"
                >
                  {breadcrumb.icon && <breadcrumb.icon size={16} />}
                  {breadcrumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}