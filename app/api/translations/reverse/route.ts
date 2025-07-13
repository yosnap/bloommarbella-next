import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { translatedText, category } = await request.json()

    if (!translatedText || !category) {
      return NextResponse.json(
        { error: 'translatedText and category are required' },
        { status: 400 }
      )
    }

    // Buscar la traducción que coincida con el texto traducido (en español)
    const translation = await prisma.translation.findFirst({
      where: {
        spanishText: translatedText,
        category: category
      }
    })

    if (translation) {
      return NextResponse.json({
        success: true,
        originalText: translation.englishText,
        translatedText: translation.spanishText
      })
    }

    // Si no se encuentra, devolver el texto original
    return NextResponse.json({
      success: true,
      originalText: translatedText,
      translatedText: translatedText
    })

  } catch (error: any) {
    console.error('Reverse translation API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener traducción reversa' 
      },
      { status: 500 }
    )
  }
}