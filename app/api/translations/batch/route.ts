import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { category, translations } = await request.json()

    if (!category || !translations || !Array.isArray(translations)) {
      return NextResponse.json(
        { success: false, error: 'Categoría y traducciones requeridas' },
        { status: 400 }
      )
    }

    let created = 0
    let updated = 0
    let errors = 0

    // Procesar cada traducción
    for (const translation of translations) {
      try {
        const { englishText, spanishText } = translation

        if (!englishText || !spanishText) {
          errors++
          continue
        }

        // Verificar si ya existe la traducción
        const existingTranslation = await prisma.translation.findUnique({
          where: {
            category_englishText: {
              category,
              englishText
            }
          }
        })

        if (existingTranslation) {
          // Actualizar traducción existente
          await prisma.translation.update({
            where: {
              id: existingTranslation.id
            },
            data: {
              spanishText,
              updatedAt: new Date()
            }
          })
          updated++
        } else {
          // Crear nueva traducción
          await prisma.translation.create({
            data: {
              category,
              englishText,
              spanishText,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          created++
        }
      } catch (error) {
        console.error(`Error procesando traducción ${translation.englishText}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      errors,
      total: translations.length,
      message: `Se procesaron ${translations.length} traducciones: ${created} creadas, ${updated} actualizadas, ${errors} errores`
    })

  } catch (error: any) {
    console.error('Error saving batch translations:', error)
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