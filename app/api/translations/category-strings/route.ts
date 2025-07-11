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

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Categoría requerida' },
        { status: 400 }
      )
    }

    // Obtener todas las cadenas únicas de la categoría
    let strings: Array<{englishText: string, spanishText: string | null}> = []

    switch (category) {
      case 'categories':
        // Obtener todas las categorías únicas de productos
        const products = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const categoryMap = new Map<string, string | null>()
        
        // Primero, obtener traducciones existentes
        const existingTranslations = await prisma.translation.findMany({
          where: { category }
        })
        
        existingTranslations.forEach(t => {
          categoryMap.set(t.englishText, t.spanishText)
        })
        
        // Luego, agregar categorías de productos que no tienen traducción
        products.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.categoryOriginal && !categoryMap.has(spec.categoryOriginal)) {
              categoryMap.set(spec.categoryOriginal, null)
            }
          }
        })
        
        strings = Array.from(categoryMap.entries()).map(([englishText, spanishText]) => ({
          englishText,
          spanishText
        }))
        break

      case 'subcategories':
        const subProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const subcategoryMap = new Map<string, string | null>()
        
        // Obtener traducciones existentes
        const existingSubTranslations = await prisma.translation.findMany({
          where: { category }
        })
        
        existingSubTranslations.forEach(t => {
          subcategoryMap.set(t.englishText, t.spanishText)
        })
        
        // Agregar subcategorías de productos
        subProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.subcategoryOriginal && !subcategoryMap.has(spec.subcategoryOriginal)) {
              subcategoryMap.set(spec.subcategoryOriginal, null)
            }
          }
        })
        
        strings = Array.from(subcategoryMap.entries()).map(([englishText, spanishText]) => ({
          englishText,
          spanishText
        }))
        break

      case 'materials':
        const materialProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const materialMap = new Map<string, string | null>()
        
        // Obtener traducciones existentes
        const existingMaterialTranslations = await prisma.translation.findMany({
          where: { category }
        })
        
        existingMaterialTranslations.forEach(t => {
          materialMap.set(t.englishText, t.spanishText)
        })
        
        // Agregar materiales de productos
        materialProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.materialOriginal && !materialMap.has(spec.materialOriginal)) {
              materialMap.set(spec.materialOriginal, null)
            }
          }
        })
        
        strings = Array.from(materialMap.entries()).map(([englishText, spanishText]) => ({
          englishText,
          spanishText
        }))
        break

      case 'countries':
        const countryProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const countryMap = new Map<string, string | null>()
        
        // Obtener traducciones existentes
        const existingCountryTranslations = await prisma.translation.findMany({
          where: { category }
        })
        
        existingCountryTranslations.forEach(t => {
          countryMap.set(t.englishText, t.spanishText)
        })
        
        // Agregar países de productos
        countryProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.countryOfOriginOriginal && !countryMap.has(spec.countryOfOriginOriginal)) {
              countryMap.set(spec.countryOfOriginOriginal, null)
            }
          }
        })
        
        strings = Array.from(countryMap.entries()).map(([englishText, spanishText]) => ({
          englishText,
          spanishText
        }))
        break

      case 'tag-codes':
        const tagProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const tagCodeMap = new Map<string, string | null>()
        
        // Obtener traducciones existentes
        const existingTagCodeTranslations = await prisma.translation.findMany({
          where: { category }
        })
        
        existingTagCodeTranslations.forEach(t => {
          tagCodeMap.set(t.englishText, t.spanishText)
        })
        
        // Agregar códigos de tags de productos
        tagProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.tags && Array.isArray(spec.tags)) {
              spec.tags.forEach((tag: any) => {
                if (tag.code && !tagCodeMap.has(tag.code)) {
                  tagCodeMap.set(tag.code, null)
                }
              })
            }
          }
        })
        
        strings = Array.from(tagCodeMap.entries()).map(([englishText, spanishText]) => ({
          englishText,
          spanishText
        }))
        break

      case 'tag-values':
        const tagValueProducts = await prisma.product.findMany({
          select: {
            specifications: true
          },
          where: {
            active: true
          }
        })
        
        const tagValueMap = new Map<string, string | null>()
        
        // Obtener traducciones existentes
        const existingTagValueTranslations = await prisma.translation.findMany({
          where: { category }
        })
        
        existingTagValueTranslations.forEach(t => {
          tagValueMap.set(t.englishText, t.spanishText)
        })
        
        // Agregar valores de tags de productos
        tagValueProducts.forEach(product => {
          if (product.specifications && typeof product.specifications === 'object') {
            const spec = product.specifications as any
            if (spec.tags && Array.isArray(spec.tags)) {
              spec.tags.forEach((tag: any) => {
                if (tag.value && !tagValueMap.has(tag.value)) {
                  tagValueMap.set(tag.value, null)
                }
              })
            }
          }
        })
        
        strings = Array.from(tagValueMap.entries()).map(([englishText, spanishText]) => ({
          englishText,
          spanishText
        }))
        break

      default:
        // Para otras categorías, obtener solo las traducciones existentes
        const defaultTranslations = await prisma.translation.findMany({
          where: { category }
        })
        
        strings = defaultTranslations.map(t => ({
          englishText: t.englishText,
          spanishText: t.spanishText
        }))
        break
    }

    // Ordenar por texto en inglés
    strings.sort((a, b) => a.englishText.localeCompare(b.englishText))

    return NextResponse.json({
      success: true,
      strings,
      totalCount: strings.length,
      untranslatedCount: strings.filter(s => !s.spanishText).length
    })

  } catch (error: any) {
    console.error('Error getting category strings:', error)
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