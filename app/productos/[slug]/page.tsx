'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { ShoppingCart, ArrowLeft, Heart, Share2, Package, Ruler, Weight, Globe, Truck, Tag, Thermometer, Droplets, Sun, Leaf, Info, MessageCircle } from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { translateProductTagsClient, commonTagTranslationsClient } from '@/lib/translations/client-translator'
import { useUserPricing } from '@/hooks/use-user-pricing'
import { getDisplayPrice, formatPrice } from '@/lib/pricing'
import { useFavorites } from '@/hooks/use-favorites'
import { ProductBreadcrumbs } from '@/components/products/product-breadcrumbs'
import { useState as useStateHook, useEffect as useEffectHook } from 'react'
import { isNewProduct } from '@/lib/utils/badge-utils'
import { createWhatsAppLink, WhatsAppConfig } from '@/lib/whatsapp'

interface Product {
  id: string
  sku: string
  slug: string
  name: string
  description: string
  category: string
  subcategory: string
  basePrice: number
  images: string[]
  specifications: {
    material?: string
    dimensions?: {
      height?: number
      width?: number
      depth?: number
      diameter?: number
      opening?: number
    }
    weight?: number
    deliveryTime?: number
    countryOfOrigin?: string
    variety?: string
    potSize?: string
    culturePot?: {
      diameter?: number
      height?: number
    }
    gtinCode?: string
    hsCode?: string
    salesPackage?: string
    leafSize?: string
    quantityTrolley?: number
    locationIcon?: string
    citesListed?: boolean
    fytoListed?: boolean
    isOffer?: boolean
    salesOrderSize?: number
    tags?: (string | { code: string; value: string })[]
  }
  active: boolean
  currentPrice?: number
  displayPrice?: number
  originalPrice?: number
  hasDiscount?: boolean
  discountPercentage?: number
  currentStock?: number
  stockStatus?: string
  isRealTimeData?: boolean
  isOffer?: boolean
}

export default function ProductPage() {
  const { slug } = useParams()
  const slugParam = Array.isArray(slug) ? slug[0] : slug
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [translatedTags, setTranslatedTags] = useState<Array<{ code: string; value: string }>>([])
  const [newBadgeDays, setNewBadgeDays] = useStateHook(30)
  const [pricingConfig, setPricingConfig] = useState<{priceMultiplier: number, associateDiscount: number, vatRate: number} | null>(null)
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig | null>(null)
  const { userRole, isAssociate, showVatForAssociate } = useUserPricing()
  const { toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    if (slugParam) {
      fetchProduct()
    }
  }, [slugParam])

  // Cargar configuración de WhatsApp
  useEffect(() => {
    const loadWhatsAppConfig = async () => {
      try {
        const response = await fetch('/api/whatsapp-config')
        if (response.ok) {
          const data = await response.json()
          setWhatsappConfig(data.data)
        }
      } catch (error) {
        console.error('Error loading WhatsApp config:', error)
      }
    }
    loadWhatsAppConfig()
  }, [])

  // Obtener configuración de badge "Nuevo"
  useEffectHook(() => {
    const getConfig = async () => {
      try {
        const response = await fetch('/api/admin/configuration')
        if (response.ok) {
          const data = await response.json()
          setNewBadgeDays(data.data?.newBadgeDays || 30)
        }
      } catch (error) {
        console.error('Error getting badge config:', error)
      }
    }
    getConfig()
  }, [])

  // Traducir tags cuando el producto se carga
  useEffect(() => {
    if (product?.specifications?.tags) {
      const translateTags = async () => {
        try {
          const translated = await translateProductTagsClient(product.specifications.tags || [])
          setTranslatedTags(translated)
        } catch (error) {
          console.error('Error translating tags:', error)
          // Fallback: usar traducciones comunes del cliente
          const fallbackTags = (product.specifications.tags || []).map(tag => {
            if (typeof tag === 'string') {
              return { code: 'Característica', value: tag }
            } else if (tag && typeof tag === 'object' && 'code' in tag && 'value' in tag) {
              const translatedCode = commonTagTranslationsClient[tag.code.toLowerCase()] || tag.code
              const translatedValue = commonTagTranslationsClient[tag.value.toLowerCase()] || tag.value
              return { code: translatedCode, value: translatedValue }
            } else {
              return { code: 'Característica', value: 'Información no disponible' }
            }
          })
          setTranslatedTags(fallbackTags)
        }
      }
      translateTags()
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/slug/${slugParam}`)
      if (response.ok) {
        const data = await response.json()
        const { config, ...productData } = data
        setProduct(productData)
        if (config) {
          setPricingConfig(config)
        }
      } else {
        console.error('Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppContact = () => {
    if (whatsappConfig && whatsappConfig.whatsappEnabled && product) {
      const whatsappUrl = createWhatsAppLink(whatsappConfig, {
        name: product.name,
        slug: product.slug
      })
      window.open(whatsappUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183a1d] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-8">El producto que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => router.push('/catalogo')}
            className="bg-[#183a1d] text-white px-6 py-3 rounded-lg hover:bg-[#2a5530] transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            Volver al catálogo
          </button>
        </div>
      </div>
    )
  }

  const hasImages = product.images && product.images.length > 0
  const isNew = isNewProduct((product as any).sysmodified, newBadgeDays)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumbs */}
      <ProductBreadcrumbs 
        productName={product.name}
        category={product.category}
        subcategory={product.subcategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imágenes */}
          <div className="space-y-4">
            {hasImages ? (
              <>
                <div className="aspect-[3/4] bg-white rounded-lg shadow-sm overflow-hidden relative">
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    width={600}
                    height={800}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  {/* Badge "Nuevo" - DESACTIVADO temporalmente hasta que se corrija sysmodified */}
                  {/* {isNew && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                      Nuevo
                    </div>
                  )} */}
                  {/* Ribbon de oferta */}
                  {(product.isOffer || product.specifications?.isOffer) && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
                      ¡OFERTA ESPECIAL!
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-[#183a1d]' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          width={80}
                          height={107}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=80&auto=format&fit=crop&q=80';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] bg-gray-200 rounded-lg shadow-sm flex items-center justify-center">
                <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>{product.category}</span>
                {product.subcategory && (
                  <>
                    <span>•</span>
                    <span>{product.subcategory}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg mb-4">{product.description}</p>
              
              {/* Información adicional */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">SKU: {product.sku}</span>
                </div>
                {product.specifications?.variety && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Variedad: {product.specifications.variety}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Entrega: {product.specifications?.deliveryTime || 'Consultar'}</span>
                </div>
                {product.specifications?.countryOfOrigin && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Origen: {product.specifications.countryOfOrigin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Precio */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {(() => {
                    const basePrice = product.basePrice || product.currentPrice || 0
                    const pricing = getDisplayPrice(basePrice, userRole, pricingConfig, showVatForAssociate)
                    
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-3xl font-bold text-[#f0a04b]">
                            {formatPrice(pricing.displayPrice, 'EUR', pricing.showWithVat)}
                          </div>
                          {isAssociate && pricing.originalPrice && (
                            <div className="text-xl text-gray-500 line-through">
                              {formatPrice(pricing.originalPrice, 'EUR', false)}
                            </div>
                          )}
                        </div>
                        
                        {isAssociate && (
                          <div className="flex flex-col gap-1">
                            <div className="text-sm text-gray-600">
                              {showVatForAssociate ? 'Con IVA incluido' : 'Sin IVA'}
                            </div>
                            {pricing.originalPrice && pricingConfig && (
                              <div className="text-sm text-green-600 font-medium">
                                Descuento asociado: {Math.round(pricingConfig.associateDiscount * 100)}%
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!isAssociate && (
                          <div className="text-sm text-gray-500">
                            Precio unitario
                          </div>
                        )}
                        
                        {session?.user?.role === 'ADMIN' && (
                          <div className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded mt-2">
                            Precio base (Nieuwkoop): {formatPrice(basePrice, 'EUR', false)}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stockStatus === 'in_stock' ? 'bg-green-100 text-green-800' :
                    product.stockStatus === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stockStatus === 'in_stock' ? 'En stock' :
                     product.stockStatus === 'low_stock' ? 'Stock limitado' :
                     'Agotado'}
                  </div>
                </div>
              </div>

              {/* Cantidad y acciones */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {/* Mostrar botón de WhatsApp si está habilitado, sino mostrar carrito */}
                {whatsappConfig?.whatsappEnabled ? (
                  <button
                    onClick={handleWhatsAppContact}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={product.stockStatus === 'out_of_stock'}
                  >
                    <MessageCircle size={20} />
                    Quiero comprarlo
                  </button>
                ) : (
                  <button
                    className="flex-1 bg-[#183a1d] text-white px-6 py-3 rounded-lg hover:bg-[#2a5530] transition-colors flex items-center justify-center gap-2"
                    disabled={product.stockStatus === 'out_of_stock'}
                  >
                    <ShoppingCart size={20} />
                    Agregar al carrito
                  </button>
                )}
                <button 
                  onClick={() => toggleFavorite(product.id, product.name)}
                  className={`p-3 rounded-lg transition-colors ${
                    isFavorite(product.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart size={20} className={isFavorite(product.id) ? 'fill-current' : ''} />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Especificaciones */}
            {product.specifications && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones Técnicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.specifications.material && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Material:</span>
                        <p className="text-sm text-gray-900">{product.specifications.material}</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.dimensions && (
                    <div className="flex items-start gap-3">
                      <Ruler className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Dimensiones:</span>
                        <div className="text-sm text-gray-900">
                          {product.specifications.dimensions.height && <p>Alto: {product.specifications.dimensions.height} cm</p>}
                          {product.specifications.dimensions.width && <p>Ancho: {product.specifications.dimensions.width} cm</p>}
                          {product.specifications.dimensions.depth && <p>Profundidad: {product.specifications.dimensions.depth} cm</p>}
                          {product.specifications.dimensions.diameter && <p>Diámetro: {product.specifications.dimensions.diameter} cm</p>}
                          {product.specifications.dimensions.opening && <p>Abertura: {product.specifications.dimensions.opening} cm</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  {product.specifications.weight && (
                    <div className="flex items-start gap-3">
                      <Weight className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Peso:</span>
                        <p className="text-sm text-gray-900">{product.specifications.weight} kg</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.countryOfOrigin && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">País de origen:</span>
                        <p className="text-sm text-gray-900">{product.specifications.countryOfOrigin}</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.potSize && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tamaño de maceta:</span>
                        <p className="text-sm text-gray-900">{product.specifications.potSize}</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.culturePot && (product.specifications.culturePot.diameter || product.specifications.culturePot.height) && (
                    <div className="flex items-start gap-3">
                      <Ruler className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Maceta de cultivo:</span>
                        <div className="text-sm text-gray-900">
                          {product.specifications.culturePot.diameter && <p>Diámetro: {product.specifications.culturePot.diameter} cm</p>}
                          {product.specifications.culturePot.height && <p>Alto: {product.specifications.culturePot.height} cm</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  {product.specifications.gtinCode && (
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Código GTIN:</span>
                        <p className="text-sm text-gray-900">{product.specifications.gtinCode}</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.hsCode && (
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Código HS:</span>
                        <p className="text-sm text-gray-900">{product.specifications.hsCode}</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.salesPackage && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Paquete de venta:</span>
                        <p className="text-sm text-gray-900">{product.specifications.salesPackage}</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.leafSize && (
                    <div className="flex items-start gap-3">
                      <Leaf className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tamaño de hoja:</span>
                        <p className="text-sm text-gray-900">{product.specifications.leafSize}</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.quantityTrolley && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Cantidad por carrito:</span>
                        <p className="text-sm text-gray-900">{product.specifications.quantityTrolley}</p>
                      </div>
                    </div>
                  )}
                  {product.specifications.salesOrderSize && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tamaño mínimo de pedido:</span>
                        <p className="text-sm text-gray-900">{product.specifications.salesOrderSize}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Certificaciones y características especiales */}
                {(product.specifications.citesListed || product.specifications.fytoListed || product.specifications.isOffer) && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Certificaciones:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.specifications.citesListed && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          CITES
                        </span>
                      )}
                      {product.specifications.fytoListed && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Fitosanitario
                        </span>
                      )}
                      {product.specifications.isOffer && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                          Oferta especial
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Tags si existen */}
                {translatedTags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Características adicionales:</h4>
                    <div className="space-y-2">
                      {translatedTags.map((tag, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="font-medium text-gray-600 min-w-[120px]">{tag.code}:</span>
                          <span className="text-gray-900">{tag.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}