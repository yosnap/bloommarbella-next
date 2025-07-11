'use client'

import { X } from 'lucide-react'

interface ActiveFiltersProps {
  searchTerm: string
  selectedCategories: string[]
  onRemoveSearch: () => void
  onRemoveCategory: (category: string) => void
  onClearAll: () => void
}

export function ActiveFilters({
  searchTerm,
  selectedCategories,
  onRemoveSearch,
  onRemoveCategory,
  onClearAll
}: ActiveFiltersProps) {
  const hasActiveFilters = searchTerm || selectedCategories.length > 0

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
        
        {/* Botón limpiar todo */}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Limpiar todo
          </button>
        )}
      </div>
    </div>
  )
}