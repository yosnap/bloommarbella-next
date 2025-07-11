import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        products: []
      })
    }

    // Buscar productos por ItemCode (nieuwkoopId), SKU o nombre
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { nieuwkoopId: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        nieuwkoopId: true,
        sku: true,
        name: true,
        active: true,
        category: true,
        basePrice: true
      },
      take: 10,
      orderBy: [
        { nieuwkoopId: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        id: product.id,
        itemCode: product.nieuwkoopId,
        sku: product.sku,
        name: product.name,
        active: product.active,
        category: product.category,
        price: product.basePrice,
        displayText: `${product.nieuwkoopId} - ${product.name}`,
        isHidden: !product.active
      }))
    })

  } catch (error: any) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}