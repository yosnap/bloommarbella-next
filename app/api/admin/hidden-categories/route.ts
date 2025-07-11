import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get hidden categories from configuration
    const config = await prisma.configuration.findUnique({
      where: { key: 'hidden_categories' }
    })

    const hiddenCategories = config?.value as string[] || []

    return NextResponse.json({
      success: true,
      data: hiddenCategories
    })
  } catch (error) {
    console.error('Error fetching hidden categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías ocultas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { hiddenCategories } = await request.json()

    if (!Array.isArray(hiddenCategories)) {
      return NextResponse.json(
        { error: 'hiddenCategories debe ser un array' },
        { status: 400 }
      )
    }

    // Update or create configuration
    await prisma.configuration.upsert({
      where: { key: 'hidden_categories' },
      update: { 
        value: hiddenCategories,
        description: 'Categorías ocultas del filtro lateral'
      },
      create: {
        key: 'hidden_categories',
        value: hiddenCategories,
        description: 'Categorías ocultas del filtro lateral'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Categorías ocultas actualizadas correctamente'
    })
  } catch (error) {
    console.error('Error updating hidden categories:', error)
    return NextResponse.json(
      { error: 'Error al actualizar categorías ocultas' },
      { status: 500 }
    )
  }
}