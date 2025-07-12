import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todos los productos ocultos (active: false)
    const hiddenProducts = await prisma.product.findMany({
      where: {
        active: false
      },
      select: {
        id: true,
        nieuwkoopId: true,
        sku: true,
        name: true,
        active: true,
        category: true,
        subcategory: true,
        basePrice: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { updatedAt: 'desc' }, // Los más recientemente ocultos primero
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      products: hiddenProducts.map(product => ({
        id: product.id,
        itemCode: product.nieuwkoopId,
        sku: product.sku,
        name: product.name,
        active: product.active,
        category: product.category,
        subcategory: product.subcategory,
        price: product.basePrice,
        displayText: `${product.nieuwkoopId} - ${product.name}`,
        isHidden: !product.active,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      })),
      meta: {
        totalHidden: hiddenProducts.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error fetching hidden products:', error)
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