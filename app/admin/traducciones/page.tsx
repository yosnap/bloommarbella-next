'use client'

import { useState, useEffect, useRef } from 'react'
import { Languages, Save, Plus, Search, CheckCircle, AlertCircle, Table, List } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { useToast } from '@/hooks/use-toast'

interface Translation {
  englishText: string
  spanishText: string | null
}

interface CategoryString {
  englishText: string
  spanishText: string | null
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'categories', label: 'Categorías' },
  { value: 'subcategories', label: 'Subcategorías' },
  { value: 'materials', label: 'Materiales' },
  { value: 'countries', label: 'Países' },
  { value: 'tag-codes', label: 'Códigos de etiquetas' },
  { value: 'tag-values', label: 'Valores de etiquetas' }
]

export default function TranslationsPage() {
  const { success, error, warning } = useToast()
  const [selectedCategory, setSelectedCategory] = useState('categories')
  const [viewMode, setViewMode] = useState<'individual' | 'batch'>('individual')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Individual mode
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState('')
  const [spanishTranslation, setSpanishTranslation] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Batch mode
  const [categoryStrings, setCategoryStrings] = useState<CategoryString[]>([])
  const [batchTranslations, setBatchTranslations] = useState<{[key: string]: string}>({})
  const [stats, setStats] = useState({
    total: 0,
    untranslated: 0
  })

  // Buscar sugerencias mientras escribo
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 1 && viewMode === 'individual') {
        fetchSuggestions()
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm, selectedCategory, viewMode])

  // Cargar cadenas de categoría cuando cambie la categoría en modo batch
  useEffect(() => {
    if (viewMode === 'batch') {
      fetchCategoryStrings()
    }
  }, [selectedCategory, viewMode])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/translations/suggestions?category=${selectedCategory}&query=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(data.suggestions?.length > 0)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const fetchCategoryStrings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/translations/category-strings?category=${selectedCategory}`)
      if (response.ok) {
        const data = await response.json()
        setCategoryStrings(data.strings || [])
        setStats({
          total: data.totalCount || 0,
          untranslated: data.untranslatedCount || 0
        })
        
        // Inicializar traducciones batch
        const initialTranslations: {[key: string]: string} = {}
        data.strings.forEach((str: CategoryString) => {
          initialTranslations[str.englishText] = str.spanishText || ''
        })
        setBatchTranslations(initialTranslations)
      }
    } catch (error) {
      console.error('Error fetching category strings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setSelectedSuggestion(suggestion)
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    setSpanishTranslation('')
  }

  const handleAddTranslation = async () => {
    if (!selectedSuggestion || !spanishTranslation) {
      warning('Campos incompletos', 'Por favor complete todos los campos')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/translations/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          englishText: selectedSuggestion,
          spanishText: spanishTranslation,
          action: 'add'
        })
      })

      if (response.ok) {
        success('Traducción guardada', `"${selectedSuggestion}" → "${spanishTranslation}"`)
        setSelectedSuggestion('')
        setSpanishTranslation('')
        setSearchTerm('')
        setSuggestions([])
      } else {
        const errorData = await response.json()
        error('Error al guardar', errorData.error || 'No se pudo guardar la traducción')
      }
    } catch (err) {
      console.error('Error adding translation:', err)
      error('Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
      setSaving(false)
    }
  }

  const handleBatchTranslationChange = (englishText: string, spanishText: string) => {
    setBatchTranslations(prev => ({
      ...prev,
      [englishText]: spanishText
    }))
  }

  const handleSaveBatchTranslations = async () => {
    // Filtrar solo las traducciones que tienen contenido
    const validTranslations = Object.entries(batchTranslations)
      .filter(([_, spanishText]) => spanishText.trim() !== '')
      .map(([englishText, spanishText]) => ({
        englishText,
        spanishText: spanishText.trim()
      }))

    if (validTranslations.length === 0) {
      warning('Sin traducciones', 'No hay traducciones para guardar')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/translations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          translations: validTranslations
        })
      })

      if (response.ok) {
        const data = await response.json()
        success('Traducciones guardadas', `${validTranslations.length} traducciones guardadas correctamente`)
        // Recargar las cadenas para actualizar el estado
        await fetchCategoryStrings()
        // Limpiar las traducciones temporales
        setBatchTranslations({})
      } else {
        const errorData = await response.json()
        error('Error al guardar', errorData.error || 'No se pudieron guardar las traducciones')
      }
    } catch (err) {
      console.error('Error saving batch translations:', err)
      error('Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
      setSaving(false)
    }
  }

  const filteredStrings = categoryStrings.filter(str => 
    str.englishText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (str.spanishText && str.spanishText.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Languages className="h-6 w-6 text-[#183a1d]" />
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Traducciones</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('individual')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'individual' 
                        ? 'bg-white text-[#183a1d] shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="h-4 w-4 inline mr-1" />
                    Individual
                  </button>
                  <button
                    onClick={() => setViewMode('batch')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'batch' 
                        ? 'bg-white text-[#183a1d] shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Table className="h-4 w-4 inline mr-1" />
                    Por lotes
                  </button>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#183a1d] focus:border-[#183a1d]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {viewMode === 'batch' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar cadenas
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar en inglés o español..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#183a1d] focus:border-[#183a1d]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Estadísticas para modo batch */}
            {viewMode === 'batch' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Languages className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-600">Sin traducir</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.untranslated}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Traducidas</p>
                      <p className="text-2xl font-bold text-green-900">{stats.total - stats.untranslated}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="p-6">
            {viewMode === 'individual' ? (
              /* Modo individual */
              <div className="space-y-6">
                {/* Buscador con sugerencias */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar cadena en inglés
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Escribe para buscar sugerencias..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#183a1d] focus:border-[#183a1d]"
                    />
                  </div>
                  
                  {/* Lista de sugerencias */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulario de traducción */}
                {selectedSuggestion && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar traducción</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Texto en inglés
                        </label>
                        <input
                          type="text"
                          value={selectedSuggestion}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Traducción al español
                        </label>
                        <input
                          type="text"
                          value={spanishTranslation}
                          onChange={(e) => setSpanishTranslation(e.target.value)}
                          placeholder="Escriba la traducción al español..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#183a1d] focus:border-[#183a1d]"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddTranslation}
                          disabled={saving || !spanishTranslation}
                          className="bg-[#183a1d] text-white px-4 py-2 rounded-lg hover:bg-[#2a5530] transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save size={20} />
                          {saving ? 'Guardando...' : 'Guardar traducción'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSuggestion('')
                            setSpanishTranslation('')
                            setSearchTerm('')
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Modo batch */
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando cadenas...</p>
                  </div>
                ) : (
                  <>
                    {/* Tabla de traducciones */}
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Texto en inglés
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Traducción al español
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStrings.map((str, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {str.englishText}
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    value={batchTranslations[str.englishText] || ''}
                                    onChange={(e) => handleBatchTranslationChange(str.englishText, e.target.value)}
                                    placeholder="Escriba la traducción..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#183a1d] focus:border-[#183a1d] text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {batchTranslations[str.englishText] && batchTranslations[str.englishText].trim() !== '' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Traducido
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Pendiente
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Botón para guardar todas las traducciones */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveBatchTranslations}
                        disabled={saving}
                        className="bg-[#183a1d] text-white px-6 py-3 rounded-lg hover:bg-[#2a5530] transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save size={20} />
                        {saving ? 'Guardando...' : 'Guardar todas las traducciones'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}