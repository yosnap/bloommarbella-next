'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Eye, EyeOff, Package } from 'lucide-react'

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
        
        // Actualizar el producto en los resultados
        setSearchResults(prev => 
          prev.map(p => 
            p.id === product.id 
              ? { ...p, active: !p.active, isHidden: !p.active } 
              : p
          )
        )
        
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Panel
            </button>
          </div>
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