/**
 * Tipos relacionados con productos
 */

export interface Product {
  id: string
  nieuwkoopId: string
  sku: string
  slug?: string
  name: string
  description: string
  category: string
  subcategory: string
  basePrice: number
  displayPrice: number
  originalPrice?: number
  priceWithoutVat: number
  priceWithVat: number
  originalPriceWithoutVat?: number
  originalPriceWithVat?: number
  showWithVat: boolean
  stock: number
  images: string[]
  specifications: Record<string, any>
  active: boolean
  availability: 'in_stock' | 'out_of_stock' | 'limited'
  isFeatured: boolean
  popularity: number
  isRealTimeData: boolean
  lastPriceCheck: string
  hasDiscount: boolean
  discountPercentage: number
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  stockText: string
  priceText: string
  originalPriceText: string | null
  isOffer?: boolean
  sysmodified?: string | null
}

export interface ProductFilters {
  category?: string
  subcategory?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isOffer?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'popularity' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductCardProps {
  product: Product
  userRole?: 'ADMIN' | 'ASSOCIATE' | 'CUSTOMER'
  viewMode?: 'grid' | 'list'
  onClick?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  showAddToCart?: boolean
  showDiscount?: boolean
  showRibbons?: boolean
  className?: string
  priority?: boolean
  pricingConfig?: {
    priceMultiplier: number
    associateDiscount: number
    vatRate: number
  }
}

export interface ProductsResponse {
  success: boolean
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  meta: {
    userRole: string
    totalProducts: number
    realTimeDataCount: number
    timestamp: string
  }
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
  total: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  updatedAt: string
}