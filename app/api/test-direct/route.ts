import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemCode = searchParams.get('itemCode')
    
    const username = 'Ground131880'
    const password = 'A18A65A2E3'
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    
    console.log('🔐 Testing direct API call with credentials:', {
      username,
      password: password.substring(0, 3) + '***',
      credentials: credentials.substring(0, 10) + '***',
      searchingFor: itemCode
    })
    
    // Test direct API call - con parámetro sysmodified requerido
    const apiUrl = itemCode 
      ? `https://customerapi.nieuwkoop-europe.com/items?sysmodified=2020-01-01&itemcode=${itemCode}`
      : 'https://customerapi.nieuwkoop-europe.com/items?sysmodified=2020-01-01'
    
    const response = await fetch(apiUrl, {
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
    
    // Si se busca un producto específico, mostrar información detallada
    if (itemCode) {
      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json({
          success: true,
          found: false,
          message: `Producto ${itemCode} no encontrado en API Nieuwkoop`,
          timestamp: new Date().toISOString()
        })
      }
      
      const product = data[0]
      return NextResponse.json({
        success: true,
        found: true,
        product: {
          itemCode: product.Itemcode,
          description: product.Description,
          price: product.Salesprice,
          showOnWebsite: product.ShowOnWebsite,
          itemStatus: product.ItemStatus,
          isStockItem: product.IsStockItem,
          productGroupCode: product.ProductGroupCode,
          productGroupDescription: product.ProductGroupDescription_EN || product.ProductGroupDescription_NL,
          mainGroupCode: product.MainGroupCode,
          mainGroupDescription: product.MainGroupDescription_EN || product.MainGroupDescription_NL,
          filterCheck: {
            showOnWebsite: product.ShowOnWebsite,
            itemStatus: product.ItemStatus,
            isStockItem: product.IsStockItem,
            passesFilter: product.ShowOnWebsite && product.ItemStatus === 'A'
          }
        },
        timestamp: new Date().toISOString()
      })
    }
    
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