'use client'

import { X } from 'lucide-react'
import { memo, useCallback } from 'react'

interface ActiveFiltersProps {
  searchTerm: string
  selectedCategories: string[]
  selectedBrands: string[]
  onRemoveSearch: () => void
  onRemoveCategory: (category: string) => void
  onRemoveBrand: (brand: string) => void
  onClearAll: () => void
}

export const ActiveFilters = memo(function ActiveFilters({
  searchTerm,
  selectedCategories,
  selectedBrands,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveBrand,
  onClearAll
}: ActiveFiltersProps) {
  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || selectedBrands.length > 0

  const handleClearAll = useCallback(() => {
    onClearAll()
  }, [onClearAll])

  if (!hasActiveFilters) return null

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
        
        {/* Filtro de búsqueda */}
        {searchTerm && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f0a04b] text-white text-sm rounded-full">
            Búsqueda: "{searchTerm}"
            <button
              onClick={onRemoveSearch}
              className="hover:bg-[#e8941f] rounded-full p-0.5 ml-1"
            >
              <X size={12} />
            </button>
          </span>
        )}
        
        {/* Filtros de categorías */}
        {selectedCategories.map(category => (
          <span
            key={category}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#f0a04b] text-white text-sm rounded-full"
          >
            {category}
            <button
              onClick={() => onRemoveCategory(category)}
              className="hover:bg-[#e8941f] rounded-full p-0.5 ml-1"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        
        {/* Filtros de marcas */}
        {selectedBrands.map(brand => (
          <span
            key={brand}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#183a1d] text-white text-sm rounded-full"
          >
            Marca: {brand}
            <button
              onClick={() => onRemoveBrand(brand)}
              className="hover:bg-[#2a5530] rounded-full p-0.5 ml-1"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        
        {/* Botón limpiar todo */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Limpiar todo
          </button>
        )}
      </div>
    </div>
  )
})