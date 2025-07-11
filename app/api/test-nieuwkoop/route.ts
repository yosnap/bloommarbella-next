import { NextResponse } from 'next/server'
import { nieuwkoopRealClient } from '@/lib/nieuwkoop/real-client'

export async function GET() {
  try {
    console.log('🧪 Testing Nieuwkoop Real API connection...')
    
    // Probar obtener productos básicos
    const productsTest = await nieuwkoopRealClient.getProducts({ limit: 5 })
    
    if (!productsTest.success) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo obtener productos',
        details: productsTest.error
      }, { status: 500 })
    }

    // Probar obtener un producto específico
    const firstProduct = productsTest.data?.[0]
    let productComplete = null
    
    if (firstProduct) {
      const productTest = await nieuwkoopRealClient.getProductComplete(firstProduct.Itemcode)
      
      if (productTest.success) {
        productComplete = {
          itemCode: productTest.data?.product.Itemcode,
          name: productTest.data?.product.Description,
          priceGross: productTest.data?.price.PriceGross,
          priceNett: productTest.data?.price.PriceNett,
          stock: productTest.data?.stock.StockAvailable
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        totalProducts: productsTest.data?.length || 0,
        sampleProducts: productsTest.data?.slice(0, 3).map(p => ({
          itemCode: p.Itemcode,
          description: p.Description,
          price: p.Salesprice,
          showOnWebsite: p.ShowOnWebsite,
          itemStatus: p.ItemStatus
        })) || [],
        productComplete,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error testing Nieuwkoop Real API:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    }, { status: 500 })
  }
}