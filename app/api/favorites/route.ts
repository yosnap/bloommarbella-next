import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            nieuwkoopId: true,
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      favorites: favorites.map(favorite => ({
        id: favorite.id,
        createdAt: favorite.createdAt,
        product: favorite.product
      }))
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ error: 'Product already in favorites' }, { status: 400 })
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        productId: productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Product added to favorites',
      favorite: {
        id: favorite.id,
        createdAt: favorite.createdAt,
        product: favorite.product
      }
    })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Find and delete the favorite
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    })

    if (!favorite) {
      return NextResponse.json({ error: 'Product not in favorites' }, { status: 404 })
    }

    await prisma.favorite.delete({
      where: { id: favorite.id }
    })

    return NextResponse.json({
      message: 'Product removed from favorites'
    })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}