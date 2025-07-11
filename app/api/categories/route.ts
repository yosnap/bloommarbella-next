import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get unique categories and subcategories from products
    const categoriesData = await prisma.product.groupBy({
      by: ['category', 'subcategory'],
      where: {
        active: true,
        stock: { gt: 0 }
      },
      _count: {
        _all: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    // Group by category
    const categories: Record<string, {
      name: string
      count: number
      subcategories: Array<{
        name: string
        count: number
      }>
    }> = {}

    categoriesData.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = {
          name: item.category,
          count: 0,
          subcategories: []
        }
      }

      categories[item.category].count += item._count._all

      if (item.subcategory) {
        const existingSubcat = categories[item.category].subcategories
          .find(sub => sub.name === item.subcategory)

        if (existingSubcat) {
          existingSubcat.count += item._count._all
        } else {
          categories[item.category].subcategories.push({
            name: item.subcategory,
            count: item._count._all
          })
        }
      }
    })

    // Sort subcategories
    Object.values(categories).forEach(category => {
      category.subcategories.sort((a, b) => a.name.localeCompare(b.name))
    })

    // Convert to array and add Spanish translations
    const categoriesArray = Object.values(categories).map(category => ({
      ...category,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: getCategoryDisplayName(category.name),
      subcategories: category.subcategories.map(sub => ({
        ...sub,
        slug: sub.name.toLowerCase().replace(/\s+/g, '-'),
        displayName: getSubcategoryDisplayName(sub.name)
      }))
    }))

    return NextResponse.json({
      success: true,
      data: categoriesArray,
      meta: {
        totalCategories: categoriesArray.length,
        totalSubcategories: categoriesArray.reduce((sum, cat) => sum + cat.subcategories.length, 0),
        totalProducts: categoriesArray.reduce((sum, cat) => sum + cat.count, 0)
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

function getCategoryDisplayName(category: string): string {
  const translations: Record<string, string> = {
    'Plantas': 'Plantas',
    'Macetas': 'Macetas y Jardineras',
    'Jardín': 'Jardín y Exterior',
    'Herramientas': 'Herramientas',
    'Fertilizantes': 'Fertilizantes y Sustratos'
  }
  
  return translations[category] || category
}

function getSubcategoryDisplayName(subcategory: string): string {
  const translations: Record<string, string> = {
    'Interior': 'Plantas de Interior',
    'Exterior': 'Plantas de Exterior',
    'Suculentas': 'Suculentas y Cactus',
    'Florales': 'Plantas Florales',
    'Cerámica': 'Macetas de Cerámica',
    'Fibra': 'Macetas de Fibra',
    'Decorativas': 'Macetas Decorativas',
    'Herramientas': 'Herramientas de Jardín'
  }
  
  return translations[subcategory] || subcategory
}