import { NextRequest, NextResponse } from 'next/server'
import { nieuwkoopRealClient } from '@/lib/nieuwkoop/real-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')
    
    if (!sku) {
      return NextResponse.json(
        { error: 'SKU parameter is required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Buscando SKU:', sku)
    
    // Hacer request directo a la API como en Postman
    const authHeader = `Basic ${Buffer.from(`${process.env.NIEUWKOOP_API_USER}:${process.env.NIEUWKOOP_API_PASSWORD}`).toString('base64')}`
    const apiUrl = `https://customerapi.nieuwkoop-europe.com/items?itemCode=${sku}&sysmodified=2020-07-01`
    
    console.log('📞 URL API:', apiUrl)
    
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })
    
    if (!apiResponse.ok) {
      throw new Error(`API Error: ${apiResponse.status}`)
    }
    
    const data = await apiResponse.json()
    console.log('📊 Respuesta API:', data)
    
    return NextResponse.json({
      success: true,
      data: data,
      found: data ? data.length > 0 : false
    })
  } catch (error) {
    console.error('Search SKU API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al buscar SKU' 
      },
      { status: 500 }
    )
  }
}