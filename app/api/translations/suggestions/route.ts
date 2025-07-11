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
    const category = searchParams.get('category')
    const query = searchParams.get('query')

    if (!category || !query) {
      return NextResponse.json(
        { success: false, error: 'Categoría y consulta requeridas' },
        { status: 400 }
      )
    }

    // Obtener sugerencias de palabras en inglés desde los productos
    let suggestions: string[] = []

    switch (category) {
      case 'categories':
        // Obtener categorías únicas de productos
        const products = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const categorySet = new Set<string>()
        products.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.categoryOriginal) {
              categorySet.add(spec.categoryOriginal)
            }
          }
        })
        
        suggestions = Array.from(categorySet)
          .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10)
        break

      case 'subcategories':
        // Obtener subcategorías únicas de productos
        const subProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const subcategorySet = new Set<string>()
        subProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.subcategoryOriginal) {
              subcategorySet.add(spec.subcategoryOriginal)
            }
          }
        })
        
        suggestions = Array.from(subcategorySet)
          .filter(sub => sub.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10)
        break

      case 'materials':
        // Obtener materiales únicos de productos
        const materialProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const materialSet = new Set<string>()
        materialProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.materialOriginal) {
              materialSet.add(spec.materialOriginal)
            }
          }
        })
        
        suggestions = Array.from(materialSet)
          .filter(mat => mat.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10)
        break

      case 'countries':
        // Obtener países únicos de productos
        const countryProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const countrySet = new Set<string>()
        countryProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.countryOfOriginOriginal) {
              countrySet.add(spec.countryOfOriginOriginal)
            }
          }
        })
        
        suggestions = Array.from(countrySet)
          .filter(country => country.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10)
        break

      case 'tag-codes':
        // Obtener códigos de tags únicos
        const tagProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const tagCodeSet = new Set<string>()
        tagProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.tags && Array.isArray(spec.tags)) {
              spec.tags.forEach((tag: any) => {
                if (tag.code) {
                  tagCodeSet.add(tag.code)
                }
              })
            }
          }
        })
        
        suggestions = Array.from(tagCodeSet)
          .filter(code => code.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10)
        break

      case 'tag-values':
        // Obtener valores de tags únicos
        const tagValueProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const tagValueSet = new Set<string>()
        tagValueProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.tags && Array.isArray(spec.tags)) {
              spec.tags.forEach((tag: any) => {
                if (tag.value) {
                  tagValueSet.add(tag.value)
                }
              })
            }
          }
        })
        
        suggestions = Array.from(tagValueSet)
          .filter(value => value.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10)
        break

      default:
        // Para otras categorías, buscar en las traducciones existentes
        const existingTranslations = await prisma.translation.findMany({
          where: {
            category,
            englishText: {
              contains: query,
              mode: 'insensitive'
            }
          },
          select: {
            englishText: true
          },
          take: 10
        })
        
        suggestions = existingTranslations.map(t => t.englishText)
        break
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.sort()
    })

  } catch (error: any) {
    console.error('Error getting translation suggestions:', error)
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