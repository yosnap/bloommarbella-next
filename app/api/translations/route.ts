import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  translations, 
  translateText, 
  translateMultipleTerms,
  getTranslationsForCategory,
  findEnglishKey 
} from '@/lib/translations'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as keyof typeof translations
    const text = searchParams.get('text')
    const action = searchParams.get('action') // 'translate' | 'reverse' | 'all'

    if (action === 'all') {
      // Devolver todas las traducciones
      if (category) {
        return NextResponse.json({
          category,
          translations: getTranslationsForCategory(category)
        })
      } else {
        return NextResponse.json({ translations })
      }
    }

    if (action === 'translate' && text) {
      const translatedText = category ? translateText(text, category) : translateText(text)
      return NextResponse.json({
        original: text,
        translated: translatedText,
        category: category || 'auto'
      })
    }

    if (action === 'reverse' && text) {
      const englishKey = category ? findEnglishKey(text, category) : findEnglishKey(text)
      return NextResponse.json({
        spanish: text,
        english: englishKey,
        category: category || 'auto'
      })
    }

    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  } catch (error) {
    console.error('Error in translations API:', error)
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
    const { texts, category, action } = body

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: 'Debe proporcionar un array de textos' }, { status: 400 })
    }

    if (action === 'translate') {
      const results = texts.map(text => ({
        original: text,
        translated: category ? translateText(text, category) : translateText(text)
      }))

      return NextResponse.json({ results })
    }

    if (action === 'reverse') {
      const results = texts.map(text => ({
        spanish: text,
        english: category ? findEnglishKey(text, category) : findEnglishKey(text)
      }))

      return NextResponse.json({ results })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error) {
    console.error('Error in translations POST API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}