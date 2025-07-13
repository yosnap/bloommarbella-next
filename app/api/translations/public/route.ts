import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { translateCategory, translateSubcategory } from '@/lib/translations'

let translationsCache: { [key: string]: { data: any; timestamp: number } } = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const language = searchParams.get('language') || 'es'
    
    // Solo soportamos español por ahora
    if (language !== 'es') {
      return NextResponse.json({ 
        success: true, 
        translations: [] 
      })
    }

    const cacheKey = category ? `${category}-${language}` : `all-${language}`
    
    // Verificar cache
    if (translationsCache[cacheKey] && 
        Date.now() - translationsCache[cacheKey].timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        translations: translationsCache[cacheKey].data,
        cached: true
      })
    }

    // Buscar traducciones en la base de datos
    const whereClause = category ? { category } : {}
    const translations = await prisma.translation.findMany({
      where: whereClause
    })

    // Mapear al formato esperado por el hook
    const formattedTranslations = translations.map(t => ({
      id: t.id,
      key: t.englishText,
      value: t.spanishText,
      language: 'es',
      category: t.category
    }))

    // Actualizar cache
    translationsCache[cacheKey] = {
      data: formattedTranslations,
      timestamp: Date.now()
    }

    return NextResponse.json({
      success: true,
      translations: formattedTranslations
    })

  } catch (error: any) {
    console.error('Error in public translations GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        translations: []
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { texts, category } = await request.json()

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json(
        { success: false, error: 'Array de textos requerido' },
        { status: 400 }
      )
    }

    const translations: string[] = []

    for (const text of texts) {
      if (!text) {
        translations.push('')
        continue
      }

      try {
        // Buscar traducción dinámica en la base de datos
        const dynamicTranslation = await prisma.translation.findFirst({
          where: {
            category: category || 'categories',
            englishText: text
          },
          select: {
            spanishText: true
          }
        })

        if (dynamicTranslation?.spanishText) {
          translations.push(dynamicTranslation.spanishText)
        } else {
          // Fallback a traducciones estáticas
          let staticTranslation = text
          if (category === 'categories') {
            staticTranslation = translateCategory(text)
          } else if (category === 'subcategories') {
            staticTranslation = translateSubcategory(text)
          }
          translations.push(staticTranslation)
        }
      } catch (error) {
        console.error(`Error translating "${text}":`, error)
        translations.push(text) // Devolver el original si hay error
      }
    }

    return NextResponse.json({
      success: true,
      translations
    })

  } catch (error: any) {
    console.error('Error in public translations API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}