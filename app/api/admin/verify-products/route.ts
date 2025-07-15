import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    console.log('🔍 Verificando productos en base de datos...')
    
    // Verificar si CC0061247 existe
    const cc0061247 = await prisma.product.findFirst({
      where: {
        OR: [
          { nieuwkoopId: 'CC0061247' },
          { sku: 'CC0061247' }
        ]
      },
      select: {
        id: true,
        nieuwkoopId: true,
        sku: true,
        name: true,
        category: true,
        subcategory: true,
        active: true,
        specifications: true,
        createdAt: true,
        updatedAt: true,
        sysmodified: true
      }
    })

    // Contar productos por categoría
    const categoryStats = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          _all: 'desc'
        }
      },
      take: 10
    })

    // Productos creados en las últimas 24 horas
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const recentProducts = await prisma.product.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    })

    // Total de productos
    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({
      where: { active: true }
    })

    // Buscar productos con especificaciones que contengan ProductGroupCode 275
    const group275Products = await prisma.product.findMany({
      where: {
        specifications: {
          path: ['productGroupCode'],
          equals: '275'
        }
      },
      select: {
        nieuwkoopId: true,
        name: true,
        specifications: true,
        createdAt: true
      },
      take: 10
    })

    // Productos de "All-in-1 concepts" (cualquier variación)
    const allInOneProducts = await prisma.product.findMany({
      where: {
        OR: [
          { subcategory: { contains: 'All-in-1', mode: 'insensitive' } },
          { subcategory: { contains: 'All in 1', mode: 'insensitive' } },
          { subcategory: { contains: 'concepts', mode: 'insensitive' } }
        ]
      },
      select: {
        nieuwkoopId: true,
        name: true,
        subcategory: true,
        specifications: true,
        createdAt: true
      },
      take: 10
    })

    return NextResponse.json({
      success: true,
      verification: {
        cc0061247: {
          exists: !!cc0061247,
          data: cc0061247
        },
        database: {
          totalProducts,
          activeProducts,
          recentProducts: recentProducts
        },
        categoryStats: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count._all
        })),
        group275Products: {
          count: group275Products.length,
          products: group275Products
        },
        allInOneProducts: {
          count: allInOneProducts.length,
          products: allInOneProducts
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error verificando productos:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error durante la verificación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}