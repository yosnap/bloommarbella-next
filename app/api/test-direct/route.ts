import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const username = 'Ground131880'
    const password = 'A18A65A2E3'
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    
    console.log('🔐 Testing direct API call with credentials:', {
      username,
      password: password.substring(0, 3) + '***',
      credentials: credentials.substring(0, 10) + '***'
    })
    
    // Test direct API call - con parámetro sysmodified requerido
    const response = await fetch('https://customerapi.nieuwkoop-europe.com/items?sysmodified=2020-01-01', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BloomMarbella/1.0'
      }
    })
    
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Error response:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}`,
        details: errorText,
        debug: {
          url: 'https://customerapi.nieuwkoop-europe.com/items',
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      }, { status: 500 })
    }
    
    const data = await response.json()
    console.log('✅ Success! Data received:', {
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 'N/A',
      firstItem: Array.isArray(data) && data.length > 0 ? {
        Itemcode: data[0].Itemcode,
        Description: data[0].Description
      } : null
    })
    
    return NextResponse.json({
      success: true,
      data: {
        itemCount: Array.isArray(data) ? data.length : 1,
        firstItem: Array.isArray(data) && data.length > 0 ? {
          itemCode: data[0].Itemcode,
          description: data[0].Description,
          price: data[0].Salesprice,
          showOnWebsite: data[0].ShowOnWebsite,
          itemStatus: data[0].ItemStatus
        } : null,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error: any) {
    console.error('❌ Direct API test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}