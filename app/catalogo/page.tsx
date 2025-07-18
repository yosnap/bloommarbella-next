'use client'

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layouts/header'
import { calculatePrice } from '@/lib/pricing'
import { Search, Filter, Grid, List } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { Product } from '@/types/product'
import { useUserPricing } from '@/hooks/use-user-pricing'
import { AdvancedFilters } from '@/components/catalog/advanced-filters'
import { ProductSkeletonGrid } from '@/components/catalog/product-card-skeleton'
import { Breadcrumbs } from '@/components/catalog/breadcrumbs'
import { generateCatalogUrl, navigateToCatalog, parseFiltersFromUrl } from '@/lib/utils/url-helpers'
import { useProductsQuery, usePrefetchProducts } from '@/hooks/use-products-query'

// Interfaces y tipos ahora están en /types/product.ts

function CatalogContent() {
  const { data: session } = useSession()
  const { userRole } = useUserPricing()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('alphabetical')
  const [sortOrder, setSortOrder] = useState('asc')
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const prefetchProducts = usePrefetchProducts()
  
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

  // Construir filtros para React Query
  const queryFilters = useMemo(() => ({
    category: selectedCategory || undefined,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    search: searchTerm || undefined,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
    // Advanced filters
    priceMin: advancedFilters.priceRange[0] > 0 ? advancedFilters.priceRange[0] : undefined,
    priceMax: advancedFilters.priceRange[1] < 500 ? advancedFilters.priceRange[1] : undefined,
    heightMin: advancedFilters.heightRange[0] > 0 ? advancedFilters.heightRange[0] : undefined,
    heightMax: advancedFilters.heightRange[1] < 200 ? advancedFilters.heightRange[1] : undefined,
    widthMin: advancedFilters.widthRange[0] > 0 ? advancedFilters.widthRange[0] : undefined,
    widthMax: advancedFilters.widthRange[1] < 100 ? advancedFilters.widthRange[1] : undefined,
    inStock: advancedFilters.inStock || undefined,
    location: advancedFilters.location.length > 0 ? advancedFilters.location : undefined,
    plantingSystem: advancedFilters.plantingSystem.length > 0 ? advancedFilters.plantingSystem : undefined,
    colors: advancedFilters.colors.length > 0 ? advancedFilters.colors : undefined,
    advancedCategories: advancedFilters.categories.length > 0 ? advancedFilters.categories : undefined,
  }), [selectedCategory, selectedCategories, selectedBrands, searchTerm, currentPage, itemsPerPage, sortBy, sortOrder, advancedFilters])

  // Usar React Query para obtener productos
  const { 
    data: productsData, 
    isLoading: loading, 
    error, 
    isFetching,
    isPlaceholderData: isPreviousData 
  } = useProductsQuery(queryFilters)

  // Extraer datos de la respuesta
  const products = productsData?.data || []
  const pagination = productsData?.pagination || {
    page: currentPage, // Usar el estado actual en lugar de 1 por defecto
    limit: itemsPerPage,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  }
  const pricingConfig = productsData?.config || null
  const filterCounts = productsData?.filters || null
  const totalPages = pagination.totalPages
  const totalProducts = pagination.total
  const hasNextPage = pagination.hasNextPage
  const hasPrevPage = pagination.hasPrevPage
  
  // Debug logging
  console.log('🔍 Pagination debug:', {
    currentPage,
    totalPages,
    totalProducts,
    hasNextPage,
    hasPrevPage,
    paginationFromAPI: productsData?.pagination,
    isLoading: loading,
    isFetching,
    isPreviousData
  })
  const hasOffersAvailable = products.some((product: Product) => (product as any).isOffer === true)

  // Calcular rangos dinámicos basados en productos actuales
  const dynamicRanges = useMemo(() => {
    if (products.length === 0) {
      return {
        priceRange: { min: 0, max: 500 },
        heightRange: { min: 0, max: 200 },
        widthRange: { min: 0, max: 100 }
      }
    }
    
    const priceMin = Math.floor(Math.min(...products.map(p => p.basePrice * (pricingConfig?.priceMultiplier || 2.5))))
    const priceMax = Math.ceil(Math.max(...products.map(p => p.basePrice * (pricingConfig?.priceMultiplier || 2.5))))
    const heightMin = Math.floor(Math.min(...products.map(p => p.specifications?.height || 0)))
    const heightMax = Math.ceil(Math.max(...products.map(p => p.specifications?.height || 200)))
    const widthMin = Math.floor(Math.min(...products.map(p => p.specifications?.width || 0)))
    const widthMax = Math.ceil(Math.max(...products.map(p => p.specifications?.width || 100)))
    
    return {
      priceRange: { min: priceMin, max: priceMax },
      heightRange: { min: heightMin, max: heightMax },
      widthRange: { min: widthMin, max: widthMax }
    }
  }, [products, pricingConfig])

  // Estado para controlar si es la primera carga
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Estado para controlar si ya se cargaron los filtros desde URL
  const [urlFiltersLoaded, setUrlFiltersLoaded] = useState(false)

  // Actualizar rangos cuando lleguen los productos (solo en la primera carga)
  useEffect(() => {
    if (products.length > 0 && isInitialLoad && urlFiltersLoaded) {
      // Solo actualizar si los rangos son diferentes a los valores por defecto y no se han cargado desde URL
      setAdvancedFilters(prev => ({
        ...prev,
        priceRange: prev.priceRange[0] === 0 && prev.priceRange[1] === 500 ? [dynamicRanges.priceRange.min, dynamicRanges.priceRange.max] : prev.priceRange,
        heightRange: prev.heightRange[0] === 0 && prev.heightRange[1] === 200 ? [dynamicRanges.heightRange.min, dynamicRanges.heightRange.max] : prev.heightRange,
        widthRange: prev.widthRange[0] === 0 && prev.widthRange[1] === 100 ? [dynamicRanges.widthRange.min, dynamicRanges.widthRange.max] : prev.widthRange
      }))
      
      // Set isInitialLoad to false after a small delay to prevent the filter useEffect from triggering
      setTimeout(() => {
        setIsInitialLoad(false)
      }, 100)
    }
  }, [products, pricingConfig, isInitialLoad, urlFiltersLoaded, dynamicRanges])

  // Read URL parameters on page load - SOLO UNA VEZ
  useEffect(() => {
    const filters = parseFiltersFromUrl(pathname, searchParams)
    setSelectedCategories(filters.categories)
    setSelectedBrands(filters.brands)
    setSearchTerm(filters.search)
    setCurrentPage(filters.page)
    setSortBy(filters.sortBy)
    setSortOrder(filters.sortOrder)
    setItemsPerPage(filters.itemsPerPage)
    
    // Cargar filtros avanzados desde URL
    setAdvancedFilters({
      priceRange: filters.priceRange,
      heightRange: filters.heightRange,
      widthRange: filters.widthRange,
      inStock: filters.inStock,
      location: filters.location,
      plantingSystem: filters.plantingSystem,
      colors: filters.colors,
      categories: filters.advancedCategories
    })
    
    setUrlFiltersLoaded(true)
  }, []) // Sin dependencias para que solo se ejecute una vez

  // Update URL when filters change
  useEffect(() => {
    if (urlFiltersLoaded && !isInitialLoad) {
      const updateUrl = async () => {
        const url = await generateCatalogUrl({
          brands: selectedBrands,
          categories: selectedCategories,
          search: searchTerm,
          page: currentPage,
          sortBy,
          sortOrder,
          itemsPerPage,
          // Filtros avanzados
          priceRange: advancedFilters.priceRange,
          heightRange: advancedFilters.heightRange,
          widthRange: advancedFilters.widthRange,
          inStock: advancedFilters.inStock,
          location: advancedFilters.location,
          plantingSystem: advancedFilters.plantingSystem,
          colors: advancedFilters.colors,
          advancedCategories: advancedFilters.categories,
          // Rangos dinámicos para comparación
          dynamicRanges
        })
        router.replace(url)
      }
      updateUrl()
    }
  }, [selectedCategories, selectedBrands, searchTerm, currentPage, sortBy, sortOrder, itemsPerPage, advancedFilters, urlFiltersLoaded, isInitialLoad, router, dynamicRanges])

  // Prefetch next page for better UX
  useEffect(() => {
    if (hasNextPage && !isFetching) {
      prefetchProducts({
        ...queryFilters,
        page: currentPage + 1
      })
    }
  }, [hasNextPage, isFetching, currentPage, queryFilters, prefetchProducts])
  
  const filteredProducts = useMemo(() => 
    products.filter((product: Product) => product.active),
    [products]
  )
  
  const handleAddToCart = useCallback((product: Product) => {
    // TODO: Implementar lógica del carrito
    console.log('Agregar al carrito:', product.name)
    alert(`Producto "${product.name}" agregado al carrito (funcionalidad pendiente)`)
  }, [])

  // Navegar a URL amigable
  const navigateToFilters = useCallback(async () => {
    await navigateToCatalog(router, {
      brands: selectedBrands,
      categories: selectedCategories,
      search: searchTerm
    })
  }, [router, selectedBrands, selectedCategories, searchTerm])

  // Función para limpiar todos los filtros
  const handleClearAllFilters = useCallback(async () => {
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedBrands([])
    setCurrentPage(1)
    setSortBy('alphabetical')
    setSortOrder('asc')
    setItemsPerPage(15)
    
    // Resetear filtros avanzados con rangos dinámicos
    setAdvancedFilters({
      priceRange: [dynamicRanges.priceRange.min, dynamicRanges.priceRange.max],
      heightRange: [dynamicRanges.heightRange.min, dynamicRanges.heightRange.max],
      widthRange: [dynamicRanges.widthRange.min, dynamicRanges.widthRange.max],
      inStock: false,
      location: [],
      plantingSystem: [],
      colors: [],
      categories: []
    })
    
    // Navegar a la URL base del catálogo
    router.push('/catalogo')
  }, [router, dynamicRanges])

  // Callbacks para eventos del UI
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleItemsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }, [])

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }, [])

  const handleSortOrderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value)
  }, [])

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const handleToggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  }, [viewMode])

  const handlePrevPage = useCallback(() => {
    const prevPage = currentPage - 1
    setCurrentPage(prevPage)
  }, [currentPage])

  const handleNextPage = useCallback(() => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
  }, [currentPage])

  const handlePageClick = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber)
  }, [])

  // Ya no necesitamos fetchProducts - React Query se encarga de todo

  // Solo mostrar loading completo si no hay datos previos y está cargando
  if (loading && !products.length && !error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar skeleton */}
            <div className="lg:w-80">
              <div className="space-y-6 sticky top-4">
                <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content skeleton */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              
              <ProductSkeletonGrid count={itemsPerPage} viewMode={viewMode} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !isPreviousData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error instanceof Error ? error.message : 'Error desconocido'}</p>
            <button
              onClick={() => window.location.reload()}
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
                    onChange={handleSearchChange}
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
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || searchTerm || 
              advancedFilters.categories.length > 0 || advancedFilters.location.length > 0 || 
              advancedFilters.colors.length > 0 || advancedFilters.plantingSystem.length > 0 || 
              advancedFilters.inStock || 
              advancedFilters.priceRange[0] > dynamicRanges.priceRange.min || advancedFilters.priceRange[1] < dynamicRanges.priceRange.max ||
              advancedFilters.heightRange[0] > dynamicRanges.heightRange.min || advancedFilters.heightRange[1] < dynamicRanges.heightRange.max ||
              advancedFilters.widthRange[0] > dynamicRanges.widthRange.min || advancedFilters.widthRange[1] < dynamicRanges.widthRange.max) && (
              <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium">Filtros activos:</span>
                  
                  {selectedCategories.map((category) => (
                    <span key={category} className="inline-flex items-center gap-1 bg-[#183a1d] text-white px-2 py-1 rounded-full text-xs">
                      📂 {category}
                      <button
                        onClick={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {advancedFilters.categories.map((category) => (
                    <span key={category} className="inline-flex items-center gap-1 bg-[#183a1d] text-white px-2 py-1 rounded-full text-xs">
                      📂 {category}
                      <button
                        onClick={() => setAdvancedFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {selectedBrands.map((brand) => (
                    <span key={brand} className="inline-flex items-center gap-1 bg-[#f0a04b] text-white px-2 py-1 rounded-full text-xs">
                      🏷️ {brand}
                      <button
                        onClick={() => setSelectedBrands(prev => prev.filter(b => b !== brand))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {advancedFilters.location.map((location) => (
                    <span key={location} className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      📍 {location}
                      <button
                        onClick={() => setAdvancedFilters(prev => ({ ...prev, location: prev.location.filter(l => l !== location) }))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {advancedFilters.colors.map((color) => (
                    <span key={color} className="inline-flex items-center gap-1 bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                      🎨 {color}
                      <button
                        onClick={() => setAdvancedFilters(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {advancedFilters.plantingSystem.map((system) => (
                    <span key={system} className="inline-flex items-center gap-1 bg-teal-500 text-white px-2 py-1 rounded-full text-xs">
                      🌱 {system}
                      <button
                        onClick={() => setAdvancedFilters(prev => ({ ...prev, plantingSystem: prev.plantingSystem.filter(s => s !== system) }))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {advancedFilters.inStock && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs">
                      ✅ En stock
                      <button
                        onClick={() => setAdvancedFilters(prev => ({ ...prev, inStock: false }))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {(advancedFilters.priceRange[0] > dynamicRanges.priceRange.min || advancedFilters.priceRange[1] < dynamicRanges.priceRange.max) && (
                    <span className="inline-flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs">
                      💰 €{advancedFilters.priceRange[0]} - €{advancedFilters.priceRange[1]}
                      <button
                        onClick={() => {
                          setAdvancedFilters(prev => ({ ...prev, priceRange: [dynamicRanges.priceRange.min, dynamicRanges.priceRange.max] }))
                        }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {(advancedFilters.heightRange[0] > dynamicRanges.heightRange.min || advancedFilters.heightRange[1] < dynamicRanges.heightRange.max) && (
                    <span className="inline-flex items-center gap-1 bg-cyan-500 text-white px-2 py-1 rounded-full text-xs">
                      📏 {advancedFilters.heightRange[0]}cm - {advancedFilters.heightRange[1]}cm
                      <button
                        onClick={() => {
                          setAdvancedFilters(prev => ({ ...prev, heightRange: [dynamicRanges.heightRange.min, dynamicRanges.heightRange.max] }))
                        }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {(advancedFilters.widthRange[0] > dynamicRanges.widthRange.min || advancedFilters.widthRange[1] < dynamicRanges.widthRange.max) && (
                    <span className="inline-flex items-center gap-1 bg-indigo-500 text-white px-2 py-1 rounded-full text-xs">
                      📐 {advancedFilters.widthRange[0]}cm - {advancedFilters.widthRange[1]}cm
                      <button
                        onClick={() => {
                          setAdvancedFilters(prev => ({ ...prev, widthRange: [dynamicRanges.widthRange.min, dynamicRanges.widthRange.max] }))
                        }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      🔍 "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  <button
                    onClick={handleClearAllFilters}
                    className="ml-2 text-gray-500 hover:text-red-500 transition-colors text-xs underline"
                  >
                    Limpiar todos
                  </button>
                </div>
              </div>
            )}
            
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
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent bg-white text-sm"
                >
                  <option value="12">12 por página</option>
                  <option value="15">15 por página</option>
                  <option value="24">24 por página</option>
                  <option value="36">36 por página</option>
                </select>
                
                {/* Selector de ordenamiento */}
                <select
                  value={sortBy}
                  onChange={handleSortByChange}
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
                  onChange={handleSortOrderChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent bg-white text-sm"
                  disabled={sortBy === 'offer'}
                >
                  <option value="asc">{sortBy === 'alphabetical' ? 'A-Z' : sortBy === 'date' ? 'Más antiguos' : 'Menor precio'}</option>
                  <option value="desc">{sortBy === 'alphabetical' ? 'Z-A' : sortBy === 'date' ? 'Más recientes' : 'Mayor precio'}</option>
                </select>
                
                <button
                  onClick={handleToggleFilters}
                  className="lg:hidden bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filtros
                </button>
                
                <button
                  onClick={handleToggleViewMode}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                  {viewMode === 'grid' ? 'Lista' : 'Cuadrícula'}
                </button>
              </div>
            </div>
            
            {/* Contenido principal con skeleton loading */}
            {(loading && !isPreviousData && !products.length) ? (
              <ProductSkeletonGrid count={itemsPerPage} viewMode={viewMode} />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No se encontraron productos</p>
                <p className="text-gray-500 mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <>
                {/* Indicador de carga durante actualización */}
                {(isFetching && isPreviousData) && (
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center gap-2 text-[#183a1d] bg-[#183a1d]/5 px-4 py-2 rounded-full">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#183a1d]"></div>
                      <span className="text-sm font-medium">Actualizando resultados...</span>
                    </div>
                  </div>
                )}
                
                <div className={`${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'} ${(isFetching && isPreviousData) ? 'opacity-75' : ''}`
                }>
                  {filteredProducts.map((product: Product, index: number) => (
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
                    onClick={handlePrevPage}
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
                          onClick={() => handlePageClick(pageNumber)}
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
                    onClick={handleNextPage}
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