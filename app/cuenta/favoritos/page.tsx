'use client'

import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/layouts/header'
import { ArrowLeft, Heart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useFavorites } from '@/contexts/favorites-context'
import { useUserPricing } from '@/hooks/use-user-pricing'
import { ProductCard } from '@/components/products/product-card'
import { useState, useEffect } from 'react'
import { getProductImageUrls } from '@/lib/utils/images'

export default function FavoritosPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const { favorites, loading: favoritesLoading, removeFromFavorites, favoriteIds } = useFavorites()
  const { userRole } = useUserPricing()
  const [pricingConfig, setPricingConfig] = useState<{priceMultiplier: number, associateDiscount: number, vatRate: number} | null>(null)

  // Obtener configuración de precios
  useEffect(() => {
    const fetchPricingConfig = async () => {
      try {
        const response = await fetch('/api/admin/configuration')
        if (response.ok) {
          const data = await response.json()
          const { priceMultiplier, associateDiscount } = data.data
          setPricingConfig({
            priceMultiplier: priceMultiplier || 2.5,
            associateDiscount: (associateDiscount || 20) / 100,
            vatRate: 0.21
          })
        }
      } catch (error) {
        console.error('Error fetching pricing config:', error)
      }
    }
    fetchPricingConfig()
  }, [])

  const handleAddToCart = (product: any) => {
    // TODO: Implementar lógica del carrito
    console.log('Agregar al carrito:', product.name)
    alert(`Producto "${product.name}" agregado al carrito (funcionalidad pendiente)`)
  }

  const handleRemoveFromFavorites = async (productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${productName}" de tus favoritos?`)) {
      await removeFromFavorites(productId, productName)
    }
  }

  if (isLoading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bloom-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/cuenta" 
              className="inline-flex items-center text-bloom-primary hover:text-bloom-primary/80 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Mi Cuenta
            </Link>
            <h1 className="text-3xl font-cormorant font-medium text-gray-900">
              Mis Favoritos
            </h1>
            <p className="text-gray-600 mt-2">
              Productos que has guardado
            </p>
          </div>

          {!isAuthenticated && favoriteIds.size === 0 ? (
            /* Empty State for Anonymous Users */
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes favoritos aún
              </h2>
              <p className="text-gray-600 mb-4">
                Guarda productos que te gusten para encontrarlos fácilmente
              </p>
              <p className="text-sm text-orange-600 mb-8">
                💡 Inicia sesión para sincronizar tus favoritos entre dispositivos
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center px-6 py-3 bg-bloom-primary text-white rounded-lg font-medium hover:bg-bloom-primary/90 transition-colors"
                >
                  Explorar Productos
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-6 py-3 border border-bloom-primary text-bloom-primary rounded-lg font-medium hover:bg-bloom-primary/10 transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          ) : isAuthenticated && favorites.length === 0 ? (
            /* Empty State for Authenticated Users */
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes favoritos aún
              </h2>
              <p className="text-gray-600 mb-8">
                Guarda productos que te gusten para encontrarlos fácilmente
              </p>
              <Link
                href="/catalogo"
                className="inline-flex items-center px-6 py-3 bg-bloom-primary text-white rounded-lg font-medium hover:bg-bloom-primary/90 transition-colors"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            /* Favorites List */
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  {favorites.length} {favorites.length === 1 ? 'producto guardado' : 'productos guardados'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite, index) => {
                  // Generate images dynamically using nieuwkoopId
                  const productImages = favorite.product.images && favorite.product.images.length > 0 
                    ? favorite.product.images 
                    : getProductImageUrls(favorite.product.nieuwkoopId || favorite.product.sku)
                    
                  // Transform FavoriteProduct to Product format
                  const product = {
                    ...favorite.product,
                    images: productImages, // Use generated images
                    availability: 'in_stock' as const,
                    tags: [],
                    displayPrice: favorite.product.basePrice,
                    priceWithoutVat: favorite.product.basePrice,
                    priceWithVat: favorite.product.basePrice * 1.21,
                    showWithVat: true,
                    originalPriceWithoutVat: favorite.product.basePrice,
                    originalPriceWithVat: favorite.product.basePrice * 1.21,
                    hasDiscount: false,
                    discountPercentage: 0,
                    formattedPrice: `€${favorite.product.basePrice.toFixed(2)}`,
                    formattedPriceWithVat: `€${(favorite.product.basePrice * 1.21).toFixed(2)}`,
                    formattedOriginalPrice: `€${favorite.product.basePrice.toFixed(2)}`,
                    formattedOriginalPriceWithVat: `€${(favorite.product.basePrice * 1.21).toFixed(2)}`,
                    isOnSale: false,
                    saleEndDate: null,
                    isFeatured: false,
                    popularity: 0,
                    isRealTimeData: false,
                    lastPriceCheck: new Date().toISOString(),
                    stockLastCheck: new Date().toISOString(),
                    priceHistory: [],
                    stockHistory: [],
                    searchScore: 0,
                    stockStatus: 'in_stock' as const,
                    stockText: 'Disponible',
                    priceText: `€${favorite.product.basePrice.toFixed(2)}`,
                    originalPriceText: `€${favorite.product.basePrice.toFixed(2)}`
                  }
                  
                  return (
                    <div key={favorite.id} className="relative">
                      <ProductCard
                        product={product}
                        userRole={userRole}
                        onAddToCart={handleAddToCart}
                        viewMode="grid"
                        priority={index < 3}
                        pricingConfig={pricingConfig || undefined}
                      />
                      <button
                        onClick={() => handleRemoveFromFavorites(favorite.product.id, favorite.product.name)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                        title="Eliminar de favoritos"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}