import { UserRole } from '@prisma/client'
import { calculatePrice, formatPrice } from '@/lib/pricing'
import type { NieuwkoopProduct } from './client'

export interface TransformedProduct {
  id: string
  nieuwkoopId: string
  sku: string
  name: string
  description?: string
  category: string
  subcategory?: string
  basePrice: number
  displayPrice: number
  formattedPrice: string
  originalPrice?: number
  discountPercentage?: number
  currency: string
  stock: number
  images: string[]
  specifications?: Record<string, any>
  dimensions?: {
    height?: number
    width?: number
    depth?: number
    diameter?: number
  }
  weight?: number
  availability: 'in_stock' | 'out_of_stock' | 'limited'
  availabilityText: string
  tags?: string[]
  isNew?: boolean
  isFeatured?: boolean
  seo: {
    slug: string
    metaTitle: string
    metaDescription: string
  }
  createdAt: string
  updatedAt: string
}

export interface ProductTransformOptions {
  userRole?: UserRole
  includeOutOfStock?: boolean
  currency?: string
}

class ProductTransformer {
  /**
   * Transform a single Nieuwkoop product into our internal format
   */
  static transformProduct(
    product: NieuwkoopProduct, 
    options: ProductTransformOptions = {}
  ): TransformedProduct {
    const { userRole = 'CUSTOMER', currency = 'EUR' } = options
    
    // Calculate prices based on user role
    const basePrice = product.price
    const priceResult = calculatePrice(basePrice, userRole)
    const displayPrice = priceResult.priceWithVat
    const originalPriceResult = userRole === 'ASSOCIATE' ? calculatePrice(basePrice, 'CUSTOMER') : null
    const originalPrice = originalPriceResult?.priceWithVat
    
    // Calculate discount percentage for associates
    const discountPercentage = originalPrice 
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : undefined

    // Generate availability text
    const availabilityText = this.getAvailabilityText(product.availability, product.stock)
    
    // Generate SEO-friendly slug
    const slug = this.generateSlug(product.name, product.sku)
    
    // Check if product is new (created in last 30 days)
    const isNew = this.isProductNew(product.createdAt)
    
    return {
      id: `bloom_${product.id}`,
      nieuwkoopId: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      basePrice,
      displayPrice,
      formattedPrice: formatPrice(displayPrice, currency),
      originalPrice,
      discountPercentage,
      currency,
      stock: product.stock,
      images: this.processImages(product.images),
      specifications: product.specifications,
      dimensions: product.dimensions,
      weight: product.weight,
      availability: product.availability,
      availabilityText,
      tags: product.tags,
      isNew,
      isFeatured: this.isFeaturedProduct(product),
      seo: {
        slug,
        metaTitle: `${product.name} - Bloom Marbella`,
        metaDescription: product.description 
          ? `${product.description.substring(0, 150)}... Disponible en Bloom Marbella.`
          : `${product.name} disponible en Bloom Marbella. Entrega rápida en Marbella y Costa del Sol.`
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  }

  /**
   * Transform multiple products
   */
  static transformProducts(
    products: NieuwkoopProduct[], 
    options: ProductTransformOptions = {}
  ): TransformedProduct[] {
    return products
      .map(product => this.transformProduct(product, options))
      .filter(product => {
        // Filter out out-of-stock products if requested
        if (!options.includeOutOfStock && product.availability === 'out_of_stock') {
          return false
        }
        return true
      })
  }

  /**
   * Generate SEO-friendly slug
   */
  private static generateSlug(name: string, sku: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    return `${baseSlug}-${sku.toLowerCase()}`
  }

  /**
   * Get availability text in Spanish
   */
  private static getAvailabilityText(availability: string, stock: number): string {
    switch (availability) {
      case 'in_stock':
        if (stock > 10) return 'En stock'
        if (stock > 0) return `Últimas ${stock} unidades`
        return 'Disponible'
      
      case 'limited':
        return 'Stock limitado'
      
      case 'out_of_stock':
        return 'Agotado'
      
      default:
        return 'Consultar disponibilidad'
    }
  }

  /**
   * Check if product is new (created in last 30 days)
   */
  private static isProductNew(createdAt: string): boolean {
    const createdDate = new Date(createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return createdDate > thirtyDaysAgo
  }

  /**
   * Determine if product should be featured
   */
  private static isFeaturedProduct(product: NieuwkoopProduct): boolean {
    // Mark as featured if:
    // - High stock and popular categories
    // - Has good availability
    // - Popular plant types
    
    const featuredCategories = ['Plantas', 'Macetas']
    const featuredTags = ['premium', 'popular', 'facil-cuidado', 'interior']
    
    if (!featuredCategories.includes(product.category)) return false
    if (product.availability === 'out_of_stock') return false
    if (product.stock < 5) return false
    
    // Check for featured tags
    const hasFeaturedTag = product.tags?.some(tag => 
      featuredTags.some(featuredTag => tag.includes(featuredTag))
    )
    
    return hasFeaturedTag || product.price > 50 // Premium products
  }

  /**
   * Process and validate image URLs
   */
  private static processImages(images: string[]): string[] {
    return images
      .filter(url => url && url.startsWith('http'))
      .map(url => {
        // Add quality parameters for better performance
        if (url.includes('unsplash.com')) {
          return `${url}&auto=format&fit=crop&w=800&q=80`
        }
        return url
      })
  }

  /**
   * Transform for search results (lightweight version)
   */
  static transformForSearch(
    product: NieuwkoopProduct,
    options: ProductTransformOptions = {}
  ): Partial<TransformedProduct> {
    const { userRole = 'CUSTOMER' } = options
    
    return {
      id: `bloom_${product.id}`,
      nieuwkoopId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      displayPrice: calculatePrice(product.price, userRole).priceWithVat,
      formattedPrice: formatPrice(calculatePrice(product.price, userRole).priceWithVat),
      images: product.images.slice(0, 1), // Only first image for search
      availability: product.availability,
      availabilityText: this.getAvailabilityText(product.availability, product.stock),
      seo: {
        slug: this.generateSlug(product.name, product.sku),
        metaTitle: product.name,
        metaDescription: product.description?.substring(0, 100) || ''
      }
    }
  }

  /**
   * Transform for cart items
   */
  static transformForCart(
    product: NieuwkoopProduct,
    quantity: number,
    userRole: UserRole = 'CUSTOMER'
  ) {
    const unitPrice = calculatePrice(product.price, userRole).priceWithVat
    const totalPrice = unitPrice * quantity
    
    return {
      id: `bloom_${product.id}`,
      nieuwkoopId: product.id,
      sku: product.sku,
      name: product.name,
      image: product.images[0],
      unitPrice,
      quantity,
      totalPrice,
      formattedUnitPrice: formatPrice(unitPrice),
      formattedTotalPrice: formatPrice(totalPrice),
      availability: product.availability,
      stock: product.stock,
      maxQuantity: Math.min(product.stock, 10) // Limit cart quantity
    }
  }
}

export { ProductTransformer }