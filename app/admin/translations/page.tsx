'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { translations } from '@/lib/translations'

interface Translation {
  key: string
  value: string
}

export default function TranslationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof translations>('categories')
  const [searchTerm, setSearchTerm] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [reverseText, setReverseText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }
    
    if (session.user.role !== 'ADMIN') {
      router.push('/auth/unauthorized')
      return
    }
  }, [session, status, router])

  const handleTranslate = async () => {
    if (!searchTerm.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/translations?action=translate&text=${encodeURIComponent(searchTerm)}&category=${selectedCategory}`)
      const data = await response.json()
      
      if (response.ok) {
        setTranslatedText(data.translated)
      } else {
        console.error('Error translating:', data.error)
      }
    } catch (error) {
      console.error('Error translating:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReverse = async () => {
    if (!reverseText.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/translations?action=reverse&text=${encodeURIComponent(reverseText)}&category=${selectedCategory}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchTerm(data.english || 'No encontrado')
      } else {
        console.error('Error reverse translating:', data.error)
      }
    } catch (error) {
      console.error('Error reverse translating:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentTranslations = translations[selectedCategory] || {}
  const filteredTranslations = Object.entries(currentTranslations).filter(([key, value]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando traducciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Traducciones</h1>
              <p className="text-sm text-gray-600">Gestión de traducciones para categorías y taxonomías</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Volver al Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selector de categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría de traducción
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as keyof typeof translations)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
              >
                <option value="categories">Categorías</option>
                <option value="subcategories">Subcategorías</option>
                <option value="materials">Materiales</option>
                <option value="colors">Colores</option>
                <option value="finishes">Acabados</option>
                <option value="styles">Estilos</option>
                <option value="features">Características</option>
                <option value="uses">Usos</option>
                <option value="sizes">Tamaños</option>
                <option value="countries">Países</option>
                <option value="generic">Genérico</option>
              </select>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar traducción
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en inglés..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
                />
                <button
                  onClick={handleTranslate}
                  disabled={isLoading}
                  className="bg-[#183a1d] text-white px-4 py-2 rounded-md hover:bg-[#2d5a2d] disabled:opacity-50"
                >
                  Traducir
                </button>
              </div>
            </div>
          </div>

          {/* Resultado de traducción */}
          {translatedText && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Traducción:</strong> {translatedText}
              </p>
            </div>
          )}

          {/* Traducción inversa */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Traducción Inversa (Español → Inglés)</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={reverseText}
                onChange={(e) => setReverseText(e.target.value)}
                placeholder="Escribir en español..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#183a1d]"
              />
              <button
                onClick={handleReverse}
                disabled={isLoading}
                className="bg-[#f0a04b] text-white px-4 py-2 rounded-md hover:bg-[#e0904b] disabled:opacity-50"
              >
                Buscar en Inglés
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de traducciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Traducciones: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredTranslations.length} de {Object.keys(currentTranslations).length} traducciones
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inglés (Original)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Español (Traducción)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Longitud
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTranslations.map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.length} → {value.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Categorías</h3>
            <p className="text-3xl font-bold text-[#183a1d]">{Object.keys(translations).length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Traducciones Totales</h3>
            <p className="text-3xl font-bold text-[#f0a04b]">
              {Object.values(translations).reduce((acc, category) => acc + Object.keys(category).length, 0)}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Categoría Actual</h3>
            <p className="text-3xl font-bold text-gray-600">{Object.keys(currentTranslations).length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}