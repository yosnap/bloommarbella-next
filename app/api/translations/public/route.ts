import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { translateCategory, translateSubcategory } from '@/lib/translations'

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