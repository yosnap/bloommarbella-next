// Cliente real para la API de Nieuwkoop Europe
interface NieuwkoopConfig {
  baseURL: string
  username: string
  password: string
  timeout: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Tipos basados en la API real
interface NieuwkoopProduct {
  Itemcode: string
  DeliveryTimeInDays: number
  PalletQuantity: number
  Description: string
  ItemDescription_NL: string
  ItemDescription_EN: string
  ItemDescription_DE: string
  ItemDescription_FR: string
  ItemStatus: string
  SalesPackage_NL: string
  SalesPackage_EN: string
  Salesprice: number
  MainGroupCode: string
  MainGroupDescription_NL: string
  MainGroupDescription_EN: string
  ProductGroupCode: string
  ProductGroupDescription_NL: string
  ProductGroupDescription_EN: string
  GroupDescription: string
  GroupDescription_NL: string
  GroupDescription_EN: string
  MaterialGroupCode: string
  MaterialGroupDescription_NL: string
  MaterialGroupDescription_EN: string
  GTINCode: string
  IsStockItem: boolean
  Warehouse: string
  ItemVariety_NL: string
  ItemVariety_EN: string
  PotSize?: number
  ItemPictureName?: string
  Content_Ltr?: number
  PlantPassportCode?: string
  Diameter?: number
  Length?: number
  Width?: number
  Height?: number
  Depth?: number
  Opening?: number
  IsOffer: boolean
  ShowOnWebsite: boolean
  Sysmodified: string
  SalesOrderSize: number
  DiameterCulturePot: number
  HeightCulturePot: number
  Weight: number
  CitesListed: boolean
  CountryOfOrigin: string
  CountryOfProvenance?: string
  FytoListed: boolean
  HSCode: number
  HSCodeUK: string
  LeafSize?: string
  QuantityPallet: number
  QuantityTrolley: number
  LocationUsagePlanters_NL?: string
  LocationUsagePlanters_EN?: string
  onlyShipTo?: string
  PEC: number
  isProduction: number
  Tags: Array<{
    Code: string
    Values: Array<{
      Description_NL: string
      Description_EN: string
      Description_DE: string
      Description_FR: string
    }>
  }>
}

interface NieuwkoopPrice {
  ItemCode: string
  PriceGross: number
  DiscountPercentage: number
  PriceNett: number
  Staff1: {
    Quantity: number
    Price: number
  }
  Staff2: {
    Quantity: number
    Price: number
  }
  Staff3: {
    Quantity: number
    Price: number
  }
  Staff4: {
    Quantity: number
    Price: number
  }
  Staff5: {
    Quantity: number
    Price: number
  }
  Sysmodified: string
}

interface NieuwkoopStock {
  Itemcode: string
  StockAvailable: number
  FirstAvailable: string | null
  Sysmodified: string
}

export class NieuwkoopRealClient {
  private config: NieuwkoopConfig
  private authHeader: string

  constructor(config: Partial<NieuwkoopConfig> = {}) {
    this.config = {
      baseURL: process.env.NIEUWKOOP_API_URL || 'https://customerapi.nieuwkoop-europe.com',
      username: process.env.NIEUWKOOP_API_USER || 'Ground131880',
      password: process.env.NIEUWKOOP_API_PASSWORD || 'A18A65A2E3',
      timeout: 30000,
      ...config,
    }
    
    // Crear header de autenticación Basic Auth
    const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')
    this.authHeader = `Basic ${credentials}`
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.config.baseURL)
      
      // Agregar parámetros de consulta
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })

      console.log('🌐 Nieuwkoop API Request:', url.toString())

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'BloomMarbella/1.0'
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      
      console.log('✅ Nieuwkoop API Response:', {
        endpoint,
        status: response.status,
        dataLength: Array.isArray(data) ? data.length : 1
      })

      return {
        success: true,
        data: data as T
      }
    } catch (error: any) {
      console.error('❌ Nieuwkoop API Error:', {
        endpoint,
        error: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      }
    }
  }

  /**
   * Obtener todos los productos o filtrar por parámetros
   */
  async getProducts(params: {
    sysmodified?: string // Fecha formato: YYYY-MM-DD
    itemCode?: string
    limit?: number
  } = {}): Promise<ApiResponse<NieuwkoopProduct[]>> {
    const queryParams: Record<string, any> = {
      // sysmodified es REQUERIDO por la API
      sysmodified: params.sysmodified || '2020-01-01'
    }
    
    if (params.itemCode) {
      queryParams.itemCode = params.itemCode
    }

    console.log('🔍 Nieuwkoop API request:', queryParams)
    const response = await this.request<NieuwkoopProduct[]>('/items', queryParams)
    
    if (response.success && response.data) {
      // Log detallado para debug
      console.log(`📊 Productos totales recibidos: ${response.data.length}`)
      
      // Analizar filtros paso a paso
      const showOnWebsite = response.data.filter(product => product.ShowOnWebsite)
      const activeProducts = response.data.filter(product => product.ItemStatus === 'A')
      const stockItems = response.data.filter(product => product.IsStockItem)
      
      console.log(`📊 Productos ShowOnWebsite: ${showOnWebsite.length}`)
      console.log(`📊 Productos ItemStatus='A': ${activeProducts.length}`)
      console.log(`📊 Productos IsStockItem: ${stockItems.length}`)
      
      // Filtrar solo productos activos y visibles en web
      const filteredProducts = response.data.filter(product => 
        product.ShowOnWebsite && 
        product.ItemStatus === 'A' && 
        product.IsStockItem
      )
      
      console.log(`📊 Productos después de filtrar (todos los criterios): ${filteredProducts.length}`)
      
      // Limitar resultados si se especifica
      const finalProducts = params.limit 
        ? filteredProducts.slice(0, params.limit)
        : filteredProducts
      
      console.log(`📊 Productos finales (después de límite): ${finalProducts.length}`)
      
      return {
        success: true,
        data: finalProducts
      }
    }
    
    return response
  }

  /**
   * Obtener productos en lotes para evitar saturar el servidor
   */
  async getProductsInBatches(params: {
    sysmodified?: string
    batchSize?: number
  } = {}): Promise<ApiResponse<NieuwkoopProduct[]>> {
    const { sysmodified = '2020-01-01', batchSize = 500 } = params
    
    try {
      console.log(`🔄 Iniciando importación por lotes (${batchSize} productos por lote)`)
      
      // Hacer primera llamada para obtener todos los productos
      const response = await this.getProducts({ sysmodified })
      
      if (!response.success || !response.data) {
        return response
      }
      
      const allProducts = response.data
      console.log(`📊 Total de productos a procesar: ${allProducts.length}`)
      
      // Si hay menos productos que el tamaño del lote, devolver todos
      if (allProducts.length <= batchSize) {
        return response
      }
      
      // Dividir en lotes
      const batches: NieuwkoopProduct[][] = []
      for (let i = 0; i < allProducts.length; i += batchSize) {
        batches.push(allProducts.slice(i, i + batchSize))
      }
      
      console.log(`📊 Dividido en ${batches.length} lotes de ${batchSize} productos`)
      
      return {
        success: true,
        data: allProducts,
        meta: {
          totalBatches: batches.length,
          batchSize,
          totalProducts: allProducts.length
        }
      }
    } catch (error: any) {
      console.error('❌ Error en importación por lotes:', error)
      return {
        success: false,
        error: error.message || 'Error en importación por lotes'
      }
    }
  }

  /**
   * Obtener precio de un producto específico
   */
  async getPrice(itemCode: string, sysmodified?: string): Promise<ApiResponse<NieuwkoopPrice>> {
    const params: Record<string, any> = {
      Itemcode: itemCode,
      // sysmodified es REQUERIDO por la API
      sysmodified: sysmodified || '2020-01-01'
    }

    const response = await this.request<NieuwkoopPrice[]>('/prices', params)
    
    if (response.success && response.data && response.data.length > 0) {
      return {
        success: true,
        data: response.data[0]
      }
    }
    
    return {
      success: false,
      error: 'No se encontró precio para el producto'
    }
  }

  /**
   * Obtener stock de un producto específico
   */
  async getStock(itemCode: string, sysmodified?: string): Promise<ApiResponse<NieuwkoopStock>> {
    const params: Record<string, any> = {
      itemCode: itemCode,
      // sysmodified es REQUERIDO por la API
      sysmodified: sysmodified || '2020-01-01'
    }

    const response = await this.request<NieuwkoopStock[]>('/stock', params)
    
    if (response.success && response.data && response.data.length > 0) {
      return {
        success: true,
        data: response.data[0]
      }
    }
    
    return {
      success: false,
      error: 'No se encontró stock para el producto'
    }
  }

  /**
   * Obtener producto completo con precio y stock
   */
  async getProductComplete(itemCode: string): Promise<ApiResponse<{
    product: NieuwkoopProduct
    price: NieuwkoopPrice
    stock: NieuwkoopStock
  }>> {
    try {
      const [productResponse, priceResponse, stockResponse] = await Promise.all([
        this.getProducts({ itemCode }),
        this.getPrice(itemCode),
        this.getStock(itemCode)
      ])

      if (!productResponse.success || !productResponse.data || productResponse.data.length === 0) {
        return {
          success: false,
          error: 'Producto no encontrado'
        }
      }

      const product = productResponse.data[0]
      const price = priceResponse.data
      const stock = stockResponse.data

      if (!price) {
        return {
          success: false,
          error: 'No se pudo obtener precio del producto'
        }
      }

      if (!stock) {
        return {
          success: false,
          error: 'No se pudo obtener stock del producto'
        }
      }

      return {
        success: true,
        data: {
          product,
          price,
          stock
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error obteniendo producto completo'
      }
    }
  }

  /**
   * Obtener productos con cambios desde una fecha
   */
  async getProductChanges(since: Date): Promise<ApiResponse<NieuwkoopProduct[]>> {
    const sysmodified = since.toISOString().split('T')[0] // Formato YYYY-MM-DD
    
    return this.getProducts({ sysmodified })
  }

  /**
   * Obtener URL de imagen para un producto
   */
  getImageUrl(itemCode: string): string {
    return `${this.config.baseURL}/items/${itemCode}/image`
  }

  /**
   * Probar conexión con la API
   */
  async testConnection(): Promise<ApiResponse<{ connected: boolean; productCount: number }>> {
    try {
      const response = await this.getProducts({ limit: 1 })
      
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            connected: true,
            productCount: response.data.length
          }
        }
      }
      
      return {
        success: false,
        error: 'No se pudo conectar con la API'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error de conexión'
      }
    }
  }
}

export const nieuwkoopRealClient = new NieuwkoopRealClient()
export type { NieuwkoopProduct, NieuwkoopPrice, NieuwkoopStock }

// Interfaces extendidas para el sistema de lotes
export interface BatchResponse<T> extends ApiResponse<T> {
  meta?: {
    totalBatches: number
    batchSize: number
    totalProducts: number
  }
}