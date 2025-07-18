'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import { ChevronDown, ChevronRight, Cloud, Sun, Filter } from 'lucide-react'
import { RangeSlider } from '@/components/ui/range-slider'
import { useCategoryTranslations } from '@/hooks/use-translations'

interface FilterState {
  priceRange: [number, number] | undefined
  heightRange: [number, number] | undefined
  widthRange: [number, number] | undefined
  inStock: boolean
  location: string[]
  plantingSystem: string[]
  colors: string[]
  categories: string[]
}

interface CategoryData {
  name: string
  count: number
  children?: CategoryData[]
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  products: any[]
  dynamicRanges?: {
    priceRange: { min: number; max: number }
    heightRange: { min: number; max: number }
    widthRange: { min: number; max: number }
  }
}

interface ColorOption {
  value: string
  label: string
  color: string
}

const colorOptions: ColorOption[] = [
  { value: 'black', label: 'Black', color: '#000000' },
  { value: 'brown', label: 'Brown', color: '#8B4513' },
  { value: 'grey', label: 'Grey', color: '#808080' },
  { value: 'beige', label: 'Beige', color: '#F5F5DC' },
  { value: 'white', label: 'White', color: '#FFFFFF' },
  { value: 'green', label: 'Green', color: '#228B22' },
  { value: 'terracotta', label: 'Terracotta', color: '#E2725B' }
]

const locationOptions = [
  { value: 'indoor', label: 'Indoor', icon: Cloud },
  { value: 'outdoor', label: 'Outdoor', icon: Sun }
]

const plantingSystemOptions = [
  { value: 'soil', label: 'Soil (Vulkastrat)', icon: '🌱' },
  { value: 'hydro', label: 'Hydroponic', icon: '💧' },
  { value: 'artificial', label: 'Artificial glued', icon: '🎨' }
]

export const AdvancedFilters = memo(function AdvancedFilters({ filters, onFiltersChange, products, dynamicRanges }: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['dimensions'])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const { translate } = useCategoryTranslations()

  // Cargar categorías
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        // Transformar datos de grupos a estructura jerárquica
        const categoryTree = data.data.map((grupo: any) => ({
          name: grupo.name,
          count: grupo.count,
          children: grupo.categorias.map((cat: any) => ({
            name: cat.name,
            count: cat.count
          }))
        }))
        setCategories(categoryTree)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    )
  }

  const handleCategoryClick = (categoryName: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleCategory(categoryName)
    } else {
      // Toggle category selection
      const isSelected = filters.categories.includes(categoryName)
      if (isSelected) {
        updateFilters({ categories: filters.categories.filter(cat => cat !== categoryName) })
      } else {
        updateFilters({ categories: [...filters.categories, categoryName] })
      }
    }
  }

  // Función para verificar si un filtro está activo
  const isFilterActive = (filterType: string) => {
    switch (filterType) {
      case 'dimensions':
        return filters.priceRange !== undefined || 
               filters.heightRange !== undefined || 
               filters.widthRange !== undefined
      case 'stock':
        return filters.inStock
      case 'location':
        return filters.location.length > 0
      case 'colors':
        return filters.colors.length > 0
      case 'planting':
        return filters.plantingSystem.length > 0
      case 'categories':
        return filters.categories.length > 0
      default:
        return false
    }
  }

  // Usar rangos dinámicos proporcionados o calcular basados en productos
  const priceRange = dynamicRanges?.priceRange || (products.length > 0 ? {
    min: Math.floor(Math.min(...products.map(p => p.basePrice * 2.5))),
    max: Math.ceil(Math.max(...products.map(p => p.basePrice * 2.5)))
  } : { min: 0, max: 5000 })

  const heightRange = dynamicRanges?.heightRange || (products.length > 0 ? {
    min: Math.floor(Math.min(...products.map(p => p.specifications?.height || 0))),
    max: Math.ceil(Math.max(...products.map(p => p.specifications?.height || 300)))
  } : { min: 0, max: 300 })

  const widthRange = dynamicRanges?.widthRange || (products.length > 0 ? {
    min: Math.floor(Math.min(...products.map(p => p.specifications?.width || 0))),
    max: Math.ceil(Math.max(...products.map(p => p.specifications?.width || 200)))
  } : { min: 0, max: 200 })

  // Mantener acordeones abiertos cuando hay filtros activos
  useEffect(() => {
    const activeFilters: string[] = []
    
    // Verificar cada filtro individualmente
    if (filters.priceRange !== undefined || filters.heightRange !== undefined || filters.widthRange !== undefined) {
      activeFilters.push('dimensions')
    }
    if (filters.inStock) {
      activeFilters.push('stock')
    }
    if (filters.categories.length > 0) {
      activeFilters.push('categories')
    }
    if (filters.location.length > 0) {
      activeFilters.push('location')
    }
    if (filters.colors.length > 0) {
      activeFilters.push('colors')
    }
    if (filters.plantingSystem.length > 0) {
      activeFilters.push('planting')
    }
    
    setExpandedSections(prev => {
      const newExpanded = [...new Set([...prev, ...activeFilters])]
      return newExpanded
    })
  }, [filters])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }, [])

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }, [filters, onFiltersChange])

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      priceRange: undefined,
      heightRange: undefined,
      widthRange: undefined,
      inStock: false,
      location: [],
      plantingSystem: [],
      colors: [],
      categories: []
    })
  }, [onFiltersChange])

  const formatPrice = (value: number) => `€${value}`
  const formatDimension = (value: number) => `${value}cm`

  // Contar productos por filtro
  const getColorCount = (color: string) => {
    return products.filter(p => 
      p.specifications?.color?.toLowerCase().includes(color.toLowerCase())
    ).length
  }

  const getLocationCount = (location: string) => {
    return products.filter(p => 
      p.specifications?.location?.toLowerCase().includes(location.toLowerCase())
    ).length
  }

  const getPlantingSystemCount = (system: string) => {
    return products.filter(p => {
      const desc = p.description?.toLowerCase() || ''
      return desc.includes(system.toLowerCase())
    }).length
  }

  return (
    <div className="w-full max-w-xs space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-[#183a1d]" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      {/* Dimensions (Price, Height, Width) */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('dimensions')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Dimensions & Price</span>
          {expandedSections.includes('dimensions') ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.includes('dimensions') && (
          <div className="px-4 pb-4 space-y-6">
            {/* Price Range */}
            <div>
              <RangeSlider
                min={priceRange.min}
                max={priceRange.max}
                step={5}
                value={filters.priceRange || [priceRange.min, priceRange.max]}
                onValueCommit={(value) => updateFilters({ priceRange: value })}
                formatLabel={formatPrice}
                label="Price"
                showInputs={true}
              />
            </div>
            
            {/* Height Range */}
            <div>
              <RangeSlider
                min={heightRange.min}
                max={heightRange.max}
                step={5}
                value={filters.heightRange || [heightRange.min, heightRange.max]}
                onValueCommit={(value) => updateFilters({ heightRange: value })}
                formatLabel={formatDimension}
                label="Height"
                showInputs={true}
              />
            </div>
            
            {/* Width Range */}
            <div>
              <RangeSlider
                min={widthRange.min}
                max={widthRange.max}
                step={2}
                value={filters.widthRange || [widthRange.min, widthRange.max]}
                onValueCommit={(value) => updateFilters({ widthRange: value })}
                formatLabel={formatDimension}
                label="Width"
                showInputs={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* In Stock */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('stock')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">In stock</span>
          {expandedSections.includes('stock') ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.includes('stock') && (
          <div className="px-4 pb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => updateFilters({ inStock: e.target.checked })}
                className="w-4 h-4 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-2"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Categories</span>
          <span className="text-xs bg-[#183a1d] text-white px-2 py-1 rounded-full">
            {filters.categories.length}
          </span>
          {expandedSections.includes('categories') ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.includes('categories') && (
          <div className="px-4 pb-4 max-h-64 overflow-y-auto">
            {categoriesLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {categories.map((category) => (
                  <div key={category.name}>
                    {/* Categoría principal */}
                    <div className={`flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors ${
                      filters.categories.includes(category.name) ? 'bg-[#183a1d]/5' : ''
                    }`}>
                      <div className="flex items-center gap-2 flex-1">
                        {category.children?.length ? (
                          <button
                            onClick={() => toggleCategory(category.name)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {expandedCategories.includes(category.name) ? (
                              <ChevronDown className="h-3 w-3 text-[#183a1d]" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-gray-500" />
                            )}
                          </button>
                        ) : (
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category.name)}
                            onChange={() => handleCategoryClick(category.name, false)}
                            className="w-3 h-3 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-1"
                          />
                        )}
                        <span
                          className={`text-xs font-medium cursor-pointer flex-1 ${
                            filters.categories.includes(category.name) ? 'text-[#183a1d]' : 'text-gray-700'
                          }`}
                          onClick={() => handleCategoryClick(category.name, !!(category.children?.length))}
                        >
                          {translate(category.name)}
                        </span>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        filters.categories.includes(category.name)
                          ? 'text-[#183a1d] bg-[#183a1d]/10'
                          : 'text-gray-500 bg-gray-100'
                      }`}>
                        {category.count}
                      </span>
                    </div>

                    {/* Subcategorías */}
                    {expandedCategories.includes(category.name) && category.children && (
                      <div className="ml-4 space-y-1">
                        {category.children.map((subcategory) => (
                          <label
                            key={subcategory.name}
                            className={`flex items-center justify-between py-1 px-2 cursor-pointer hover:bg-gray-100 rounded transition-colors ${
                              filters.categories.includes(subcategory.name) ? 'bg-[#183a1d]/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="checkbox"
                                checked={filters.categories.includes(subcategory.name)}
                                onChange={() => handleCategoryClick(subcategory.name, false)}
                                className="w-3 h-3 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-1"
                              />
                              <span className={`text-xs ${
                                filters.categories.includes(subcategory.name) ? 'text-[#183a1d] font-medium' : 'text-gray-600'
                              }`}>
                                {translate(subcategory.name)}
                              </span>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              filters.categories.includes(subcategory.name)
                                ? 'text-[#183a1d] bg-[#183a1d]/10'
                                : 'text-gray-500 bg-gray-100'
                            }`}>
                              {subcategory.count}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Location</span>
          <span className="text-xs bg-[#183a1d] text-white px-2 py-1 rounded-full">
            {filters.location.length}
          </span>
          {expandedSections.includes('location') ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.includes('location') && (
          <div className="px-4 pb-4 space-y-3">
            {locationOptions.map((option) => {
              const Icon = option.icon
              const count = getLocationCount(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    const newLocation = filters.location.includes(option.value)
                      ? filters.location.filter(l => l !== option.value)
                      : [...filters.location, option.value]
                    updateFilters({ location: newLocation })
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    filters.location.includes(option.value)
                      ? 'border-[#183a1d] bg-[#183a1d]/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    filters.location.includes(option.value)
                      ? 'bg-[#183a1d] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left text-sm">{option.label}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('colors')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Colour</span>
          <span className="text-xs bg-[#183a1d] text-white px-2 py-1 rounded-full">
            {filters.colors.length}
          </span>
          {expandedSections.includes('colors') ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.includes('colors') && (
          <div className="px-4 pb-4 space-y-2">
            {colorOptions.map((color) => {
              const count = getColorCount(color.value)
              const isSelected = filters.colors.includes(color.value)
              
              return (
                <label
                  key={color.value}
                  className="flex items-center gap-3 cursor-pointer py-2 px-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded border-2 ${
                        color.value === 'white' ? 'border-gray-300' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.color }}
                    />
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newColors = e.target.checked
                          ? [...filters.colors, color.value]
                          : filters.colors.filter(c => c !== color.value)
                        updateFilters({ colors: newColors })
                      }}
                      className="w-4 h-4 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-2"
                    />
                  </div>
                  <span className="flex-1 text-sm text-gray-700">{color.label}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Planting System */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('planting')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Planting system</span>
          <span className="text-xs bg-[#183a1d] text-white px-2 py-1 rounded-full">
            {filters.plantingSystem.length}
          </span>
          {expandedSections.includes('planting') ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.includes('planting') && (
          <div className="px-4 pb-4 space-y-2">
            {plantingSystemOptions.map((option) => {
              const count = getPlantingSystemCount(option.value)
              const isSelected = filters.plantingSystem.includes(option.value)
              
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer py-2 px-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newSystems = e.target.checked
                          ? [...filters.plantingSystem, option.value]
                          : filters.plantingSystem.filter(s => s !== option.value)
                        updateFilters({ plantingSystem: newSystems })
                      }}
                      className="w-4 h-4 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-2"
                    />
                  </div>
                  <span className="flex-1 text-sm text-gray-700">{option.label}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})