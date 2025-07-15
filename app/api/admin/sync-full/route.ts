import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { HybridSync } from '@/lib/nieuwkoop/hybrid-sync'

export async function POST() {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    console.log('🔄 Iniciando sincronización completa...')
    
    const hybridSync = new HybridSync()
    
    // Forzar sincronización completa usando fecha muy antigua
    // Esto garantiza que obtenemos todos los productos, incluso los que se 
    // habían perdido por el filtro anterior
    const historicDate = new Date('2020-01-01')
    
    const startTime = Date.now()
    
    const result = await hybridSync.syncChanges(historicDate)
    
    const endTime = Date.now()
    const duration = Math.round((endTime - startTime) / 1000)
    
    console.log('✅ Sincronización completa finalizada')
    
    return NextResponse.json({
      success: true,
      message: 'Sincronización completa realizada',
      results: {
        newProducts: result.newProducts,
        updatedProducts: result.updatedProducts,
        errors: result.errors,
        duration: `${duration}s`,
        syncedFrom: '2020-01-01'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error en sincronización completa:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error durante la sincronización',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}