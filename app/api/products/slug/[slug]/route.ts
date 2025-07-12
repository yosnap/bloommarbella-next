import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hybridSync } from '@/lib/nieuwkoop/hybrid-sync'
import { calculatePrice } from '@/lib/pricing'
import { translateCategory, translateSubcategory } from '@/lib/translations'
import { UserRole } from '@prisma/client'
import { getProductImageUrls } from '@/lib/utils/images'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Get user session for pricing
    const session = await getServerSession(authOptions)
    const userRole: UserRole = session?.user?.role || 'CUSTOMER'

    // Get product by slug from database
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        description: true,
        category: true,
        subcategory: true,
        basePrice: true,
        stock: true,
        images: true,
        specifications: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get pricing configuration
    const priceMultiplierConfig = await prisma.configuration.findUnique({
      where: { key: 'price_multiplier' }
    })
    const associateDiscountConfig = await prisma.configuration.findUnique({
      where: { key: 'associate_discount' }
    })
    const deliveryTimeConfig = await prisma.configuration.findUnique({
      where: { key: 'delivery_time' }
    })
    
    const priceMultiplier = priceMultiplierConfig ? parseFloat(priceMultiplierConfig.value.toString()) : 2.5
    const associateDiscount = associateDiscountConfig ? parseInt(associateDiscountConfig.value.toString()) : 20
    const deliveryTime = deliveryTimeConfig ? deliveryTimeConfig.value.toString() : '3-5 días laborables'

    // Get real-time price and stock
    try {
      const hybridProduct = await hybridSync.getProductWithRealtimeData(product.sku)
      
      // Transform product with user-specific pricing
      const originalPrice = hybridProduct.currentPrice * priceMultiplier
      const displayPrice = userRole === 'ASSOCIATE' 
        ? originalPrice * (1 - associateDiscount / 100)
        : originalPrice
      
      const transformedProduct = {
        ...hybridProduct,
        // Translated categories
        category: translateCategory(hybridProduct.category),
        subcategory: translateSubcategory(hybridProduct.subcategory),
        
        // Dynamic images
        images: getProductImageUrls(hybridProduct.sku),
        
        // Sysmodified field
        sysmodified: hybridProduct.sysmodified,
        
        // Pricing
        basePrice: hybridProduct.currentPrice,
        displayPrice,
        originalPrice,
        hasDiscount: userRole === 'ASSOCIATE',
        discountPercentage: userRole === 'ASSOCIATE' ? 20 : 0,
        
        // Stock
        currentStock: hybridProduct.currentStock,
        stockStatus: hybridProduct.stockStatus,
        
        // Override delivery time with config value
        specifications: {
          ...hybridProduct.specifications,
          deliveryTime: deliveryTime
        },
        
        // Display helpers
        stockText: hybridProduct.stockStatus === 'out_of_stock' ? 'Agotado' :
                   hybridProduct.stockStatus === 'low_stock' ? 'Stock limitado' : 'Disponible',
      }

      return NextResponse.json({
        ...transformedProduct,
        config: {
          priceMultiplier,
          associateDiscount: associateDiscount / 100,
          vatRate: 0.21
        }
      })
    } catch (error) {
      console.error('Error getting real-time data, using base data:', error)
      
      // Fallback to base data
      const originalPrice = product.basePrice * priceMultiplier
      const displayPrice = userRole === 'ASSOCIATE' 
        ? originalPrice * (1 - associateDiscount / 100)
        : originalPrice
      
      const fallbackProduct = {
        ...product,
        // Translated categories  
        category: translateCategory(product.category),
        subcategory: translateSubcategory(product.subcategory),
        
        // Dynamic images
        images: getProductImageUrls(product.sku),
        
        // Pricing
        currentPrice: product.basePrice,
        displayPrice,
        originalPrice,
        hasDiscount: userRole === 'ASSOCIATE',
        discountPercentage: userRole === 'ASSOCIATE' ? 20 : 0,
        
        // Stock
        currentStock: product.stock,
        stockStatus: product.stock === 0 ? 'out_of_stock' : 
                     product.stock < 5 ? 'low_stock' : 'in_stock',
        
        // Override delivery time with config value
        specifications: {
          ...product.specifications,
          deliveryTime: deliveryTime
        },
        
        // Display helpers
        stockText: product.stock === 0 ? 'Agotado' :
                   product.stock < 5 ? 'Stock limitado' : 'Disponible',
      }

      return NextResponse.json({
        ...fallbackProduct,
        config: {
          priceMultiplier,
          associateDiscount: associateDiscount / 100,
          vatRate: 0.21
        }
      })
    }
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}