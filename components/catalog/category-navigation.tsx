'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCategoryTranslations } from '@/hooks/use-translations'

interface CategoryData {
  name: string
  count: number
  children?: CategoryData[]
}

interface CategoryNavigationProps {
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
}

export function CategoryNavigation({ selectedCategories, onCategoryChange }: CategoryNavigationProps) {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { translate } = useCategoryTranslations()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
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
      setLoading(false)
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
      const isSelected = selectedCategories.includes(categoryName)
      if (isSelected) {
        onCategoryChange(selectedCategories.filter(cat => cat !== categoryName))
      } else {
        onCategoryChange([...selectedCategories, categoryName])
      }
    }
  }

  const handleClearCategories = () => {
    onCategoryChange([])
  }

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Categories</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <div key={category.name} className="border-b border-gray-100 last:border-b-0">
            {/* Categoría principal */}
            <div className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${
                selectedCategories.includes(category.name) ? 'bg-[#183a1d]/5' : ''
              }`}>
              <div className="flex items-center gap-2 flex-1">
                {category.children?.length ? (
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedCategories.includes(category.name) ? (
                      <ChevronDown className="h-4 w-4 text-[#183a1d]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                ) : (
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryClick(category.name, false)}
                    className="w-4 h-4 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-2"
                  />
                )}
                <span
                  className={`text-sm font-medium cursor-pointer flex-1 ${
                    selectedCategories.includes(category.name) ? 'text-[#183a1d]' : 'text-gray-700'
                  }`}
                  onClick={() => handleCategoryClick(category.name, !!(category.children?.length))}
                >
                  {translate(category.name)}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedCategories.includes(category.name)
                  ? 'text-[#183a1d] bg-[#183a1d]/10'
                  : 'text-gray-500 bg-gray-100'
              }`}>
                {category.count}
              </span>
            </div>

            {/* Subcategorías */}
            {expandedCategories.includes(category.name) && category.children && (
              <div className="bg-gray-50/50">
                {category.children.map((subcategory) => (
                  <label
                    key={subcategory.name}
                    className={`w-full flex items-center justify-between pl-8 pr-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedCategories.includes(subcategory.name) ? 'bg-[#183a1d]/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(subcategory.name)}
                        onChange={() => handleCategoryClick(subcategory.name, false)}
                        className="w-4 h-4 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-2"
                      />
                      <span className={`text-sm ${
                        selectedCategories.includes(subcategory.name) ? 'text-[#183a1d] font-medium' : 'text-gray-600'
                      }`}>
                        {translate(subcategory.name)}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategories.includes(subcategory.name)
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

      {/* Clear selection */}
      {selectedCategories.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleClearCategories}
            className="text-sm text-[#f0a04b] hover:text-[#e69440] font-medium"
          >
            Clear categories ({selectedCategories.length})
          </button>
        </div>
      )}
    </div>
  )
}