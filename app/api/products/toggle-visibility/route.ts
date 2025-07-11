import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { productId, active } = await request.json()

    if (!productId || typeof active !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'ID del producto y estado requeridos' },
        { status: 400 }
      )
    }

    // Actualizar el estado del producto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        active,
        updatedAt: new Date()
      },
      select: {
        id: true,
        nieuwkoopId: true,
        name: true,
        active: true
      }
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: `Producto ${active ? 'mostrado' : 'ocultado'} exitosamente`
    })

  } catch (error: any) {
    console.error('Error toggling product visibility:', error)
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