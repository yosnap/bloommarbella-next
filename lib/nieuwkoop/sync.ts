import { prisma } from '@/lib/prisma'
import { nieuwkoopClient, type NieuwkoopProduct } from './client'
import { ProductTransformer } from './transformers'

interface SyncResult {
  success: boolean
  created: number
  updated: number
  errors: string[]
  totalProcessed: number
}

interface SyncOptions {
  batchSize?: number
  forceUpdate?: boolean
  categories?: string[]
}

class NieuwkoopSyncService {
  /**
   * Sync all products from Nieuwkoop API to local database
   */
  static async syncAllProducts(options: SyncOptions = {}): Promise<SyncResult> {
    const { batchSize = 50, forceUpdate = false, categories } = options
    
    const result: SyncResult = {
      success: true,
      created: 0,
      updated: 0,
      errors: [],
      totalProcessed: 0
    }

    try {
      console.log('Starting Nieuwkoop product sync...')
      
      // Get all products from Nieuwkoop API
      const apiResponse = await nieuwkoopClient.getProducts({
        limit: 1000, // Get all products
        ...(categories && { category: categories[0] }) // API limitation - one category at a time
      })

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(`Failed to fetch products: ${apiResponse.error}`)
      }

      const products = apiResponse.data
      result.totalProcessed = products.length

      // Process in batches
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize)
        
        try {
          const batchResult = await this.syncProductBatch(batch, forceUpdate)
          result.created += batchResult.created
          result.updated += batchResult.updated
          result.errors.push(...batchResult.errors)
        } catch (error: any) {
          result.errors.push(`Batch ${i}-${i + batchSize}: ${error.message}`)
          result.success = false
        }
      }

      console.log(`Sync completed: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`)
      
      // Update sync metadata
      await this.updateSyncMetadata(result)
      
      return result
    } catch (error: any) {
      console.error('Sync failed:', error)
      result.success = false
      result.errors.push(error.message)
      return result
    }
  }

  /**
   * Sync a batch of products
   */
  private static async syncProductBatch(
    products: NieuwkoopProduct[], 
    forceUpdate: boolean
  ): Promise<Pick<SyncResult, 'created' | 'updated' | 'errors'>> {
    const result = { created: 0, updated: 0, errors: [] as string[] }

    for (const nieuwkoopProduct of products) {
      try {
        const existingProduct = await prisma.product.findUnique({
          where: { nieuwkoopId: nieuwkoopProduct.id }
        })

        const productData = {
          nieuwkoopId: nieuwkoopProduct.id,
          sku: nieuwkoopProduct.sku,
          name: nieuwkoopProduct.name,
          description: nieuwkoopProduct.description,
          category: nieuwkoopProduct.category,
          subcategory: nieuwkoopProduct.subcategory,
          basePrice: nieuwkoopProduct.price,
          stock: nieuwkoopProduct.stock,
          images: nieuwkoopProduct.images,
          specifications: nieuwkoopProduct.specifications || {},
          active: nieuwkoopProduct.availability !== 'out_of_stock',
          updatedAt: new Date()
        }

        if (existingProduct) {
          // Update existing product
          if (forceUpdate || this.shouldUpdateProduct(existingProduct, nieuwkoopProduct)) {
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: productData
            })
            result.updated++
          }
        } else {
          // Create new product
          await prisma.product.create({
            data: {
              ...productData,
              createdAt: new Date()
            }
          })
          result.created++
        }
      } catch (error: any) {
        result.errors.push(`Product ${nieuwkoopProduct.sku}: ${error.message}`)
      }
    }

    return result
  }

  /**
   * Check if product should be updated
   */
  private static shouldUpdateProduct(existingProduct: any, nieuwkoopProduct: NieuwkoopProduct): boolean {
    // Update if price, stock, or basic info changed
    return (
      existingProduct.basePrice !== nieuwkoopProduct.price ||
      existingProduct.stock !== nieuwkoopProduct.stock ||
      existingProduct.name !== nieuwkoopProduct.name ||
      existingProduct.description !== nieuwkoopProduct.description ||
      JSON.stringify(existingProduct.images) !== JSON.stringify(nieuwkoopProduct.images)
    )
  }

  /**
   * Update sync metadata
   */
  private static async updateSyncMetadata(result: SyncResult): Promise<void> {
    try {
      await prisma.configuration.upsert({
        where: { key: 'nieuwkoop_last_sync' },
        update: {
          value: JSON.stringify({
            timestamp: new Date().toISOString(),
            result,
          }),
          updatedAt: new Date()
        },
        create: {
          key: 'nieuwkoop_last_sync',
          value: JSON.stringify({
            timestamp: new Date().toISOString(),
            result,
          }),
          description: 'Last Nieuwkoop product sync result'
        }
      })
    } catch (error) {
      console.error('Failed to update sync metadata:', error)
    }
  }

  /**
   * Get sync status
   */
  static async getSyncStatus(): Promise<{
    lastSync?: Date
    lastResult?: SyncResult
    isOverdue: boolean
  }> {
    try {
      const config = await prisma.configuration.findUnique({
        where: { key: 'nieuwkoop_last_sync' }
      })

      if (!config) {
        return { isOverdue: true }
      }

      const data = config.value as any
      const lastSync = new Date(data.timestamp)
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      return {
        lastSync,
        lastResult: data.result,
        isOverdue: lastSync < twentyFourHoursAgo
      }
    } catch (error) {
      console.error('Failed to get sync status:', error)
      return { isOverdue: true }
    }
  }

  /**
   * Sync single product by SKU
   */
  static async syncProduct(nieuwkoopId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const apiResponse = await nieuwkoopClient.getProduct(nieuwkoopId)
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(`Failed to fetch product: ${apiResponse.error}`)
      }

      const nieuwkoopProduct = apiResponse.data
      
      const productData = {
        nieuwkoopId: nieuwkoopProduct.id,
        sku: nieuwkoopProduct.sku,
        name: nieuwkoopProduct.name,
        description: nieuwkoopProduct.description,
        category: nieuwkoopProduct.category,
        subcategory: nieuwkoopProduct.subcategory,
        basePrice: nieuwkoopProduct.price,
        stock: nieuwkoopProduct.stock,
        images: nieuwkoopProduct.images,
        specifications: nieuwkoopProduct.specifications || {},
        active: nieuwkoopProduct.availability !== 'out_of_stock',
        updatedAt: new Date()
      }

      await prisma.product.upsert({
        where: { nieuwkoopId: nieuwkoopProduct.id },
        update: productData,
        create: {
          ...productData,
          createdAt: new Date()
        }
      })

      return { success: true }
    } catch (error: any) {
      console.error(`Failed to sync product ${nieuwkoopId}:`, error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update stock for all products
   */
  static async updateAllStock(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      created: 0,
      updated: 0,
      errors: [],
      totalProcessed: 0
    }

    try {
      // Get all active products from database
      const localProducts = await prisma.product.findMany({
        where: { active: true },
        select: { id: true, sku: true, nieuwkoopId: true, stock: true }
      })

      result.totalProcessed = localProducts.length

      for (const product of localProducts) {
        try {
          const stockResponse = await nieuwkoopClient.getStock(product.sku)
          
          if (stockResponse.success && stockResponse.data) {
            const newStock = stockResponse.data.stock
            
            if (newStock !== product.stock) {
              await prisma.product.update({
                where: { id: product.id },
                data: { 
                  stock: newStock,
                  active: newStock > 0,
                  updatedAt: new Date()
                }
              })
              result.updated++
            }
          }
        } catch (error: any) {
          result.errors.push(`Stock update for ${product.sku}: ${error.message}`)
        }
      }

      return result
    } catch (error: any) {
      result.success = false
      result.errors.push(error.message)
      return result
    }
  }
}

export { NieuwkoopSyncService }