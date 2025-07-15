import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NieuwkoopRealClient } from '@/lib/nieuwkoop/real-client'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const itemCode = searchParams.get('itemCode')
    
    if (!itemCode) {
      return NextResponse.json({ error: 'itemCode es requerido' }, { status: 400 })
    }

    const client = new NieuwkoopRealClient()
    
    // Buscar el producto específico
    const response = await client.getProducts({ itemCode })
    
    if (!response.success) {
      return NextResponse.json({ 
        error: 'Error en API Nieuwkoop', 
        details: response.error 
      }, { status: 500 })
    }
    
    if (!response.data || response.data.length === 0) {
      return NextResponse.json({ 
        found: false,
        message: 'Producto no encontrado en API Nieuwkoop' 
      })
    }
    
    const product = response.data![0]
    
    // Verificar criterios de filtrado
    const filterCriteria = {
      ShowOnWebsite: product.ShowOnWebsite,
      ItemStatus: product.ItemStatus,
      IsStockItem: product.IsStockItem
    }
    
    const passesFilter = product.ShowOnWebsite && 
                        product.ItemStatus === 'A' && 
                        product.IsStockItem
    
    // Buscar otros productos del mismo ProductGroupCode
    const groupResponse = await client.getProducts({ 
      limit: 1000 // Obtener muchos productos del grupo
    })
    
    let groupInfo = null
    if (groupResponse.success) {
      const filteredInGroup = groupResponse.data?.filter(p => 
        p.ShowOnWebsite && p.ItemStatus === 'A' && p.IsStockItem
      ) || []
      
      groupInfo = {
        totalInGroup: groupResponse.data?.length || 0,
        filteredInGroup: filteredInGroup.length,
        sampleFiltered: filteredInGroup.slice(0, 5).map(p => ({
          itemCode: p.Itemcode,
          description: p.ItemDescription_EN || p.ItemDescription_NL
        }))
      }
    }
    
    return NextResponse.json({
      found: true,
      product: {
        itemCode: product.Itemcode,
        description: product.ItemDescription_EN || product.ItemDescription_NL,
        productGroupCode: product.ProductGroupCode,
        mainGroupCode: product.MainGroupCode,
        basePrice: (product as any).SellingPriceExVAT || 0,
        stock: (product as any).StockQuantity || 0
      },
      filterCriteria,
      passesFilter,
      excludedReasons: [
        ...(!product.ShowOnWebsite ? ['ShowOnWebsite es false'] : []),
        ...(product.ItemStatus !== 'A' ? [`ItemStatus no es "A" (es "${product.ItemStatus}")`] : []),
        ...(!product.IsStockItem ? ['IsStockItem es false'] : [])
      ],
      groupInfo
    })
    
  } catch (error) {
    console.error('Error en debug-product:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}