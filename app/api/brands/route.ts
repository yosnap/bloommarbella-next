import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all products with tags
    const products = await prisma.product.findMany({
      select: {
        id: true,
        specifications: true
      },
      where: {
        active: true
      }
    })

    // Extract brands from product tags
    const brandCounts: Record<string, number> = {}

    products.forEach(product => {
      if (product.specifications && typeof product.specifications === 'object') {
        const spec = product.specifications as any
        if (spec.tags && Array.isArray(spec.tags)) {
          spec.tags.forEach((tag: any) => {
            if (tag.code === 'Brand' && tag.value) {
              brandCounts[tag.value] = (brandCounts[tag.value] || 0) + 1
            }
          })
        }
      }
    })

    // Convert to array and sort by name
    const brandsArray = Object.entries(brandCounts)
      .map(([name, count]) => ({
        name,
        count
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      success: true,
      data: brandsArray,
      meta: {
        totalBrands: brandsArray.length,
        totalProducts: brandsArray.reduce((sum, brand) => sum + brand.count, 0)
      }
    })
  } catch (error: any) {
    console.error('Brands API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener marcas' 
      },
      { status: 500 }
    )
  }
}