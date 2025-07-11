import { nieuwkoopClient } from './client'
import { prisma } from '@/lib/prisma'

interface StockUpdate {
  sku: string
  stock: number
  price: number
  lastChecked: Date
}

export class RealTimeSync {
  private cache = new Map<string, StockUpdate>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  /**
   * Obtiene stock y precio actualizados de Nieuwkoop
   * Con cache de 5 minutos para evitar llamadas excesivas
   */
  async getRealtimeStock(sku: string): Promise<StockUpdate | null> {
    try {
      // Verificar cache
      const cached = this.cache.get(sku)
      if (cached && Date.now() - cached.lastChecked.getTime() < this.CACHE_DURATION) {
        return cached
      }

      // Consultar Nieuwkoop API
      const response = await nieuwkoopClient.getStock(sku)
      
      if (!response.success || !response.data) {
        return null
      }

      const stockData: StockUpdate = {
        sku,
        stock: response.data.stock,
        price: response.data.price || 0,
        lastChecked: new Date()
      }

      // Actualizar cache
      this.cache.set(sku, stockData)
      
      return stockData
    } catch (error) {
      console.error(`Error obteniendo stock para ${sku}:`, error)
      return null
    }
  }

  /**
   * Actualiza múltiples productos en lote
   */
  async updateBulkStock(skus: string[]): Promise<void> {
    const updates = await Promise.all(
      skus.map(sku => this.getRealtimeStock(sku))
    )

    const validUpdates = updates.filter(Boolean) as StockUpdate[]

    if (validUpdates.length === 0) return

    // Actualizar en MongoDB
    await Promise.all(
      validUpdates.map(update => 
        prisma.product.updateMany({
          where: { sku: update.sku },
          data: {
            stock: update.stock,
            basePrice: update.price,
            lastStockCheck: update.lastChecked
          }
        })
      )
    )

    console.log(`✅ Stock actualizado para ${validUpdates.length} productos`)
  }

  /**
   * Verifica stock crítico (productos con stock < 5)
   */
  async checkCriticalStock(): Promise<void> {
    const criticalProducts = await prisma.product.findMany({
      where: {
        stock: { lt: 5 },
        active: true
      },
      select: { sku: true }
    })

    if (criticalProducts.length > 0) {
      console.log(`🔄 Actualizando stock crítico: ${criticalProducts.length} productos`)
      await this.updateBulkStock(criticalProducts.map(p => p.sku))
    }
  }

  /**
   * Limpia cache expirado
   */
  cleanExpiredCache(): void {
    const now = Date.now()
    for (const [sku, data] of this.cache.entries()) {
      if (now - data.lastChecked.getTime() > this.CACHE_DURATION) {
        this.cache.delete(sku)
      }
    }
  }
}

export const realTimeSync = new RealTimeSync()

// Programar limpieza de cache cada 10 minutos
setInterval(() => {
  realTimeSync.cleanExpiredCache()
}, 10 * 60 * 1000)