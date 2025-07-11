'use client'

import { ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import { Product, ProductCardProps } from '@/types/product'
import { getDisplayPrice, formatPrice } from '@/lib/pricing'
import { usePricing } from '@/contexts/pricing-context'
import { useFavorites } from '@/hooks/use-favorites'

export function ProductCard({ 
  product, 
  userRole, 
  viewMode = 'grid',
  onClick,
  onAddToCart,
  showAddToCart = true,
  showDiscount = true,
  showRibbons = true,
  className = ''
}: ProductCardProps) {
  const { showVatForAssociate } = usePricing()
  const { toggleFavorite, isFavorite } = useFavorites()
  const isAssociate = userRole === 'ASSOCIATE'
  
  // Obtener precios calculados según el rol del usuario y preferencia de IVA
  const pricing = getDisplayPrice(product.basePrice, userRole, undefined, showVatForAssociate)
  
  const gridClass = viewMode === 'grid' 
    ? 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'
    : 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex gap-4'
  
  const imageClass = viewMode === 'grid'
    ? 'w-full aspect-[3/4] object-cover'
    : 'w-32 aspect-[3/4] object-cover flex-shrink-0'
    
  const contentClass = viewMode === 'grid'
    ? 'p-4'
    : 'p-4 flex-1'

  const handleClick = () => {
    if (onClick) {
      onClick(product)
    } else {
      window.location.href = `/productos/${product.slug}`
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(product.id, product.name)
  }

  return (
    <div className={`${gridClass} ${className}`}>
      <div 
        className="relative cursor-pointer"
        onClick={handleClick}
      >
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={viewMode === 'grid' ? 300 : 128}
            height={viewMode === 'grid' ? 400 : 172}
            className={imageClass}
            onError={(e) => {
              // Fallback a imagen por defecto si falla
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className={`${imageClass} bg-gray-200 flex items-center justify-center`}>
            <Image
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80"
              alt="Imagen por defecto"
              width={viewMode === 'grid' ? 300 : 128}
              height={viewMode === 'grid' ? 400 : 172}
              className={imageClass}
            />
          </div>
        )}
        
        {/* Ribbons */}
        {showRibbons && (
          <>
            {product.stockStatus === 'low_stock' && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Stock limitado
              </div>
            )}
            {product.stockStatus === 'out_of_stock' && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Agotado
              </div>
            )}
            {product.isRealTimeData && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                ✓ Actualizado
              </div>
            )}
            {product.isOffer && product.stockStatus === 'in_stock' && (
              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                ¡Oferta!
              </div>
            )}
          </>
        )}
      </div>
      
      <div className={contentClass}>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{product.name}</h3>
          {viewMode === 'grid' && (
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold text-[#f0a04b]">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span>{formatPrice(pricing.displayPrice, 'EUR', pricing.showWithVat)}</span>
                    {isAssociate && pricing.originalPrice && (
                      <span className="text-base text-gray-500 line-through">
                        {formatPrice(pricing.originalPrice, 'EUR', false)}
                      </span>
                    )}
                  </div>
                  {isAssociate && (
                    <span className="text-xs text-gray-600 mt-1">
                      {showVatForAssociate ? 'Con IVA' : 'Sin IVA'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorite(product.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart size={18} className={isFavorite(product.id) ? 'fill-current' : ''} />
                </button>
                {showAddToCart && (
                  <button
                    onClick={handleAddToCart}
                    className="bg-[#183a1d] text-white p-2 rounded-lg hover:bg-[#2a5530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={product.availability === 'out_of_stock'}
                  >
                    <ShoppingCart size={18} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {viewMode === 'list' && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-xl font-bold text-[#f0a04b]">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span>{formatPrice(pricing.displayPrice, 'EUR', pricing.showWithVat)}</span>
                  {isAssociate && pricing.originalPrice && (
                    <span className="text-base text-gray-500 line-through">
                      {formatPrice(pricing.originalPrice, 'EUR', false)}
                    </span>
                  )}
                </div>
                {isAssociate && (
                  <span className="text-xs text-gray-600 mt-1">
                    {showVatForAssociate ? 'Con IVA' : 'Sin IVA'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite(product.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart size={18} className={isFavorite(product.id) ? 'fill-current' : ''} />
              </button>
              {showAddToCart && (
                <button
                  onClick={handleAddToCart}
                  className="bg-[#183a1d] text-white p-2 rounded-lg hover:bg-[#2a5530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.availability === 'out_of_stock'}
                >
                  <ShoppingCart size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard