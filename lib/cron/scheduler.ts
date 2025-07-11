import { realTimeSync } from '@/lib/nieuwkoop/real-time-sync'
import { prisma } from '@/lib/prisma'
import { nieuwkoopClient } from '@/lib/nieuwkoop/client'

export class CronScheduler {
  private static instance: CronScheduler
  private jobs: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler()
    }
    return CronScheduler.instance
  }

  /**
   * Programar todos los jobs
   */
  startAllJobs(): void {
    console.log('🚀 Iniciando sistema de Cron Jobs...')
    
    // 1. Stock crítico cada 5 minutos
    this.scheduleJob('critical-stock', 5 * 60 * 1000, () => {
      this.updateCriticalStock()
    })

    // 2. Productos populares cada 15 minutos
    this.scheduleJob('popular-products', 15 * 60 * 1000, () => {
      this.updatePopularProducts()
    })

    // 3. Productos normales cada 2 horas
    this.scheduleJob('normal-products', 2 * 60 * 60 * 1000, () => {
      this.updateNormalProducts()
    })

    // 4. Sincronización completa cada 24 horas
    this.scheduleJob('full-sync', 24 * 60 * 60 * 1000, () => {
      this.fullSynchronization()
    })

    // 5. Limpieza de cache cada 30 minutos
    this.scheduleJob('cleanup', 30 * 60 * 1000, () => {
      this.cleanupTasks()
    })
  }

  /**
   * Programar un job específico
   */
  private scheduleJob(name: string, intervalMs: number, task: () => void): void {
    const job = setInterval(async () => {
      try {
        console.log(`⏰ Ejecutando job: ${name}`)
        await task()
        console.log(`✅ Job completado: ${name}`)
      } catch (error) {
        console.error(`❌ Error en job ${name}:`, error)
      }
    }, intervalMs)

    this.jobs.set(name, job)
    console.log(`📅 Job '${name}' programado cada ${intervalMs / 1000}s`)
  }

  /**
   * NIVEL 1: Productos con stock crítico (< 5)
   */
  private async updateCriticalStock(): Promise<void> {
    const criticalProducts = await prisma.product.findMany({
      where: {
        stock: { lt: 5 },
        active: true
      },
      select: { sku: true, name: true, stock: true }
    })

    if (criticalProducts.length === 0) {
      console.log('📦 No hay productos con stock crítico')
      return
    }

    console.log(`🔴 Actualizando ${criticalProducts.length} productos críticos`)
    await realTimeSync.updateBulkStock(criticalProducts.map(p => p.sku))

    // Registrar en logs
    await this.logSyncActivity('critical-stock', criticalProducts.length)
  }

  /**
   * NIVEL 2: Productos populares (más vendidos/vistos)
   */
  private async updatePopularProducts(): Promise<void> {
    const popularProducts = await prisma.product.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true
          }
        }
      },
      orderBy: [
        { cartItems: { _count: 'desc' } },
        { orderItems: { _count: 'desc' } }
      ],
      take: 50 // Top 50 productos más populares
    })

    if (popularProducts.length === 0) return

    console.log(`🔥 Actualizando ${popularProducts.length} productos populares`)
    await realTimeSync.updateBulkStock(popularProducts.map(p => p.sku))

    await this.logSyncActivity('popular-products', popularProducts.length)
  }

  /**
   * NIVEL 3: Productos normales (rotación)
   */
  private async updateNormalProducts(): Promise<void> {
    // Obtener productos que no se han actualizado en las últimas 4 horas
    const normalProducts = await prisma.product.findMany({
      where: {
        active: true,
        stock: { gte: 5 }, // No críticos
        OR: [
          { lastStockCheck: null },
          { lastStockCheck: { lt: new Date(Date.now() - 4 * 60 * 60 * 1000) } }
        ]
      },
      orderBy: { lastStockCheck: 'asc' },
      take: 100 // Procesar 100 productos cada vez
    })

    if (normalProducts.length === 0) return

    console.log(`📈 Actualizando ${normalProducts.length} productos normales`)
    await realTimeSync.updateBulkStock(normalProducts.map(p => p.sku))

    await this.logSyncActivity('normal-products', normalProducts.length)
  }

  /**
   * NIVEL 4: Sincronización completa
   */
  private async fullSynchronization(): Promise<void> {
    console.log('🔄 Iniciando sincronización completa...')
    
    try {
      // Obtener todos los productos de Nieuwkoop
      const response = await nieuwkoopClient.getProducts({ limit: 1000 })
      
      if (!response.success || !response.data) {
        throw new Error('Error al obtener productos de Nieuwkoop')
      }

      let syncedCount = 0
      let errorCount = 0

      // Procesar en lotes de 50
      for (let i = 0; i < response.data.length; i += 50) {
        const batch = response.data.slice(i, i + 50)
        
        try {
          await this.processBatch(batch)
          syncedCount += batch.length
        } catch (error) {
          errorCount += batch.length
          console.error(`Error procesando lote ${i/50 + 1}:`, error)
        }
      }

      console.log(`✅ Sincronización completa: ${syncedCount} productos, ${errorCount} errores`)
      await this.logSyncActivity('full-sync', syncedCount, errorCount)

    } catch (error) {
      console.error('❌ Error en sincronización completa:', error)
      await this.logSyncActivity('full-sync', 0, 1)
    }
  }

  /**
   * Procesar lote de productos
   */
  private async processBatch(products: any[]): Promise<void> {
    for (const product of products) {
      try {
        await prisma.product.upsert({
          where: { nieuwkoopId: product.id },
          update: {
            stock: product.stock,
            basePrice: product.price,
            lastStockCheck: new Date()
          },
          create: {
            nieuwkoopId: product.id,
            sku: product.sku,
            name: product.name,
            description: product.description,
            category: product.category,
            subcategory: product.subcategory,
            basePrice: product.price,
            stock: product.stock,
            images: product.images,
            specifications: product.specifications,
            active: true,
            lastStockCheck: new Date()
          }
        })
      } catch (error) {
        console.error(`Error procesando producto ${product.id}:`, error)
      }
    }
  }

  /**
   * Tareas de limpieza
   */
  private async cleanupTasks(): Promise<void> {
    console.log('🧹 Ejecutando tareas de limpieza...')
    
    // Limpiar cache de stock
    realTimeSync.cleanExpiredCache()
    
    // Limpiar logs antiguos (más de 30 días)
    await prisma.syncLog.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    })
    
    console.log('✅ Limpieza completada')
  }

  /**
   * Registrar actividad de sincronización
   */
  private async logSyncActivity(
    type: string, 
    successCount: number, 
    errorCount: number = 0
  ): Promise<void> {
    await prisma.syncLog.create({
      data: {
        type,
        status: errorCount > 0 ? 'partial' : 'success',
        productsProcessed: successCount,
        errors: errorCount,
        createdAt: new Date()
      }
    })
  }

  /**
   * Detener todos los jobs
   */
  stopAllJobs(): void {
    console.log('🛑 Deteniendo todos los Cron Jobs...')
    
    for (const [name, job] of this.jobs) {
      clearInterval(job)
      console.log(`❌ Job '${name}' detenido`)
    }
    
    this.jobs.clear()
  }

  /**
   * Obtener estado de los jobs
   */
  getJobsStatus(): { name: string; running: boolean; nextRun?: Date }[] {
    return Array.from(this.jobs.keys()).map(name => ({
      name,
      running: this.jobs.has(name)
    }))
  }
}

export const cronScheduler = CronScheduler.getInstance()