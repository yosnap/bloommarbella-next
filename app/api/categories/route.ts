import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get hidden categories from configuration
    const hiddenCategoriesConfig = await prisma.configuration.findUnique({
      where: { key: 'hidden_categories' }
    })
    const hiddenCategories = hiddenCategoriesConfig?.value as string[] || []

    // Get unique categories and subcategories from products
    const categoriesData = await prisma.product.groupBy({
      by: ['category', 'subcategory'],
      where: {
        active: true
        // Temporarily remove stock filter to see all products
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

      // Skip hidden categories and subcategories
      if (hiddenCategories.includes(item.category) || hiddenCategories.includes(item.subcategory)) {
        return
      }

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

    // Convert to array and add Spanish translations
    const gruposArray = Object.values(grupos).map(grupo => ({
      ...grupo,
      slug: grupo.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: getGrupoDisplayName(grupo.name),
      categorias: grupo.categorias.map(categoria => ({
        ...categoria,
        slug: categoria.name.toLowerCase().replace(/\s+/g, '-'),
        displayName: getCategoriaDisplayName(categoria.name)
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
    console.error('Categories API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener categorías' 
      },
      { status: 500 }
    )
  }
}

function getGrupoDisplayName(grupo: string): string {
  // Grupos son las categorías principales (MainGroupDescription_EN)
  const translations: Record<string, string> = {
    'Planten': 'Plantas',
    'Hardware': 'Material',
    'Potten': 'Macetas',
    'Tuinen': 'Jardín',
    'Decoratie': 'Decoración',
    'Verzorging': 'Cuidado'
  }
  
  return translations[grupo] || grupo
}

function getCategoriaDisplayName(categoria: string): string {
  // Categorías son las subcategorías (ProductGroupDescription_EN)
  // Basado en datos reales de la API de Nieuwkoop via /api/taxonomy
  const translations: Record<string, string> = {
    // ProductGroupDescription_EN confirmados desde la API de Nieuwkoop (/api/taxonomy)
    'All-in-1 concepts': 'Conceptos Todo en Uno', // Confirmado con SKU CC0050320
    'Artificial ': 'Plantas Artificiales',
    'Decoration': 'Decoración', 
    'Documentation': 'Documentación',
    'Equipments and accessories': 'Equipos y Accesorios',
    'Green walls': 'Paredes Verdes',
    'Hydroculture': 'Hidrocultivos',
    'Moss and Mummy plants ': 'Plantas de Musgo',
    'Nutrients and pesticide': 'Nutrientes y Pesticidas',
    'Planters': 'Macetas y Jardineras',
    'Soilculture': 'Cultivo en Tierra',
    'Substrates and systems': 'Sustratos y Sistemas'
  }
  
  return translations[categoria] || categoria
}