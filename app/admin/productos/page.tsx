'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Eye, EyeOff, Package, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

interface Product {
  id: string
  itemCode: string
  sku: string
  name: string
  active: boolean
  category: string
  price: number
  displayText: string
  isHidden: boolean
}

export default function ProductsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [hiddenProducts, setHiddenProducts] = useState<Product[]>([])
  const [hiddenLoading, setHiddenLoading] = useState(true)
  const [showHiddenSection, setShowHiddenSection] = useState(false)

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

    // Cargar productos ocultos al montar el componente
    fetchHiddenProducts()
  }, [session, status, router])

  const fetchHiddenProducts = async () => {
    try {
      setHiddenLoading(true)
      const response = await fetch('/api/admin/products/hidden')
      const data = await response.json()
      
      if (data.success) {
        setHiddenProducts(data.products)
      } else {
        console.error('Error fetching hidden products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching hidden products:', error)
    } finally {
      setHiddenLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchProducts()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const searchProducts = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/products/search?query=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.products)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al buscar productos' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al buscar productos' })
    } finally {
      setLoading(false)
    }
  }

  const toggleProductVisibility = async (product: Product) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/products/toggle-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          active: !product.active
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Producto ${!product.active ? 'mostrado' : 'ocultado'} exitosamente` 
        })
        
        // Actualizar el producto en los resultados de búsqueda
        setSearchResults(prev => 
          prev.map(p => 
            p.id === product.id 
              ? { ...p, active: !p.active, isHidden: !p.active } 
              : p
          )
        )

        // Actualizar la lista de productos ocultos
        if (!product.active) {
          // El producto se está mostrando, quitarlo de la lista de ocultos
          setHiddenProducts(prev => prev.filter(p => p.id !== product.id))
        } else {
          // El producto se está ocultando, agregarlo a la lista de ocultos
          const updatedProduct = { ...product, active: false, isHidden: true }
          setHiddenProducts(prev => [updatedProduct, ...prev])
        }
        
        setSelectedProduct(null)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al actualizar producto' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar producto' })
    } finally {
      setActionLoading(false)
    }
  }

  const clearMessage = () => {
    setMessage(null)
  }

  const showAllHiddenProducts = async () => {
    if (hiddenProducts.length === 0) return
    
    setActionLoading(true)
    try {
      const promises = hiddenProducts.map(product =>
        fetch('/api/products/toggle-visibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            active: true
          })
        })
      )

      const responses = await Promise.all(promises)
      const successCount = responses.filter(r => r.ok).length
      
      if (successCount === hiddenProducts.length) {
        setMessage({ 
          type: 'success', 
          text: `Se mostraron ${successCount} productos exitosamente` 
        })
        setHiddenProducts([])
      } else if (successCount > 0) {
        setMessage({ 
          type: 'success', 
          text: `Se mostraron ${successCount} de ${hiddenProducts.length} productos` 
        })
        // Recargar productos ocultos para actualizar la lista
        await fetchHiddenProducts()
      } else {
        setMessage({ 
          type: 'error', 
          text: 'No se pudieron mostrar los productos' 
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al mostrar productos' })
    } finally {
      setActionLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-2">
            Busca productos por ItemCode, SKU o nombre para ocultar/mostrar en el catálogo
          </p>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button
                onClick={clearMessage}
                className="text-sm underline hover:no-underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ItemCode, SKU o nombre del producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent"
            />
          </div>
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#183a1d] mx-auto"></div>
              <p className="text-gray-600 mt-2">Buscando productos...</p>
            </div>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Resultados ({searchResults.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {searchResults.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {product.itemCode}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{product.category}</span>
                            <span className="mx-2">•</span>
                            <span>€{product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.active ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Oculto
                            </>
                          )}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleProductVisibility(product)}
                        disabled={actionLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          product.active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {actionLoading ? 'Actualizando...' : (product.active ? 'Ocultar' : 'Mostrar')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600">
              Intenta buscar con un ItemCode, SKU o nombre diferente
            </p>
          </div>
        )}

        {/* Productos Ocultos */}
        {!hiddenLoading && hiddenProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Productos Ocultos ({hiddenProducts.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Productos que están ocultos del catálogo público
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={showAllHiddenProducts}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    title="Mostrar todos los productos ocultos"
                  >
                    <Eye className="h-4 w-4" />
                    Mostrar todos
                  </button>
                  <button
                    onClick={() => setShowHiddenSection(!showHiddenSection)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {showHiddenSection ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Ocultar lista
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Ver lista
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {showHiddenSection && (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {hiddenProducts.map((product) => (
                  <div key={product.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-red-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                {product.itemCode}
                              </span>
                              <span className="mx-2">•</span>
                              <span>{product.category}</span>
                              <span className="mx-2">•</span>
                              <span>€{product.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Oculto
                        </span>
                        
                        <button
                          onClick={() => toggleProductVisibility(product)}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? 'Actualizando...' : 'Mostrar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Estado cuando no hay productos ocultos */}
        {!hiddenLoading && hiddenProducts.length === 0 && searchTerm.length < 2 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <Eye className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900">
                  ¡Todos los productos están visibles!
                </h3>
                <p className="text-green-700 mt-1">
                  No hay productos ocultos en este momento. Usa la búsqueda para encontrar productos específicos y ocultarlos si es necesario.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ayuda */}
        {searchTerm.length < 2 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Cómo usar esta herramienta
            </h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Escribe al menos 2 caracteres para comenzar la búsqueda</li>
              <li>• Puedes buscar por ItemCode (ej: 12345), SKU o nombre del producto</li>
              <li>• Los productos ocultos no aparecerán en el catálogo público</li>
              <li>• Puedes volver a mostrar productos ocultos en cualquier momento</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}