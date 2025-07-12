'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface BrandData {
  name: string
  count: number
}

interface BrandFilterProps {
  selectedBrands: string[]
  onBrandChange: (brands: string[]) => void
  filterCounts?: Array<{name: string, count: number}>
}

export function BrandFilter({ selectedBrands, onBrandChange, filterCounts }: BrandFilterProps) {
  const [brands, setBrands] = useState<BrandData[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false) // Acordeón principal (colapsado por defecto)

  // Usar filterCounts si están disponibles, sino cargar desde API
  useEffect(() => {
    if (filterCounts) {
      setBrands(filterCounts.map(f => ({ name: f.name, count: f.count })).sort((a, b) => a.name.localeCompare(b.name)))
      setLoading(false)
    } else {
      fetchBrands()
    }
  }, [filterCounts])

  // Expandir automáticamente si hay filtros activos
  useEffect(() => {
    if (selectedBrands.length > 0 && !isExpanded) {
      setIsExpanded(true)
    }
  }, [selectedBrands.length])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBrandSelect = (brandName: string) => {
    const newSelectedBrands = selectedBrands.includes(brandName)
      ? selectedBrands.filter(b => b !== brandName)
      : [...selectedBrands, brandName]
    
    onBrandChange(newSelectedBrands)
  }

  if (loading) {
    return (
      <div className="mb-6 border border-gray-200 rounded-lg">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700">Marcas</h3>
        </div>
      </div>
    )
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <div className="mb-6 border border-gray-200 rounded-lg">
      {/* Header del acordeón */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-medium text-gray-700">
          Marcas
          {selectedBrands.length > 0 && (
            <span className="ml-2 text-xs bg-[#183a1d] text-white px-2 py-0.5 rounded-full">
              {selectedBrands.length}
            </span>
          )}
        </h3>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {/* Contenido del acordeón */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {brands.map((brand) => (
              <label
                key={brand.name}
                className="flex items-center cursor-pointer py-1 px-2 hover:bg-[#183a1d]/5 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.name)}
                  onChange={() => handleBrandSelect(brand.name)}
                  className="w-4 h-4 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600 flex-1">
                  {brand.name}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {brand.count}
                </span>
              </label>
            ))}
          </div>

          {/* Clear brands filter button */}
          {selectedBrands.length > 0 && (
            <button
              onClick={() => onBrandChange([])}
              className="mt-4 text-sm text-[#183a1d] hover:text-[#2a5530] font-medium"
            >
              Limpiar marcas ({selectedBrands.length})
            </button>
          )}
        </div>
      )}
    </div>
  )
}