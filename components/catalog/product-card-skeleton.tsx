'use client'

import { memo } from 'react'

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list'
  className?: string
}

export const ProductCardSkeleton = memo(function ProductCardSkeleton({ 
  viewMode = 'grid', 
  className = '' 
}: ProductCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 animate-pulse ${className}`}>
        <div className="flex gap-4">
          {/* Imagen */}
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
          
          {/* Contenido */}
          <div className="flex-1 space-y-2">
            {/* Título */}
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            
            {/* Descripción */}
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            
            {/* Precio */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          
          {/* Acciones */}
          <div className="flex flex-col justify-between items-end">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className}`}>
      {/* Imagen */}
      <div className="w-full h-48 bg-gray-200"></div>
      
      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        
        {/* Descripción */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Precio */}
        <div className="flex items-center justify-between mt-4">
          <div className="space-y-1">
            <div className="h-5 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        
        {/* Botón */}
        <div className="w-full h-10 bg-gray-200 rounded mt-4"></div>
      </div>
    </div>
  )
})

// Componente para mostrar múltiples skeletons
export const ProductSkeletonGrid = memo(function ProductSkeletonGrid({ 
  count = 12, 
  viewMode = 'grid' 
}: { 
  count?: number
  viewMode?: 'grid' | 'list' 
}) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <ProductCardSkeleton key={i} viewMode={viewMode} />
  ))

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {skeletons}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletons}
    </div>
  )
})