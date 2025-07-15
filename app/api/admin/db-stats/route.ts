import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const searchCode = searchParams.get('searchCode')

    // Estadísticas generales
    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({
      where: { active: true }
    })

    // Obtener categorías más comunes
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: 10
    })

    // Obtener subcategorías más comunes
    const subcategories = await prisma.product.groupBy({
      by: ['subcategory'],
      _count: {
        subcategory: true
      },
      orderBy: {
        _count: {
          subcategory: 'desc'
        }
      },
      take: 10
    })

    // Buscar productos por código si se proporciona
    let searchResults = null
    if (searchCode) {
      searchResults = await prisma.product.findMany({
        where: {
          OR: [
            { nieuwkoopId: { contains: searchCode, mode: 'insensitive' } },
            { sku: { contains: searchCode, mode: 'insensitive' } },
            { name: { contains: searchCode, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          id: true,
          nieuwkoopId: true,
          sku: true,
          name: true,
          category: true,
          subcategory: true,
          active: true,
          createdAt: true
        }
      })
    }

    // Obtener productos con especificaciones que contengan ProductGroupCode
    const productsWithGroupCode = await prisma.product.findMany({
      where: {
        specifications: {
          not: null
        }
      },
      take: 5,
      select: {
        nieuwkoopId: true,
        name: true,
        specifications: true
      }
    })

    // Verificar específicamente CC0061247
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
        createdAt: true
      }
    })

    return NextResponse.json({
      database: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts
      },
      categories: categories.map(cat => ({
        category: cat.category,
        count: cat._count.category
      })),
      subcategories: subcategories.map(sub => ({
        subcategory: sub.subcategory,
        count: sub._count.subcategory
      })),
      searchResults,
      cc0061247Exists: !!cc0061247,
      cc0061247Data: cc0061247,
      sampleWithGroupCode: productsWithGroupCode.map(p => ({
        nieuwkoopId: p.nieuwkoopId,
        name: p.name,
        groupCode: (p.specifications as any)?.productGroupCode || 'N/A'
      }))
    })
    
  } catch (error) {
    console.error('Error en db-stats:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}