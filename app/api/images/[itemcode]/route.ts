import { NextRequest, NextResponse } from 'next/server'
import { nieuwkoopRealClient } from '@/lib/nieuwkoop/real-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemcode: string }> }
) {
  try {
    const { itemcode } = await params
    
    if (!itemcode) {
      return NextResponse.json({ error: 'ItemCode is required' }, { status: 400 })
    }

    // Obtener imagen del API de Nieuwkoop
    const response = await fetch(nieuwkoopRealClient.getImageUrl(itemcode), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.NIEUWKOOP_API_USER}:${process.env.NIEUWKOOP_API_PASSWORD}`).toString('base64')}`,
        'User-Agent': 'BloomMarbella/1.0'
      }
    })

    if (!response.ok) {
      // Fallback a imagen por defecto
      return NextResponse.redirect('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80')
    }

    const data = await response.json()
    
    if (!data.Image) {
      return NextResponse.redirect('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80')
    }

    // Convertir base64 a imagen
    const imageBuffer = Buffer.from(data.Image, 'base64')
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400' // Cache por 24 horas
      }
    })
  } catch (error) {
    console.error('Error fetching image:', error)
    return NextResponse.redirect('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80')
  }
}