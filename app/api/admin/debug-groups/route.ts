import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NieuwkoopRealClient } from '@/lib/nieuwkoop/real-client'

interface ProductGroupSummary {
  productGroupCode: string
  productGroupDescription: string
  totalProducts: number
  showOnWebsite: number
  statusA: number
  isStockItem: number
  passesFilter: number
  sampleExcluded: Array<{
    itemCode: string
    showOnWebsite: boolean
    itemStatus: string
    isStockItem: boolean
    reasons: string[]
  }>
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const client = new NieuwkoopRealClient()
    
    // Obtener todos los productos
    console.log('🔍 Obteniendo todos los productos...')
    const response = await client.getProducts({})
    
    if (!response.success) {
      return NextResponse.json({ 
        error: 'Error en API Nieuwkoop', 
        details: response.error 
      }, { status: 500 })
    }

    // Agrupar productos por ProductGroupCode
    const groupMap = new Map<string, ProductGroupSummary>()
    
    response.data.forEach(product => {
      const groupCode = product.ProductGroupCode || 'SIN_GRUPO'
      const groupDescription = product.ProductGroupDescription_EN || 
                              product.ProductGroupDescription_NL || 
                              'Sin descripción'
      
      if (!groupMap.has(groupCode)) {
        groupMap.set(groupCode, {
          productGroupCode: groupCode,
          productGroupDescription: groupDescription,
          totalProducts: 0,
          showOnWebsite: 0,
          statusA: 0,
          isStockItem: 0,
          passesFilter: 0,
          sampleExcluded: []
        })
      }
      
      const groupSummary = groupMap.get(groupCode)!
      groupSummary.totalProducts++
      
      if (product.ShowOnWebsite) groupSummary.showOnWebsite++
      if (product.ItemStatus === 'A') groupSummary.statusA++
      if (product.IsStockItem) groupSummary.isStockItem++
      
      const passesFilter = product.ShowOnWebsite && 
                          product.ItemStatus === 'A' && 
                          product.IsStockItem
      
      if (passesFilter) {
        groupSummary.passesFilter++
      } else {
        // Agregar ejemplo de producto excluido
        if (groupSummary.sampleExcluded.length < 3) {
          const reasons = []
          if (!product.ShowOnWebsite) reasons.push('ShowOnWebsite=false')
          if (product.ItemStatus !== 'A') reasons.push(`ItemStatus=${product.ItemStatus}`)
          if (!product.IsStockItem) reasons.push('IsStockItem=false')
          
          groupSummary.sampleExcluded.push({
            itemCode: product.Itemcode,
            showOnWebsite: product.ShowOnWebsite,
            itemStatus: product.ItemStatus,
            isStockItem: product.IsStockItem,
            reasons
          })
        }
      }
    })

    // Convertir a array y ordenar por productos que pasan el filtro
    const groups = Array.from(groupMap.values())
      .sort((a, b) => a.passesFilter - b.passesFilter)

    // Calcular estadísticas generales
    const totalProducts = response.data.length
    const totalPassed = response.data.filter(p => 
      p.ShowOnWebsite && p.ItemStatus === 'A' && p.IsStockItem
    ).length
    
    const groupsWithoutProducts = groups.filter(g => g.passesFilter === 0)
    const groupsWithProducts = groups.filter(g => g.passesFilter > 0)

    return NextResponse.json({
      summary: {
        totalProducts,
        totalPassed,
        totalGroups: groups.length,
        groupsWithoutProducts: groupsWithoutProducts.length,
        groupsWithProducts: groupsWithProducts.length,
        exclusionRate: ((totalProducts - totalPassed) / totalProducts * 100).toFixed(1) + '%'
      },
      groupsWithoutProducts: groupsWithoutProducts.slice(0, 20), // Primeros 20 grupos sin productos
      groupsWithProducts: groupsWithProducts.slice(-10), // Últimos 10 grupos con productos
      topExcludedGroups: groups
        .filter(g => g.passesFilter === 0 && g.totalProducts > 10)
        .slice(0, 10)
    })
    
  } catch (error) {
    console.error('Error en debug-groups:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}