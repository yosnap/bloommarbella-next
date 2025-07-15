'use client'

import Link from 'next/link'
import { ChevronRight, Home, Package, Layers3, Tag } from 'lucide-react'
import { translateCategory, translateSubcategory } from '@/lib/translations'
import { useState, useEffect } from 'react'

interface ProductBreadcrumbsProps {
  productName: string
  category?: string
  subcategory?: string
}

export function ProductBreadcrumbs({ productName, category, subcategory }: ProductBreadcrumbsProps) {
  const [translatedCategory, setTranslatedCategory] = useState(category || '')
  const [translatedSubcategory, setTranslatedSubcategory] = useState(subcategory || '')

  // Traducir categorías usando el API dinámico
  useEffect(() => {
    const translateCategories = async () => {
      try {
        const textsToTranslate = []
        if (category) textsToTranslate.push(category)
        if (subcategory && subcategory !== category) textsToTranslate.push(subcategory)

        if (textsToTranslate.length === 0) return

        const response = await fetch('/api/translations/public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            texts: textsToTranslate,
            category: 'categories'
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.translations) {
            if (category) {
              setTranslatedCategory(data.translations[0] || category)
            }
            if (subcategory && subcategory !== category) {
              const subcategoryIndex = category ? 1 : 0
              setTranslatedSubcategory(data.translations[subcategoryIndex] || subcategory)
            }
          } else {
            // Fallback a traducciones estáticas
            if (category) setTranslatedCategory(translateCategory(category))
            if (subcategory) setTranslatedSubcategory(translateSubcategory(subcategory))
          }
        } else {
          // Fallback a traducciones estáticas
          if (category) setTranslatedCategory(translateCategory(category))
          if (subcategory) setTranslatedSubcategory(translateSubcategory(subcategory))
        }
      } catch (error) {
        console.error('Error translating categories:', error)
        // Fallback a traducciones estáticas
        if (category) setTranslatedCategory(translateCategory(category))
        if (subcategory) setTranslatedSubcategory(translateSubcategory(subcategory))
      }
    }

    translateCategories()
  }, [category, subcategory])
  const breadcrumbs = [
    { name: 'Inicio', href: '/', icon: Home }
  ]

  // Agregar catálogo como segundo nivel
  breadcrumbs.push({ name: 'Catálogo', href: '/catalogo', icon: Package })

  // Agregar categoría si existe
  if (category) {
    breadcrumbs.push({ 
      name: translatedCategory, 
      href: `/catalogo?categories=${encodeURIComponent(category)}`,
      icon: Layers3
    })
  }

  // Agregar subcategoría si existe y es diferente de la categoría
  if (subcategory && subcategory !== category) {
    breadcrumbs.push({ 
      name: translatedSubcategory, 
      href: `/catalogo?categories=${encodeURIComponent(subcategory)}`,
      icon: Tag
    })
  }

  // Agregar producto actual (no clickeable)
  breadcrumbs.push({ name: productName, href: '', icon: Package })

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