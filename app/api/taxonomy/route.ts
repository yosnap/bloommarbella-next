import { NextResponse } from 'next/server'
import { nieuwkoopRealClient } from '@/lib/nieuwkoop/real-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchSku = searchParams.get('sku')
    
    // Fetch products from Nieuwkoop API to extract taxonomy
    const response = await nieuwkoopRealClient.getProducts({ 
      sysmodified: '2020-01-01', // Get all products from this date
      count: 15000 // Increased limit to capture all products and taxonomy
    })
    
    if (!response.success || !response.data) {
      return NextResponse.json(
        { error: 'Failed to fetch products from Nieuwkoop API' },
        { status: 500 }
      )
    }

    // Extract unique taxonomy values
    const mainGroups = new Set<string>()
    const productGroups = new Set<string>()
    const materialGroups = new Set<string>()
    const tags = new Set<string>()

    // If searching for specific SKU, filter and return that product
    if (searchSku) {
      const foundProduct = response.data.find(product => 
        product.Itemcode === searchSku
      )
      
      if (foundProduct) {
        return NextResponse.json({
          success: true,
          data: {
            product: foundProduct
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: `Product with SKU ${searchSku} not found`
        })
      }
    }

    response.data.forEach(product => {
      // MainGroupDescription_EN
      if (product.MainGroupDescription_EN) {
        mainGroups.add(product.MainGroupDescription_EN)
      }
      
      // ProductGroupDescription_EN
      if (product.ProductGroupDescription_EN) {
        productGroups.add(product.ProductGroupDescription_EN)
      }
      
      // MaterialGroupDescription_EN
      if (product.MaterialGroupDescription_EN) {
        materialGroups.add(product.MaterialGroupDescription_EN)
      }
      
      // Tags
      if (product.Tags) {
        product.Tags.forEach(tag => {
          if (tag.Code) {
            tags.add(tag.Code)
          }
          if (tag.Values) {
            tag.Values.forEach(value => {
              if (value.Description_EN) {
                tags.add(value.Description_EN)
              }
            })
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        mainGroups: Array.from(mainGroups).sort(),
        productGroups: Array.from(productGroups).sort(),
        materialGroups: Array.from(materialGroups).sort(),
        tags: Array.from(tags).sort()
      },
      meta: {
        totalProducts: response.data.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Taxonomy API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos de taxonomía' 
      },
      { status: 500 }
    )
  }
}