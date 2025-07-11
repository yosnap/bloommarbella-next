import { NextRequest, NextResponse } from 'next/server'
import { realTimeSync } from '@/lib/nieuwkoop/real-time-sync'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')
    
    if (!sku) {
      return NextResponse.json(
        { success: false, error: 'SKU es requerido' },
        { status: 400 }
      )
    }

    // Obtener stock en tiempo real
    const stockData = await realTimeSync.getRealtimeStock(sku)
    
    if (!stockData) {
      return NextResponse.json(
        { success: false, error: 'No se pudo obtener el stock' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        sku: stockData.sku,
        stock: stockData.stock,
        price: stockData.price,
        lastChecked: stockData.lastChecked,
        isRealTime: true
      }
    })
  } catch (error) {
    console.error('Error en stock API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { skus } = await request.json()
    
    if (!Array.isArray(skus)) {
      return NextResponse.json(
        { success: false, error: 'SKUs debe ser un array' },
        { status: 400 }
      )
    }

    // Actualizar stock en lote
    await realTimeSync.updateBulkStock(skus)
    
    return NextResponse.json({
      success: true,
      message: `Stock actualizado para ${skus.length} productos`
    })
  } catch (error) {
    console.error('Error en actualización de stock:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}