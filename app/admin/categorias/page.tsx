'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Save, RotateCcw } from 'lucide-react'

interface CategoryData {
  name: string
  displayName: string
  count: number
  categorias?: Array<{
    name: string
    displayName: string
    count: number
  }>
}

export default function AdminCategoriasPage() {
  const { success, error } = useToast()
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories')
      const categoriesData = await categoriesResponse.json()
      
      // Fetch hidden categories
      const hiddenResponse = await fetch('/api/admin/hidden-categories')
      const hiddenData = await hiddenResponse.json()
      
      if (categoriesData.success) {
        setCategories(categoriesData.data)
      }
      
      if (hiddenData.success) {
        setHiddenCategories(hiddenData.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      error('Error de conexión', 'No se pudieron cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategoryVisibility = (categoryName: string) => {
    setHiddenCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    )
  }

  const toggleSubcategoryVisibility = (subcategoryName: string) => {
    setHiddenCategories(prev => 
      prev.includes(subcategoryName)
        ? prev.filter(cat => cat !== subcategoryName)
        : [...prev, subcategoryName]
    )
  }

  const saveChanges = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/hidden-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiddenCategories })
      })
      
      if (response.ok) {
        success('Cambios guardados', 'La configuración de categorías se actualizó correctamente')
      } else {
        const errorData = await response.json()
        error('Error al guardar', errorData.error || 'No se pudieron guardar los cambios')
      }
    } catch (err) {
      console.error('Error saving changes:', err)
      error('Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
      setSaving(false)
    }
  }

  const resetChanges = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando categorías...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Configura qué categorías se muestran en el filtro lateral del catálogo
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetChanges}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Resetear
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-[#183a1d] rounded-lg hover:bg-[#2a5530] transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {categories.map((category) => {
                const isCategoryHidden = hiddenCategories.includes(category.name)
                
                return (
                  <div key={category.name} className="border border-gray-200 rounded-lg p-4">
                    {/* Main Category */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleCategoryVisibility(category.name)}
                          className={`p-2 rounded-lg transition-colors ${
                            isCategoryHidden 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {isCategoryHidden ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            isCategoryHidden ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}>
                            {category.displayName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.count.toLocaleString()} productos
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCategoryHidden 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isCategoryHidden ? 'Oculta' : 'Visible'}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {category.categorias && category.categorias.length > 0 && (
                      <div className="ml-8 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Subcategorías:
                        </h4>
                        {category.categorias.map((subcategory) => {
                          const isSubcategoryHidden = hiddenCategories.includes(subcategory.name)
                          
                          return (
                            <div key={subcategory.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleSubcategoryVisibility(subcategory.name)}
                                  className={`p-1 rounded transition-colors ${
                                    isSubcategoryHidden 
                                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                                  }`}
                                >
                                  {isSubcategoryHidden ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                                <div>
                                  <span className={`text-sm font-medium ${
                                    isSubcategoryHidden ? 'text-gray-400 line-through' : 'text-gray-700'
                                  }`}>
                                    {subcategory.displayName}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({subcategory.count.toLocaleString()} productos)
                                  </span>
                                </div>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isSubcategoryHidden 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {isSubcategoryHidden ? 'Oculta' : 'Visible'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-600">Categorías principales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {categories.filter(cat => !hiddenCategories.includes(cat.name)).length}
                  </div>
                  <div className="text-sm text-gray-600">Categorías visibles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {hiddenCategories.length}
                  </div>
                  <div className="text-sm text-gray-600">Elementos ocultos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}