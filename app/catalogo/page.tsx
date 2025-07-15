'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layouts/header'
import { calculatePrice } from '@/lib/pricing'
import { Search, Filter, Grid, List } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { Product } from '@/types/product'
import { useUserPricing } from '@/hooks/use-user-pricing'
import { AdvancedFilters } from '@/components/catalog/advanced-filters'
import { ActiveFilters } from '@/components/catalog/active-filters'
import { Breadcrumbs } from '@/components/catalog/breadcrumbs'
import { generateCatalogUrl, navigateToCatalog, parseFiltersFromUrl } from '@/lib/utils/url-helpers'

// Interfaces y tipos ahora están en /types/product.ts

function CatalogContent() {
  const { data: session } = useSession()
  const { userRole } = useUserPricing()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
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
  const [pricingConfig, setPricingConfig] = useState<{priceMultiplier: number, associateDiscount: number, vatRate: number} | null>(null)
  const [filterCounts, setFilterCounts] = useState<{categories: Array<{name: string, count: number}>, brands: Array<{name: string, count: number}>} | null>(null)
  
  // Estados para filtros avanzados
  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: [0, 500] as [number, number],
    heightRange: [0, 200] as [number, number],
    widthRange: [0, 100] as [number, number],
    inStock: false,
    location: [] as string[],
    plantingSystem: [] as string[],
    colors: [] as string[],
    categories: [] as string[]
  })

  // Estado para controlar si es la primera carga
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Actualizar rangos cuando lleguen los productos (solo en la primera carga)
  useEffect(() => {
    if (products.length > 0 && isInitialLoad) {
      const priceMin = Math.floor(Math.min(...products.map(p => p.basePrice * (pricingConfig?.priceMultiplier || 2.5))))
      const priceMax = Math.ceil(Math.max(...products.map(p => p.basePrice * (pricingConfig?.priceMultiplier || 2.5))))
      const heightMin = Math.floor(Math.min(...products.map(p => p.specifications?.height || 0)))
      const heightMax = Math.ceil(Math.max(...products.map(p => p.specifications?.height || 200)))
      const widthMin = Math.floor(Math.min(...products.map(p => p.specifications?.width || 0)))
      const widthMax = Math.ceil(Math.max(...products.map(p => p.specifications?.width || 100)))

      // Solo actualizar si los rangos son diferentes a los valores por defecto
      setAdvancedFilters(prev => ({
        ...prev,
        priceRange: prev.priceRange[0] === 0 && prev.priceRange[1] === 500 ? [priceMin, priceMax] : prev.priceRange,
        heightRange: prev.heightRange[0] === 0 && prev.heightRange[1] === 200 ? [heightMin, heightMax] : prev.heightRange,
        widthRange: prev.widthRange[0] === 0 && prev.widthRange[1] === 100 ? [widthMin, widthMax] : prev.widthRange
      }))
      
      // Set isInitialLoad to false after a small delay to prevent the filter useEffect from triggering
      setTimeout(() => {
        setIsInitialLoad(false)
      }, 100)
    }
  }, [products, pricingConfig, isInitialLoad])

  // Single useEffect to handle all filter changes
  useEffect(() => {
    // Skip if it's the initial load with range calculation
    if (isInitialLoad) {
      return
    }

    const delayDebounce = setTimeout(() => {
      setCurrentPage(1)
      fetchProducts(1, true)
    }, 300) // Debounce to avoid too many requests

    return () => clearTimeout(delayDebounce)
  }, [advancedFilters, selectedCategories, selectedBrands, searchTerm, sortBy, sortOrder, isInitialLoad])

  // Read URL parameters on page load
  useEffect(() => {
    const filters = parseFiltersFromUrl(pathname, searchParams)
    setSelectedCategories(filters.categories)
    setSelectedBrands(filters.brands)
    setSearchTerm(filters.search)
    
    fetchProducts(1, true)
  }, [pathname, searchParams])
  
  const filteredProducts = products.filter(product => product.active)
  
  const handleAddToCart = (product: Product) => {
    // TODO: Implementar lógica del carrito
    console.log('Agregar al carrito:', product.name)
    alert(`Producto "${product.name}" agregado al carrito (funcionalidad pendiente)`)
  }

  // Navegar a URL amigable
  const navigateToFilters = async () => {
    await navigateToCatalog(router, {
      brands: selectedBrands,
      categories: selectedCategories,
      search: searchTerm
    })
  }

  // Funciones para manejar filtros activos
  const handleRemoveSearch = async () => {
    setSearchTerm('')
    setCurrentPage(1)
    
    // Navegar con filtros actualizados
    const url = await generateCatalogUrl({
      brands: selectedBrands,
      categories: selectedCategories,
      search: ''
    })
    router.push(url)
  }

  const handleRemoveCategory = async (category: string) => {
    const newCategories = selectedCategories.filter(c => c !== category)
    setSelectedCategories(newCategories)
    setCurrentPage(1)
    
    // Navegar con filtros actualizados
    const url = await generateCatalogUrl({
      brands: selectedBrands,
      categories: newCategories,
      search: searchTerm
    })
    router.push(url)
  }

  const handleRemoveBrand = async (brand: string) => {
    const newBrands = selectedBrands.filter(b => b !== brand)
    setSelectedBrands(newBrands)
    setCurrentPage(1)
    
    // Navegar con filtros actualizados
    const url = await generateCatalogUrl({
      brands: newBrands,
      categories: selectedCategories,
      search: searchTerm
    })
    router.push(url)
  }

  const handleClearAllFilters = async () => {
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedBrands([])
    setCurrentPage(1)
    
    // Navegar a la URL base del catálogo
    router.push('/catalogo')
  }

  const fetchProducts = async (page = 1, resetProducts = false) => {
    try {
      // Validate input parameters
      const pageNum = Number(page)
      const limitNum = Number(itemsPerPage)
      
      if (isNaN(pageNum) || pageNum < 1) {
        console.error('❌ Invalid page parameter in fetchProducts:', page)
        return
      }
      
      if (isNaN(limitNum) || limitNum < 1) {
        console.error('❌ Invalid limit parameter in fetchProducts:', itemsPerPage)
        return
      }
      
      setLoading(true)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limitNum.toString(),
        ...(selectedCategory && { category: selectedCategory.toString() }),
        ...(selectedCategories.length > 0 && { categories: selectedCategories.join(',') }),
        ...(selectedBrands.length > 0 && { brands: selectedBrands.join(',') }),
        ...(searchTerm && { search: searchTerm.toString() }),
        sortBy: sortBy.toString(),
        sortOrder: sortOrder.toString()
      })

      // Agregar filtros avanzados
      if (advancedFilters.priceRange[0] > 0 || advancedFilters.priceRange[1] < 500) {
        params.append('priceMin', advancedFilters.priceRange[0].toString())
        params.append('priceMax', advancedFilters.priceRange[1].toString())
      }
      
      if (advancedFilters.heightRange[0] > 0 || advancedFilters.heightRange[1] < 200) {
        params.append('heightMin', advancedFilters.heightRange[0].toString())
        params.append('heightMax', advancedFilters.heightRange[1].toString())
      }
      
      if (advancedFilters.widthRange[0] > 0 || advancedFilters.widthRange[1] < 100) {
        params.append('widthMin', advancedFilters.widthRange[0].toString())
        params.append('widthMax', advancedFilters.widthRange[1].toString())
      }
      
      if (advancedFilters.inStock) {
        params.append('inStock', 'true')
      }
      
      if (advancedFilters.location.length > 0) {
        params.append('location', advancedFilters.location.join(','))
      }
      
      if (advancedFilters.plantingSystem.length > 0) {
        params.append('plantingSystem', advancedFilters.plantingSystem.join(','))
      }
      
      if (advancedFilters.colors.length > 0) {
        params.append('colors', advancedFilters.colors.join(','))
      }
      
      if (advancedFilters.categories.length > 0) {
        params.append('advancedCategories', advancedFilters.categories.join(','))
      }
      
      const finalUrl = `/api/products?${params}`
      const response = await fetch(finalUrl)
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
      
      // Guardar configuración de precios
      if (data.config) {
        setPricingConfig(data.config)
      }
      
      // Actualizar conteos de filtros
      if (data.filters) {
        setFilterCounts(data.filters)
      }
      
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
              onClick={() => fetchProducts(1, true)}
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
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6 sticky top-4">
              {/* Búsqueda */}
              <div className="bg-white rounded-lg shadow-md p-4">
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

              {/* Filtros avanzados */}
              <AdvancedFilters
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
                products={products}
              />
              
              {session?.user?.role === 'ASSOCIATE' && (
                <div className="bg-[#f0a04b] text-white p-3 rounded-lg text-sm">
                  <p className="font-medium">¡Descuento Asociado!</p>
                  <p>Obtienes {pricingConfig ? Math.round(pricingConfig.associateDiscount * 100) : 20}% de descuento en todos los productos</p>
                </div>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Migas de pan */}
            <Breadcrumbs 
              searchTerm={searchTerm} 
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
            />
            
            {/* Filtros activos */}
            <ActiveFilters
              searchTerm={searchTerm}
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              onRemoveSearch={handleRemoveSearch}
              onRemoveCategory={handleRemoveCategory}
              onRemoveBrand={handleRemoveBrand}
              onClearAll={handleClearAllFilters}
            />
            
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
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No se encontraron productos</p>
                <p className="text-gray-500 mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <>
                <div className={`${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'} ${loading ? 'opacity-50 pointer-events-none' : ''}`
                }>
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      userRole={userRole}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                      priority={index < 3}
                      pricingConfig={pricingConfig || undefined}
                    />
                  ))}
                </div>
                
                {/* Paginación */}
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => { 
                      const prevPage = currentPage - 1;
                      setCurrentPage(prevPage); 
                      fetchProducts(prevPage, true);
                    }}
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
                          onClick={() => { 
                            setCurrentPage(pageNumber); 
                            fetchProducts(pageNumber, true);
                          }}
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
                    onClick={() => { 
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage); 
                      fetchProducts(nextPage, true);
                    }}
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

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando catálogo...</p>
          </div>
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  )
}