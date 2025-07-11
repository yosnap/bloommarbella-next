'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layouts/header'
import { calculatePrice } from '@/lib/pricing'
import { Search, Filter, Grid, List } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { Product } from '@/types/product'
import { useUserPricing } from '@/hooks/use-user-pricing'

// Interfaces y tipos ahora están en /types/product.ts

export default function CatalogoPage() {
  const { data: session } = useSession()
  const { userRole } = useUserPricing()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [sortBy, setSortBy] = useState('alphabetical')
  const [sortOrder, setSortOrder] = useState('asc')
  const [hasOffersAvailable, setHasOffersAvailable] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(16)
  
  const categories = Array.from(new Set(products.map(p => p.category)))
  
  const filteredProducts = products.filter(product => product.active)
  
  const handleAddToCart = (product: Product) => {
    // TODO: Implementar lógica del carrito
    console.log('Agregar al carrito:', product.name)
    alert(`Producto "${product.name}" agregado al carrito (funcionalidad pendiente)`)
  }

  useEffect(() => {
    fetchProducts(1, true)
  }, [])
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1)
      fetchProducts(1, true)
    }, 300)
    
    return () => clearTimeout(delayDebounce)
  }, [searchTerm, selectedCategory, sortBy, sortOrder])

  const fetchProducts = async (page = 1, resetProducts = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: sortBy,
        sortOrder: sortOrder
      })
      
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      const data = await response.json()
      
      if (resetProducts || page === 1) {
        setProducts(data.data || [])
      } else {
        setProducts(prev => [...prev, ...(data.data || [])])
      }
      
      setCurrentPage(data.pagination.page)
      setTotalPages(data.pagination.totalPages)
      setTotalProducts(data.pagination.total)
      setHasNextPage(data.pagination.hasNextPage)
      setHasPrevPage(data.pagination.hasPrevPage)
      
      // Verificar si hay productos en oferta
      const hasOffers = data.data.some((product: any) => product.isOffer === true)
      setHasOffersAvailable(hasOffers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={fetchProducts}
              className="bg-[#183a1d] text-white px-6 py-2 rounded-lg hover:bg-[#2a5530] transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar con filtros */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar productos
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {session?.user?.role === 'ASSOCIATE' && (
                <div className="bg-[#f0a04b] text-white p-3 rounded-lg text-sm">
                  <p className="font-medium">¡Descuento Asociado!</p>
                  <p>Obtienes 20% de descuento en todos los productos</p>
                </div>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Catálogo de Productos</h1>
                <p className="text-gray-600">
                  Página {currentPage} de {totalPages} • {totalProducts} productos total
                </p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {/* Selector de productos por página */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                    fetchProducts(1, true)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent bg-white text-sm"
                >
                  <option value="12">12 por página</option>
                  <option value="16">16 por página</option>
                  <option value="24">24 por página</option>
                  <option value="36">36 por página</option>
                </select>
                
                {/* Selector de ordenamiento */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent bg-white text-sm"
                >
                  {hasOffersAvailable && <option value="offer">En oferta</option>}
                  <option value="alphabetical">Alfabéticamente</option>
                  <option value="date">Fecha incorporación</option>
                  <option value="price">Precio</option>
                </select>
                
                {/* Selector de orden */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent bg-white text-sm"
                  disabled={sortBy === 'offer'}
                >
                  <option value="asc">{sortBy === 'alphabetical' ? 'A-Z' : sortBy === 'date' ? 'Más antiguos' : 'Menor precio'}</option>
                  <option value="desc">{sortBy === 'alphabetical' ? 'Z-A' : sortBy === 'date' ? 'Más recientes' : 'Mayor precio'}</option>
                </select>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filtros
                </button>
                
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                  {viewMode === 'grid' ? 'Lista' : 'Cuadrícula'}
                </button>
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No se encontraron productos</p>
                <p className="text-gray-500 mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      userRole={userRole}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
                
                {/* Paginación */}
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => fetchProducts(currentPage - 1, true)}
                    disabled={!hasPrevPage || loading}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = Math.max(1, currentPage - 2) + i
                      if (pageNumber > totalPages) return null
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => fetchProducts(pageNumber, true)}
                          disabled={loading}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            pageNumber === currentPage
                              ? 'bg-[#183a1d] text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => fetchProducts(currentPage + 1, true)}
                    disabled={!hasNextPage || loading}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}