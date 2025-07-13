import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hybridSync } from '@/lib/nieuwkoop/hybrid-sync'
import { getDisplayPrice, calculatePrice } from '@/lib/pricing'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getProductImageUrls } from '@/lib/utils/images'

export async function GET(request: NextRequest) {
  try {
    // Get user session for pricing
    const session = await getServerSession(authOptions)
    const userRole: UserRole = session?.user?.role || 'CUSTOMER'

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get('page') || '1'
    const limitParam = searchParams.get('limit') || '20'
    
    // Debug log
    console.log('📊 API params received:', { pageParam, limitParam })
    
    const page = parseInt(pageParam)
    const limit = Math.min(parseInt(limitParam), 100)
    
    // Validate params
    if (isNaN(page) || page < 1) {
      console.error('❌ Invalid page parameter:', pageParam)
      return NextResponse.json(
        { success: false, error: 'Invalid page parameter' },
        { status: 400 }
      )
    }
    
    if (isNaN(limit) || limit < 1) {
      console.error('❌ Invalid limit parameter:', limitParam)
      return NextResponse.json(
        { success: false, error: 'Invalid limit parameter' },
        { status: 400 }
      )
    }
    
    console.log('✅ Parsed params:', { page, limit })
    const category = searchParams.get('category')
    const categories = searchParams.get('categories')
    const brands = searchParams.get('brands')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    
    // Parse advanced filter parameters
    const priceMin = searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined
    const priceMax = searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined
    const heightMin = searchParams.get('heightMin') ? parseFloat(searchParams.get('heightMin')!) : undefined
    const heightMax = searchParams.get('heightMax') ? parseFloat(searchParams.get('heightMax')!) : undefined
    const widthMin = searchParams.get('widthMin') ? parseFloat(searchParams.get('widthMin')!) : undefined
    const widthMax = searchParams.get('widthMax') ? parseFloat(searchParams.get('widthMax')!) : undefined
    const inStock = searchParams.get('inStock') === 'true'
    const location = searchParams.get('location')?.split(',').filter(l => l.trim()) || []
    const plantingSystem = searchParams.get('plantingSystem')?.split(',').filter(p => p.trim()) || []
    const colors = searchParams.get('colors')?.split(',').filter(c => c.trim()) || []
    const advancedCategories = searchParams.get('advancedCategories')?.split(',').filter(c => c.trim()) || []

    // Parse categories parameter (comma-separated list)
    const categoryFilters = categories ? categories.split(',').map(c => c.trim()).filter(c => c) : []
    // Parse brands parameter (comma-separated list)
    const brandFilters = brands ? brands.split(',').map(b => b.trim()).filter(b => b) : []
    
    // Get products with real-time data
    const result = await hybridSync.getProductsWithRealtimeData({
      category: category || undefined,
      categories: categoryFilters,
      brands: brandFilters,
      search: search || undefined,
      page,
      limit,
      sortBy,
      sortOrder,
      // Advanced filters
      priceMin,
      priceMax,
      heightMin,
      heightMax,
      widthMin,
      widthMax,
      inStock,
      location,
      plantingSystem,
      colors,
      advancedCategories
    })

    // Get pricing configuration
    const priceMultiplierConfig = await prisma.configuration.findUnique({
      where: { key: 'price_multiplier' }
    })
    const associateDiscountConfig = await prisma.configuration.findUnique({
      where: { key: 'associate_discount' }
    })
    
    const priceMultiplier = priceMultiplierConfig?.value ? parseFloat(priceMultiplierConfig.value.toString()) : 2.5
    const associateDiscount = associateDiscountConfig?.value ? parseInt(associateDiscountConfig.value.toString()) : 20
    
    // Transform products with user-specific pricing
    const transformedProducts = result.products.map(product => {
      const pricing = calculatePrice(product.currentPrice, userRole, {
        priceMultiplier,
        associateDiscount: associateDiscount / 100, // Convertir porcentaje a decimal
        vatRate: 0.21 // 21% IVA
      })
      
      const displayData = getDisplayPrice(product.currentPrice, userRole, {
        priceMultiplier,
        associateDiscount: associateDiscount / 100,
        vatRate: 0.21
      })
      
      return {
        id: product.id,
        nieuwkoopId: product.nieuwkoopId,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        images: getProductImageUrls(product.sku), // Generar URLs dinámicamente
        specifications: product.specifications,
        sysmodified: product.sysmodified,
        
        // Pricing
        basePrice: product.currentPrice,
        displayPrice: displayData.displayPrice,
        originalPrice: displayData.originalPrice,
        priceWithoutVat: pricing.priceWithoutVat,
        priceWithVat: pricing.priceWithVat,
        originalPriceWithoutVat: pricing.originalPriceWithoutVat,
        originalPriceWithVat: pricing.originalPriceWithVat,
        hasDiscount: pricing.hasDiscount,
        discountPercentage: pricing.discountPercentage,
        showWithVat: displayData.showWithVat,
        
        // Stock
        stock: product.currentStock,
        stockStatus: product.stockStatus,
        availability: product.stockStatus === 'out_of_stock' ? 'out_of_stock' : 
                     product.stockStatus === 'low_stock' ? 'limited' : 'in_stock',
        
        // Meta
        active: product.active,
        popularity: product.popularity || 0,
        isRealTimeData: product.isRealTimeData,
        lastPriceCheck: product.lastPriceCheck,
        
        // Computed fields
        isFeatured: (product.popularity || 0) > 5,
        isNew: new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
        isOffer: product.specifications?.isOffer === true,
        
        // Display helpers
        stockText: product.stockStatus === 'out_of_stock' ? 'Agotado' :
                   product.stockStatus === 'low_stock' ? 'Stock limitado' : 'Disponible',
        priceText: `€${displayData.displayPrice.toFixed(2)}${displayData.showWithVat ? ' (IVA inc.)' : ''}`,
        originalPriceText: displayData.originalPrice ? `€${displayData.originalPrice.toFixed(2)}` : null
      }
    })

    // Get filter counts for the current query (without pagination)
    const filterInfo = await hybridSync.getFilterCounts({
      category: category || undefined,
      categories: categoryFilters,
      brands: brandFilters,
      search: search || undefined,
      // Advanced filters for counting
      priceMin,
      priceMax,
      heightMin,
      heightMax,
      widthMin,
      widthMax,
      inStock,
      location,
      plantingSystem,
      colors,
      advancedCategories
    })

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total: result.pagination.total,
        totalPages: Math.ceil(result.pagination.total / limit),
        hasNextPage: page < Math.ceil(result.pagination.total / limit),
        hasPrevPage: page > 1
      },
      meta: {
        userRole,
        totalProducts: result.pagination.total,
        realTimeDataCount: transformedProducts.filter(p => p.isRealTimeData).length,
        timestamp: new Date().toISOString()
      },
      filters: filterInfo,
      config: {
        priceMultiplier,
        associateDiscount: associateDiscount / 100,
        vatRate: 0.21
      }
    })
  } catch (error: any) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener productos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}