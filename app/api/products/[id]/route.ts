import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProductTransformer } from '@/lib/nieuwkoop/transformers'
import { UserRole } from '@prisma/client'
import { getDisplayPrice, calculatePrice } from '@/lib/pricing'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Get user session for pricing
    const session = await getServerSession(authOptions)
    const userRole: UserRole = session?.user?.role || 'CUSTOMER'

    // Find product by ID (can be internal ID or nieuwkoopId or SKU)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { nieuwkoopId: id },
          { sku: id }
        ],
        active: true
      },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Convert to NieuwkoopProduct format for transformer
    const nieuwkoopProduct = {
      id: product.nieuwkoopId,
      sku: product.sku,
      name: product.name,
      description: product.description || undefined,
      category: product.category,
      subcategory: product.subcategory || undefined,
      price: product.basePrice,
      currency: 'EUR',
      stock: product.stock,
      images: product.images,
      specifications: product.specifications as Record<string, any>,
      availability: product.stock > 0 ? 'in_stock' as const : 'out_of_stock' as const,
      tags: [], // Add tags if available in your schema
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }

    // Get pricing configuration
    const priceMultiplierConfig = await prisma.configuration.findUnique({
      where: { key: 'price_multiplier' }
    })
    const associateDiscountConfig = await prisma.configuration.findUnique({
      where: { key: 'associate_discount' }
    })
    
    const priceMultiplier = priceMultiplierConfig?.value ? parseFloat(priceMultiplierConfig.value.toString()) : 2.5
    const associateDiscount = associateDiscountConfig?.value ? parseInt(associateDiscountConfig.value.toString()) : 20
    
    // Calculate pricing
    const pricing = calculatePrice(product.basePrice, userRole, {
      priceMultiplier,
      associateDiscount: associateDiscount / 100,
      vatRate: 0.21
    })
    
    const displayData = getDisplayPrice(product.basePrice, userRole, {
      priceMultiplier,
      associateDiscount: associateDiscount / 100,
      vatRate: 0.21
    })
    
    // Transform product with user-specific pricing
    const transformedProduct = ProductTransformer.transformProduct(nieuwkoopProduct, {
      userRole,
      includeOutOfStock: true
    })

    // Add database-specific data and pricing
    const finalProduct = {
      ...transformedProduct,
      popularity: product._count.cartItems + product._count.orderItems,
      dbId: product.id,
      // Override pricing with new logic
      displayPrice: displayData.displayPrice,
      originalPrice: displayData.originalPrice,
      priceWithoutVat: pricing.priceWithoutVat,
      priceWithVat: pricing.priceWithVat,
      originalPriceWithoutVat: pricing.originalPriceWithoutVat,
      originalPriceWithVat: pricing.originalPriceWithVat,
      hasDiscount: pricing.hasDiscount,
      discountPercentage: pricing.discountPercentage,
      showWithVat: displayData.showWithVat,
      priceText: `€${displayData.displayPrice.toFixed(2)}${displayData.showWithVat ? ' (IVA inc.)' : ''}`,
      originalPriceText: displayData.originalPrice ? `€${displayData.originalPrice.toFixed(2)}` : null
    }

    // Get related products (same category, different product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        active: true,
        stock: { gt: 0 }
      },
      take: 4,
      orderBy: [
        { stock: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    // Transform related products
    const transformedRelated = relatedProducts.map(relatedProduct => {
      const nieuwkoopRelated = {
        id: relatedProduct.nieuwkoopId,
        sku: relatedProduct.sku,
        name: relatedProduct.name,
        description: relatedProduct.description || undefined,
        category: relatedProduct.category,
        subcategory: relatedProduct.subcategory || undefined,
        price: relatedProduct.basePrice,
        currency: 'EUR',
        stock: relatedProduct.stock,
        images: relatedProduct.images,
        specifications: relatedProduct.specifications as Record<string, any>,
        availability: relatedProduct.stock > 0 ? 'in_stock' as const : 'out_of_stock' as const,
        tags: [],
        createdAt: relatedProduct.createdAt.toISOString(),
        updatedAt: relatedProduct.updatedAt.toISOString()
      }

      return ProductTransformer.transformForSearch(nieuwkoopRelated, { userRole })
    })

    return NextResponse.json({
      success: true,
      data: finalProduct,
      related: transformedRelated,
      meta: {
        userRole,
        hasDiscount: userRole === 'ASSOCIATE',
        inStock: product.stock > 0,
        category: product.category,
        subcategory: product.subcategory
      }
    })
  } catch (error: any) {
    console.error('Product detail API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener el producto',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}