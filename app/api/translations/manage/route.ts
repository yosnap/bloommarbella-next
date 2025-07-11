import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Get all translations from database
    const where = category ? { category } : {}
    const translations = await prisma.translation.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { englishText: 'asc' }
      ]
    })

    // Group by category
    const groupedTranslations = translations.reduce((acc, translation) => {
      if (!acc[translation.category]) {
        acc[translation.category] = {}
      }
      acc[translation.category][translation.englishText] = translation.spanishText
      return acc
    }, {} as Record<string, Record<string, string>>)

    return NextResponse.json({
      success: true,
      translations: groupedTranslations
    })
  } catch (error) {
    console.error('Error getting translations:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { category, englishText, spanishText, action } = body

    if (!category || !englishText) {
      return NextResponse.json({ error: 'Categoría y texto en inglés son requeridos' }, { status: 400 })
    }

    if (action === 'add' || action === 'update') {
      if (!spanishText) {
        return NextResponse.json({ error: 'Texto en español es requerido' }, { status: 400 })
      }

      const translation = await prisma.translation.upsert({
        where: {
          category_englishText: {
            category,
            englishText
          }
        },
        update: {
          spanishText,
          updatedAt: new Date()
        },
        create: {
          category,
          englishText,
          spanishText
        }
      })

      return NextResponse.json({
        success: true,
        translation,
        message: action === 'add' ? 'Traducción agregada' : 'Traducción actualizada'
      })
    }

    if (action === 'delete') {
      await prisma.translation.delete({
        where: {
          category_englishText: {
            category,
            englishText
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Traducción eliminada'
      })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error) {
    console.error('Error managing translation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { translations } = body

    if (!translations || !Array.isArray(translations)) {
      return NextResponse.json({ error: 'Debe proporcionar un array de traducciones' }, { status: 400 })
    }

    // Bulk update translations
    const results = []
    for (const translation of translations) {
      const { category, englishText, spanishText } = translation
      
      if (!category || !englishText || !spanishText) {
        continue
      }

      const result = await prisma.translation.upsert({
        where: {
          category_englishText: {
            category,
            englishText
          }
        },
        update: {
          spanishText,
          updatedAt: new Date()
        },
        create: {
          category,
          englishText,
          spanishText
        }
      })

      results.push(result)
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      message: `${results.length} traducciones actualizadas`
    })
  } catch (error) {
    console.error('Error bulk updating translations:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}