import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Buscar el producto por ID
    const product = await prisma.product.findUnique({
      where: {
        id: id,
        active: true // Solo productos activos
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Obtener configuración de precios para incluir en la respuesta
    const priceMultiplierConfig = await prisma.configuration.findUnique({
      where: { key: 'price_multiplier' }
    })
    const associateDiscountConfig = await prisma.configuration.findUnique({
      where: { key: 'associate_discount' }
    })
    
    const priceMultiplier = priceMultiplierConfig?.value ? parseFloat(priceMultiplierConfig.value.toString()) : 2.5
    const associateDiscount = associateDiscountConfig?.value ? parseInt(associateDiscountConfig.value.toString()) : 20

    return NextResponse.json({
      success: true,
      product,
      config: {
        priceMultiplier,
        associateDiscount: associateDiscount / 100,
        vatRate: 0.21
      }
    })

  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}