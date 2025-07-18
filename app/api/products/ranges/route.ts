import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener todos los productos activos para calcular rangos globales
    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        basePrice: true,
        specifications: true
      }
    })

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        ranges: {
          priceRange: { min: 0, max: 5000 },
          heightRange: { min: 0, max: 300 },
          widthRange: { min: 0, max: 200 }
        }
      })
    }

    // Calcular rangos con multiplicador de precio por defecto (2.5)
    const priceMultiplier = 2.5
    
    const prices = products.map(p => p.basePrice * priceMultiplier).filter(p => p > 0)
    
    // Safely extract height and width from specifications JsonValue
    const heights = products
      .map(p => {
        if (p.specifications && typeof p.specifications === 'object' && 'height' in p.specifications) {
          const height = p.specifications.height
          return typeof height === 'number' ? height : null
        }
        return null
      })
      .filter(h => h !== null && h > 0) as number[]
      
    const widths = products
      .map(p => {
        if (p.specifications && typeof p.specifications === 'object' && 'width' in p.specifications) {
          const width = p.specifications.width
          return typeof width === 'number' ? width : null
        }
        return null
      })
      .filter(w => w !== null && w > 0) as number[]

    const ranges = {
      priceRange: {
        min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
        max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 5000
      },
      heightRange: {
        min: heights.length > 0 ? Math.floor(Math.min(...heights)) : 0,
        max: heights.length > 0 ? Math.ceil(Math.max(...heights)) : 300
      },
      widthRange: {
        min: widths.length > 0 ? Math.floor(Math.min(...widths)) : 0,
        max: widths.length > 0 ? Math.ceil(Math.max(...widths)) : 200
      }
    }

    console.log('📊 Global ranges calculated:', ranges)

    return NextResponse.json({
      success: true,
      ranges
    })
  } catch (error) {
    console.error('Error calculating global ranges:', error)
    
    // Retornar rangos por defecto en caso de error
    return NextResponse.json({
      success: false,
      ranges: {
        priceRange: { min: 0, max: 5000 },
        heightRange: { min: 0, max: 300 },
        widthRange: { min: 0, max: 200 }
      }
    })
  }
}