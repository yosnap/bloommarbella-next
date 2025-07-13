import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get unique categories and subcategories from products (WITHOUT filtering hidden ones)
    const categoriesData = await prisma.product.groupBy({
      by: ['category', 'subcategory'],
      where: {
        active: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        subcategory: 'asc'
      }
    })

    // Group by category (MainGroupDescription_EN) - these become our main "Grupos"
    const grupos: Record<string, {
      name: string
      count: number
      categorias: Array<{
        name: string
        count: number
      }>
    }> = {}

    categoriesData.forEach(item => {
      // Skip items without subcategory
      if (!item.subcategory) return

      if (!grupos[item.category]) {
        grupos[item.category] = {
          name: item.category,
          count: 0,
          categorias: []
        }
      }

      grupos[item.category].count += item._count._all

      // Add category (original subcategory) if not already present
      const existingCategoria = grupos[item.category].categorias
        .find(cat => cat.name === item.subcategory)

      if (existingCategoria) {
        existingCategoria.count += item._count._all
      } else {
        grupos[item.category].categorias.push({
          name: item.subcategory,
          count: item._count._all
        })
      }
    })

    // Sort categorias within each grupo
    Object.values(grupos).forEach(grupo => {
      grupo.categorias.sort((a, b) => a.name.localeCompare(b.name))
    })

    // Convert to array keeping original English names
    const gruposArray = Object.values(grupos).map(grupo => ({
      ...grupo,
      slug: grupo.name.toLowerCase().replace(/\s+/g, '-'),
      categorias: grupo.categorias.map(categoria => ({
        ...categoria,
        slug: categoria.name.toLowerCase().replace(/\s+/g, '-')
      }))
    }))

    return NextResponse.json({
      success: true,
      data: gruposArray,
      meta: {
        totalGrupos: gruposArray.length,
        totalCategorias: gruposArray.reduce((sum, grupo) => sum + grupo.categorias.length, 0),
        totalProducts: gruposArray.reduce((sum, grupo) => sum + grupo.count, 0)
      }
    })
  } catch (error: any) {
    console.error('Admin Categories API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener categorías para administración' 
      },
      { status: 500 }
    )
  }
}

