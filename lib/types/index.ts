// API Types from Nieuwkoop Europe
export interface NieuwkoopProduct {
  id: string
  name: string
  description: string
  basePrice: number
  currency: string
  category: string
  subcategory?: string
  images: string[]
  stock: number
  dimensions?: {
    height?: number
    width?: number
    depth?: number
    weight?: number
  }
  tags: string[]
  brand?: string
  material?: string
  location?: string
  availability: 'in_stock' | 'low_stock' | 'out_of_stock'
}

// Internal Product Types with Pricing
export interface Product extends Omit<NieuwkoopProduct, 'basePrice'> {
  basePrice: number
  finalPrice: number
  discountedPrice?: number
  priceMultiplier: number
  associateDiscount?: number
}

// User Types
export type UserRole = 'admin' | 'associate' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isAssociate: boolean
  associateDiscount: number
  createdAt: Date
  updatedAt: Date
}

// Pricing Configuration
export interface PricingConfig {
  id: string
  priceMultiplier: number
  associateDiscount: number
  currency: string
  lastUpdated: Date
  updatedBy: string
}

// Cart Types
export interface CartItem {
  productId: string
  product: Product
  quantity: number
  priceAtAdd: number
  discountApplied?: number
}

export interface Cart {
  id: string
  userId?: string
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  userId?: string
  customerInfo: {
    name: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      postalCode: string
      country: string
    }
  }
  items: CartItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  currency: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

// Blog Types
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  author: {
    name: string
    avatar?: string
  }
  categories: string[]
  tags: string[]
  published: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// Service Types
export interface Service {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  images: string[]
  features: string[]
  price?: {
    from: number
    currency: string
    unit: string
  }
  duration?: string
  availability: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

// Search and Filter Types
export interface ProductFilters {
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  brand?: string
  material?: string
  tags?: string[]
  search?: string
}

export interface SearchParams {
  q?: string
  page?: number
  limit?: number
  sort?: 'name' | 'price' | 'created' | 'popularity'
  order?: 'asc' | 'desc'
  filters?: ProductFilters
}