'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslationsLegacy } from '@/hooks/use-translations'

interface GrupoData {
  name: string
  count: number
  categorias: Array<{
    name: string
    count: number
  }>
}

interface CategoryFilterProps {
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
}

export function CategoryFilter({ selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const [grupos, setGrupos] = useState<GrupoData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGrupos, setExpandedGrupos] = useState<string[]>([])
  const [showAllCategories, setShowAllCategories] = useState<Record<string, boolean>>({})
  const [isExpanded, setIsExpanded] = useState(false) // Acordeón principal (colapsado por defecto)
  const { translateTexts, getTranslation } = useTranslationsLegacy('categories')

  useEffect(() => {
    fetchGrupos()
  }, [])

  // Expandir automáticamente si hay filtros activos
  useEffect(() => {
    if (selectedCategories.length > 0 && !isExpanded) {
      setIsExpanded(true)
    }
  }, [selectedCategories.length])

  const fetchGrupos = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        const gruposData = data.data || []
        setGrupos(gruposData)
        
        // Recopilar todos los textos para traducir
        const textsToTranslate: string[] = []
        gruposData.forEach((grupo: GrupoData) => {
          textsToTranslate.push(grupo.name)
          grupo.categorias.forEach(categoria => {
            textsToTranslate.push(categoria.name)
          })
        })
        
        // Cargar traducciones
        if (textsToTranslate.length > 0) {
          await translateTexts(textsToTranslate)
        }
      }
    } catch (error) {
      console.error('Error fetching grupos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleGrupo = (grupoName: string) => {
    setExpandedGrupos(prev => 
      prev.includes(grupoName) 
        ? prev.filter(g => g !== grupoName)
        : [...prev, grupoName]
    )
  }

  const handleGrupoSelect = (grupoName: string) => {
    const newSelectedCategories = selectedCategories.includes(grupoName)
      ? selectedCategories.filter(c => c !== grupoName)
      : [...selectedCategories, grupoName]
    
    onCategoryChange(newSelectedCategories)
  }

  const handleCategoriaSelect = (categoriaName: string) => {
    const newSelectedCategories = selectedCategories.includes(categoriaName)
      ? selectedCategories.filter(c => c !== categoriaName)
      : [...selectedCategories, categoriaName]
    
    onCategoryChange(newSelectedCategories)
  }

  const toggleShowAllCategories = (grupoName: string) => {
    setShowAllCategories(prev => ({
      ...prev,
      [grupoName]: !prev[grupoName]
    }))
  }

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Grupos</h3>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 border border-gray-200 rounded-lg">
      {/* Header del acordeón */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-medium text-gray-700">
          Categorías
          {selectedCategories.length > 0 && (
            <span className="ml-2 text-xs bg-[#183a1d] text-white px-2 py-0.5 rounded-full">
              {selectedCategories.length}
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
          <div className="space-y-3">
        {grupos.map((grupo) => (
          <div key={grupo.name} className="space-y-2">
            {/* Main Grupo */}
            <div className={`flex items-center justify-between rounded-lg transition-colors ${
              expandedGrupos.includes(grupo.name) 
                ? 'bg-[#183a1d]/5 border border-[#183a1d]/20' 
                : 'hover:bg-gray-50'
            }`}>
              <div className="flex items-center flex-1">
                <button
                  onClick={() => toggleGrupo(grupo.name)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedGrupos.includes(grupo.name) ? (
                    <ChevronDown className="h-4 w-4 text-[#183a1d]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                <label className="flex items-center cursor-pointer flex-1 py-2 px-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(grupo.name)}
                    onChange={() => handleGrupoSelect(grupo.name)}
                    className="w-4 h-4 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-2"
                  />
                  <span className={`ml-2 text-sm font-medium flex-1 ${
                    expandedGrupos.includes(grupo.name) 
                      ? 'text-[#183a1d]' 
                      : 'text-gray-700'
                  }`}>
                    {getTranslation(grupo.name)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    expandedGrupos.includes(grupo.name)
                      ? 'text-[#183a1d] bg-[#183a1d]/10'
                      : 'text-gray-500 bg-gray-100'
                  }`}>
                    {grupo.count}
                  </span>
                </label>
              </div>
            </div>

            {/* Categorías */}
            {expandedGrupos.includes(grupo.name) && grupo.categorias.length > 0 && (
              <div className="ml-6 space-y-1 pl-4 border-l-2 border-[#183a1d]/10">
                {grupo.categorias
                  .slice(0, showAllCategories[grupo.name] ? undefined : 5)
                  .map((categoria) => (
                    <label
                      key={categoria.name}
                      className="flex items-center cursor-pointer py-1 px-2 hover:bg-[#183a1d]/5 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(categoria.name)}
                        onChange={() => handleCategoriaSelect(categoria.name)}
                        className="w-4 h-4 text-[#183a1d] bg-gray-100 border-gray-300 rounded focus:ring-[#183a1d] focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-600 flex-1">
                        {getTranslation(categoria.name)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {categoria.count}
                      </span>
                    </label>
                  ))}
                
                {/* Show More button */}
                {grupo.categorias.length > 5 && (
                  <button
                    onClick={() => toggleShowAllCategories(grupo.name)}
                    className="ml-2 text-sm text-[#183a1d] hover:text-[#2a5530] font-medium py-1 px-2 rounded transition-colors hover:bg-[#183a1d]/5"
                  >
                    {showAllCategories[grupo.name] 
                      ? `Menos... (${grupo.categorias.length - 5} ocultas)`
                      : `Más... (${grupo.categorias.length - 5} más)`
                    }
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
          </div>

          {/* Clear filters button */}
          {selectedCategories.length > 0 && (
            <button
              onClick={() => onCategoryChange([])}
              className="mt-4 text-sm text-[#183a1d] hover:text-[#2a5530] font-medium"
            >
              Limpiar filtros ({selectedCategories.length})
            </button>
          )}
        </div>
      )}
    </div>
  )
}