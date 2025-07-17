import { nieuwkoopRealClient } from './real-client'
import { prisma } from '@/lib/prisma'
import { translateCategory, translateSubcategory, translateMaterial, translateCountry } from '@/lib/translations'

export class HybridSync {
  private priceCache = new Map<string, { price: number; stock: number; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  /**
   * Obtener producto con datos híbridos
   * - Datos base: MongoDB
   * - Precio/Stock: Tiempo real (con cache)
   */
  async getProductWithRealtimeData(sku: string) {
    try {
      // 1. Obtener datos base de MongoDB
      const baseProduct = await prisma.product.findUnique({
        where: { sku },
        include: {
          _count: {
            select: {
              cartItems: true,
              orderItems: true
            }
          }
        }
      })

      if (!baseProduct) {
        throw new Error(`Producto ${sku} no encontrado`)
      }

      // 2. Obtener precio y stock en tiempo real
      const realtimeData = await this.getRealtimePriceStock(sku)

      // 3. Combinar datos
      return {
        ...baseProduct,
        // Datos base de MongoDB
        id: baseProduct.id,
        name: baseProduct.name,
        description: baseProduct.description,
        category: baseProduct.category,
        sku: baseProduct.sku,
        nieuwkoopId: baseProduct.nieuwkoopId,
        slug: baseProduct.slug,
        specifications: baseProduct.specifications,
        sysmodified: baseProduct.sysmodified,
        
        // Datos en tiempo real de Nieuwkoop
        currentPrice: realtimeData.price,
        currentStock: realtimeData.stock,
        
        // Datos calculados
        popularity: baseProduct._count.cartItems + baseProduct._count.orderItems,
        lastPriceCheck: new Date(realtimeData.timestamp),
        
        // Indicadores
        isRealTimeData: true,
        stockStatus: this.getStockStatus(realtimeData.stock)
      }
    } catch (error) {
      console.error(`Error obteniendo producto híbrido ${sku}:`, error)
      throw error
    }
  }

  /**
   * Obtener precio y stock en tiempo real (con cache)
   */
  private async getRealtimePriceStock(sku: string): Promise<{
    price: number
    stock: number
    timestamp: number
  }> {
    const now = Date.now()
    
    // Verificar cache
    const cached = this.priceCache.get(sku)
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached
    }

    try {
      // Primero obtener el precio base de la base de datos
      const productData = await prisma.product.findUnique({
        where: { sku },
        select: { basePrice: true }
      })
      
      if (!productData || !productData.basePrice) {
        throw new Error(`Producto ${sku} no encontrado en DB`)
      }

      // Solo consultar stock en tiempo real de Nieuwkoop
      const stockResponse = await nieuwkoopRealClient.getStock(sku)
      const stock = stockResponse.success && stockResponse.data 
        ? stockResponse.data.StockAvailable 
        : 0

      const realtimeData = {
        price: productData.basePrice, // Usar el Salesprice almacenado como basePrice
        stock,
        timestamp: now
      }

      // Guardar en cache
      this.priceCache.set(sku, realtimeData)
      
      return realtimeData

    } catch (error) {
      console.error(`Error obteniendo datos RT para ${sku}:`, error)
      
      // Fallback: usar datos de MongoDB
      const fallbackProduct = await prisma.product.findUnique({
        where: { sku },
        select: { basePrice: true, stock: true }
      })
      
      if (!fallbackProduct) {
        throw new Error(`No se pudo obtener datos para ${sku}`)
      }
      
      return {
        price: fallbackProduct.basePrice,
        stock: fallbackProduct.stock,
        timestamp: now
      }
    }
  }

  /**
   * Obtener múltiples productos con datos híbridos
   */
  async getProductsWithRealtimeData(
    filters: {
      category?: string
      categories?: string[]
      brands?: string[]
      search?: string
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: string
      // Advanced filters
      priceMin?: number
      priceMax?: number
      heightMin?: number
      heightMax?: number
      widthMin?: number
      widthMax?: number
      inStock?: boolean
      location?: string[]
      plantingSystem?: string[]
      colors?: string[]
      advancedCategories?: string[]
    } = {}
  ) {
    const { 
      category, categories, brands, search, page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc',
      priceMin, priceMax, heightMin, heightMax, widthMin, widthMax, inStock,
      location, plantingSystem, colors, advancedCategories
    } = filters

    // Las categorías ya vienen en inglés original, usar directamente

    // 1. Obtener productos base de MongoDB
    const where: any = { active: true }
    
    if (category) {
      where.category = category
    }
    
    // Support for multiple categories (includes subcategories)
    if (categories && categories.length > 0) {
      where.OR = [
        { category: { in: categories } },
        { subcategory: { in: categories } }
      ]
    }
    
    // Advanced category filter (from advanced filters)
    if (advancedCategories && advancedCategories.length > 0) {
      const categoryFilter = [
        { category: { in: advancedCategories } },
        { subcategory: { in: advancedCategories } }
      ]
      
      if (where.OR) {
        // Combine with existing OR condition
        where.AND = [
          { OR: where.OR },
          { OR: categoryFilter }
        ]
        delete where.OR
      } else {
        where.OR = categoryFilter
      }
    }
    
    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      where.basePrice = {}
      if (priceMin !== undefined) {
        where.basePrice.gte = priceMin / 2.5 // Convert back to base price
      }
      if (priceMax !== undefined) {
        where.basePrice.lte = priceMax / 2.5 // Convert back to base price
      }
    }
    
    if (search) {
      const searchCondition = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      }
      
      if (where.OR) {
        // Combine with category filter
        where.AND = [
          { OR: where.OR },
          searchCondition
        ]
        delete where.OR
      } else {
        where.OR = searchCondition.OR
      }
    }

    // Configurar ordenamiento
    let orderBy: any = { name: 'asc' }
    
    switch (sortBy) {
      case 'alphabetical':
        orderBy = { name: sortOrder === 'desc' ? 'desc' : 'asc' }
        break
      case 'price':
        orderBy = { basePrice: sortOrder === 'desc' ? 'desc' : 'asc' }
        break
      case 'date':
        orderBy = { createdAt: sortOrder === 'desc' ? 'desc' : 'asc' }
        break
      case 'offer':
        // Para ofertas, usar un ordenamiento personalizado con raw query
        // Prisma no soporta ordenamiento por campos JSON complejos directamente
        // Por ahora, obtenemos todos y ordenamos en memoria
        orderBy = { name: 'asc' }
        break
      default:
        orderBy = { name: 'asc' }
    }

    // Para filtros avanzados en memoria, necesitamos obtener todos los productos primero
    const hasAdvancedFilters = inStock || 
      (location && location.length > 0) || 
      (colors && colors.length > 0) || 
      (plantingSystem && plantingSystem.length > 0) ||
      (heightMin !== undefined || heightMax !== undefined) ||
      (widthMin !== undefined || widthMax !== undefined)
    
    // Limitar a máximo 20 productos por página para evitar loops infinitos
    const maxPerPage = 20
    const actualLimit = Math.min(limit, maxPerPage)
    
    let products: any[]
    if (brands && brands.length > 0 || hasAdvancedFilters) {
      // Para filtros de marca o filtros avanzados, obtenemos un máximo limitado
      products = await prisma.product.findMany({
        where,
        take: actualLimit * 10, // Máximo 10 páginas para filtrar
        orderBy
      })
    } else {
      // Sin filtros avanzados, paginación normal
      products = await prisma.product.findMany({
        where,
        skip: (page - 1) * actualLimit,
        take: actualLimit,
        orderBy
      })
    }

    // 2. Obtener datos en tiempo real para cada producto (solo para los productos paginados)
    const productsWithRealtimeData = await Promise.all(
      products.map(async (product) => {
        try {
          const realtimeData = await this.getRealtimePriceStock(product.sku)
          
          return {
            ...product,
            currentPrice: realtimeData.price,
            currentStock: realtimeData.stock,
            stockStatus: this.getStockStatus(realtimeData.stock),
            isRealTimeData: true,
            lastPriceCheck: new Date(realtimeData.timestamp)
          }
        } catch (error) {
          console.error(`Error obteniendo datos RT para ${product.sku}:`, error)
          
          // Fallback: usar datos de MongoDB
          return {
            ...product,
            currentPrice: product.basePrice,
            currentStock: product.stock,
            stockStatus: this.getStockStatus(product.stock),
            isRealTimeData: false,
            lastPriceCheck: product.updatedAt
          }
        }
      })
    )
    
    // 3. Aplicar filtros en memoria (marcas y filtros avanzados)
    let filteredProducts = productsWithRealtimeData
    
    // Filtro de marcas
    if (brands && brands.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (product.specifications && typeof product.specifications === 'object') {
          const spec = product.specifications as any
          if (spec.tags && Array.isArray(spec.tags)) {
            return spec.tags.some((tag: any) => 
              tag.code === 'Brand' && brands.includes(tag.value)
            )
          }
        }
        return false
      })
    }
    
    // Filtro de stock
    if (inStock) {
      filteredProducts = filteredProducts.filter(product => 
        product.currentStock > 0 && product.stockStatus !== 'out_of_stock'
      )
    }
    
    // Filtros de ubicación (indoor/outdoor)
    if (location && location.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.specifications || typeof product.specifications !== 'object') return false
        const spec = product.specifications as any
        return location.some(loc => {
          const locationIcon = spec.locationIcon?.toLowerCase() || ''
          return locationIcon.includes(loc.toLowerCase())
        })
      })
    }
    
    // Filtros de color
    if (colors && colors.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.specifications || typeof product.specifications !== 'object') return false
        const spec = product.specifications as any
        if (spec.tags && Array.isArray(spec.tags)) {
          return spec.tags.some((tag: any) => 
            tag.code === 'Colour' && colors.some(color => 
              tag.value.toLowerCase().includes(color.toLowerCase())
            )
          )
        }
        // También buscar en la descripción del producto
        const description = (product.description || '').toLowerCase()
        return colors.some(color => description.includes(color.toLowerCase()))
      })
    }
    
    // Filtros de sistema de plantación
    if (plantingSystem && plantingSystem.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const description = (product.description || '').toLowerCase()
        return plantingSystem.some(system => {
          switch (system) {
            case 'soil':
              return description.includes('vulkastrat') || description.includes('soil')
            case 'hydro':
              return description.includes('hydro')
            case 'artificial':
              return description.includes('artificial') || description.includes('glued')
            default:
              return false
          }
        })
      })
    }
    
    // Filtros de dimensiones (height/width) - aplicar en memoria
    if (heightMin !== undefined || heightMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.specifications || typeof product.specifications !== 'object') return true
        const spec = product.specifications as any
        const height = spec.dimensions?.height
        if (height === undefined || height === null) return true
        
        if (heightMin !== undefined && height < heightMin) return false
        if (heightMax !== undefined && height > heightMax) return false
        return true
      })
    }
    
    if (widthMin !== undefined || widthMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.specifications || typeof product.specifications !== 'object') return true
        const spec = product.specifications as any
        const width = spec.dimensions?.width
        if (width === undefined || width === null) return true
        
        if (widthMin !== undefined && width < widthMin) return false
        if (widthMax !== undefined && width > widthMax) return false
        return true
      })
    }
    
    // 4. Ordenamiento especial para ofertas (en memoria)
    let finalProducts = filteredProducts
    if (sortBy === 'offer') {
      finalProducts = filteredProducts.sort((a, b) => {
        const aIsOffer = a.specifications && typeof a.specifications === 'object' && (a.specifications as any).isOffer === true
        const bIsOffer = b.specifications && typeof b.specifications === 'object' && (b.specifications as any).isOffer === true
        
        // Primero los que están en oferta, luego alfabético
        if (aIsOffer && !bIsOffer) return -1
        if (!aIsOffer && bIsOffer) return 1
        
        // Si ambos tienen el mismo estado de oferta, ordenar alfabéticamente
        return a.name.localeCompare(b.name)
      })
    }

    // 5. Aplicar paginación después de todos los filtros en memoria
    const totalCount = finalProducts.length
    const skip = (page - 1) * actualLimit
    const paginatedProducts = finalProducts.slice(skip, skip + actualLimit)
    
    return {
      products: paginatedProducts,
      pagination: {
        page,
        limit: actualLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / actualLimit),
        hasNextPage: page * actualLimit < totalCount,
        hasPrevPage: page > 1
      }
    }
  }

  /**
   * Sincronizar cambios desde Nieuwkoop
   */
  async syncChanges(lastSyncDate?: Date, batchConfig?: any): Promise<{
    newProducts: number
    updatedProducts: number
    errors: number
  }> {
    try {
      console.log('🔄 Sincronizando cambios desde Nieuwkoop...')
      
      // Obtener productos por lotes para evitar saturar el servidor
      const response = await nieuwkoopRealClient.getProductsInBatches({
        sysmodified: lastSyncDate?.toISOString().split('T')[0] || '2020-01-01',
        batchSize: 500
      })

      if (!response.success || !response.data) {
        throw new Error('Error al obtener cambios de Nieuwkoop')
      }

      let newProducts = 0
      let updatedProducts = 0
      let errors = 0

      // Usar configuración de lotes personalizada o valores por defecto
      const batchSize = batchConfig?.batchSize || 500
      const pauseBetweenBatches = batchConfig?.pauseBetweenBatches || 2000
      const enableProgressLogging = batchConfig?.enableProgressLogging !== false
      
      console.log(`📊 Procesando ${response.data.length} productos en lotes de ${batchSize}...`)
      
      // Procesar productos en lotes para evitar sobrecargar la base de datos
      const totalBatches = Math.ceil(response.data.length / batchSize)
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * batchSize
        const end = Math.min(start + batchSize, response.data.length)
        const batch = response.data.slice(start, end)
        
        if (enableProgressLogging) {
          console.log(`📊 Procesando lote ${batchIndex + 1}/${totalBatches} (${batch.length} productos)...`)
        }
        
        // Procesar cada producto del lote
        for (const nieuwkoopProduct of batch) {
        try {
          const existingProduct = await prisma.product.findUnique({
            where: { nieuwkoopId: nieuwkoopProduct.Itemcode }
          })

          // No guardamos URLs de imágenes, solo el ItemCode
          // Las imágenes se generan dinámicamente con /api/images/{itemcode}
          const images: string[] = []

          // Mapear y traducir categorías
          const categoryEN = nieuwkoopProduct.MainGroupDescription_EN || nieuwkoopProduct.MainGroupDescription_NL || 'Sin categoría'
          const subcategoryEN = nieuwkoopProduct.ProductGroupDescription_EN || nieuwkoopProduct.ProductGroupDescription_NL || 'Sin subcategoría'
          const materialEN = nieuwkoopProduct.MaterialGroupDescription_EN || nieuwkoopProduct.MaterialGroupDescription_NL
          const countryEN = nieuwkoopProduct.CountryOfOrigin
          
          const category = translateCategory(categoryEN)
          const subcategory = translateSubcategory(subcategoryEN)

          // Crear especificaciones con traducción y datos adicionales
          const specifications = {
            material: materialEN ? translateMaterial(materialEN) : null,
            materialOriginal: materialEN, // Mantener original en inglés
            variety: nieuwkoopProduct.ItemVariety_EN || nieuwkoopProduct.ItemVariety_NL,
            dimensions: {
              height: nieuwkoopProduct.Height,
              width: nieuwkoopProduct.Width,
              depth: nieuwkoopProduct.Depth,
              diameter: nieuwkoopProduct.Diameter,
              opening: nieuwkoopProduct.Opening
            },
            weight: nieuwkoopProduct.Weight,
            deliveryTime: nieuwkoopProduct.DeliveryTimeInDays,
            countryOfOrigin: countryEN ? translateCountry(countryEN) : null,
            countryOfOriginOriginal: countryEN, // Mantener original en inglés
            
            // Información adicional del producto
            potSize: nieuwkoopProduct.PotSize,
            culturePot: {
              diameter: nieuwkoopProduct.DiameterCulturePot,
              height: nieuwkoopProduct.HeightCulturePot
            },
            gtinCode: nieuwkoopProduct.GTINCode,
            hsCode: nieuwkoopProduct.HSCode,
            salesPackage: nieuwkoopProduct.SalesPackage_EN || nieuwkoopProduct.SalesPackage_NL,
            leafSize: nieuwkoopProduct.LeafSize,
            quantityTrolley: nieuwkoopProduct.QuantityTrolley,
            locationIcon: (nieuwkoopProduct as any).LocationIcon_EN || (nieuwkoopProduct as any).LocationIcon_NL,
            citesListed: nieuwkoopProduct.CitesListed,
            fytoListed: nieuwkoopProduct.FytoListed,
            isOffer: nieuwkoopProduct.IsOffer,
            salesOrderSize: nieuwkoopProduct.SalesOrderSize,
            
            // Tags procesados tomando solo inglés
            tags: nieuwkoopProduct.Tags ? nieuwkoopProduct.Tags.map(tag => {
              if (typeof tag === 'string') return tag;
              if (tag.Code && tag.Values && tag.Values.length > 0) {
                // Buscar descripción en inglés
                const englishValue = tag.Values.find(v => v.Description_EN);
                return {
                  code: tag.Code,
                  value: englishValue ? englishValue.Description_EN : tag.Values[0].Description_NL || tag.Code
                };
              }
              return tag.Code || 'Característica';
            }) : [],
            
            // Mantener datos originales para referencia
            categoryOriginal: categoryEN,
            subcategoryOriginal: subcategoryEN
          }

          if (existingProduct) {
            // Actualizar producto existente
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: {
                name: nieuwkoopProduct.Description,
                description: nieuwkoopProduct.ItemDescription_EN || nieuwkoopProduct.ItemDescription_NL,
                category,
                subcategory,
                basePrice: nieuwkoopProduct.Salesprice, // Usar Salesprice del API
                stock: 0, // Stock se obtiene en tiempo real
                images,
                specifications,
                active: nieuwkoopProduct.ShowOnWebsite && nieuwkoopProduct.ItemStatus === 'A',
                sysmodified: nieuwkoopProduct.Sysmodified,
                updatedAt: new Date()
              }
            })
            updatedProducts++
          } else {
            // Generar slug único
            const baseSlug = nieuwkoopProduct.Description
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim()
            const slug = `${baseSlug}-${nieuwkoopProduct.Itemcode.toLowerCase()}`

            // Crear nuevo producto
            await prisma.product.create({
              data: {
                nieuwkoopId: nieuwkoopProduct.Itemcode,
                sku: nieuwkoopProduct.Itemcode,
                slug: slug,
                name: nieuwkoopProduct.Description,
                description: nieuwkoopProduct.ItemDescription_EN || nieuwkoopProduct.ItemDescription_NL,
                category,
                subcategory,
                basePrice: nieuwkoopProduct.Salesprice, // Usar Salesprice del API
                stock: 0, // Stock se obtiene en tiempo real
                images,
                specifications,
                active: nieuwkoopProduct.ShowOnWebsite && nieuwkoopProduct.ItemStatus === 'A',
                sysmodified: nieuwkoopProduct.Sysmodified,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
            newProducts++
          }
          } catch (error) {
            console.error(`Error procesando producto ${nieuwkoopProduct.Itemcode}:`, error)
            errors++
          }
        }
        
        // Pausa entre lotes para evitar saturar el servidor
        if (batchIndex < totalBatches - 1) {
          if (enableProgressLogging) {
            console.log(`⏳ Pausa de ${pauseBetweenBatches}ms entre lotes...`)
          }
          await new Promise(resolve => setTimeout(resolve, pauseBetweenBatches))
        }
      }

      // Actualizar timestamp de sincronización
      await prisma.configuration.upsert({
        where: { key: 'last_sync_date' },
        update: { 
          value: { timestamp: new Date().toISOString() },
          updatedAt: new Date()
        },
        create: {
          key: 'last_sync_date',
          value: { timestamp: new Date().toISOString() },
          description: 'Última sincronización de productos'
        }
      })

      console.log(`✅ Sincronización completada: ${newProducts} nuevos, ${updatedProducts} actualizados, ${errors} errores`)
      
      return { newProducts, updatedProducts, errors }
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      throw error
    }
  }

  /**
   * Determinar estado del stock
   */
  private getStockStatus(stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (stock === 0) return 'out_of_stock'
    if (stock < 5) return 'low_stock'
    return 'in_stock'
  }

  /**
   * Obtener conteos de filtros para la consulta actual
   */
  async getFilterCounts(filters: {
    category?: string
    categories?: string[]
    brands?: string[]
    search?: string
    // Advanced filters
    priceMin?: number
    priceMax?: number
    heightMin?: number
    heightMax?: number
    widthMin?: number
    widthMax?: number
    inStock?: boolean
    location?: string[]
    plantingSystem?: string[]
    colors?: string[]
    advancedCategories?: string[]
  }) {
    const { 
      category, categories, brands, search,
      priceMin, priceMax, heightMin, heightMax, widthMin, widthMax, inStock,
      location, plantingSystem, colors, advancedCategories
    } = filters

    // Las categorías ya vienen en inglés original, usar directamente

    // Construir el where base (igual que en getProductsWithRealtimeData)
    const where: any = { active: true }
    
    if (category) {
      where.category = category
    }
    
    if (categories && categories.length > 0) {
      where.OR = [
        { category: { in: categories } },
        { subcategory: { in: categories } }
      ]
    }
    
    // Advanced category filter (from advanced filters)
    if (advancedCategories && advancedCategories.length > 0) {
      const categoryFilter = [
        { category: { in: advancedCategories } },
        { subcategory: { in: advancedCategories } }
      ]
      
      if (where.OR) {
        // Combine with existing OR condition
        where.AND = [
          { OR: where.OR },
          { OR: categoryFilter }
        ]
        delete where.OR
      } else {
        where.OR = categoryFilter
      }
    }
    
    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      where.basePrice = {}
      if (priceMin !== undefined) {
        where.basePrice.gte = priceMin / 2.5 // Convert back to base price
      }
      if (priceMax !== undefined) {
        where.basePrice.lte = priceMax / 2.5 // Convert back to base price
      }
    }
    
    if (search) {
      const searchCondition = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      }
      
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          searchCondition
        ]
        delete where.OR
      } else {
        where.OR = searchCondition.OR
      }
    }

    // Obtener todos los productos que coinciden con los filtros actuales
    const allProducts = await prisma.product.findMany({
      where,
      select: { id: true, category: true, subcategory: true, specifications: true, description: true, basePrice: true }
    })

    // Aplicar filtros avanzados en memoria (igual que en getProductsWithRealtimeData)
    let filteredProducts = allProducts
    
    // Filtro de marcas
    if (brands && brands.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (product.specifications && typeof product.specifications === 'object') {
          const spec = product.specifications as any
          if (spec.tags && Array.isArray(spec.tags)) {
            return spec.tags.some((tag: any) => 
              tag.code === 'Brand' && brands.includes(tag.value)
            )
          }
        }
        return false
      })
    }
    
    // Filtros de ubicación (indoor/outdoor)
    if (location && location.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.specifications || typeof product.specifications !== 'object') return false
        const spec = product.specifications as any
        return location.some(loc => {
          const locationIcon = spec.locationIcon?.toLowerCase() || ''
          return locationIcon.includes(loc.toLowerCase())
        })
      })
    }
    
    // Filtros de color
    if (colors && colors.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.specifications || typeof product.specifications !== 'object') return false
        const spec = product.specifications as any
        if (spec.tags && Array.isArray(spec.tags)) {
          return spec.tags.some((tag: any) => 
            tag.code === 'Colour' && colors.some(color => 
              tag.value.toLowerCase().includes(color.toLowerCase())
            )
          )
        }
        // También buscar en la descripción del producto
        const description = (product.description || '').toLowerCase()
        return colors.some(color => description.includes(color.toLowerCase()))
      })
    }
    
    // Filtros de sistema de plantación
    if (plantingSystem && plantingSystem.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const description = (product.description || '').toLowerCase()
        return plantingSystem.some(system => {
          switch (system) {
            case 'soil':
              return description.includes('vulkastrat') || description.includes('soil')
            case 'hydro':
              return description.includes('hydro')
            case 'artificial':
              return description.includes('artificial') || description.includes('glued')
            default:
              return false
          }
        })
      })
    }
    
    // Filtros de dimensiones (height/width)
    if (heightMin !== undefined || heightMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.specifications || typeof product.specifications !== 'object') return true
        const spec = product.specifications as any
        const height = spec.dimensions?.height
        if (height === undefined || height === null) return true
        
        if (heightMin !== undefined && height < heightMin) return false
        if (heightMax !== undefined && height > heightMax) return false
        return true
      })
    }
    
    if (widthMin !== undefined || widthMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.specifications || typeof product.specifications !== 'object') return true
        const spec = product.specifications as any
        const width = spec.dimensions?.width
        if (width === undefined || width === null) return true
        
        if (widthMin !== undefined && width < widthMin) return false
        if (widthMax !== undefined && width > widthMax) return false
        return true
      })
    }

    // Calcular conteos de categorías y marcas usando productos filtrados
    const categoryCounts: Record<string, number> = {}
    const brandCounts: Record<string, number> = {}

    filteredProducts.forEach(product => {
      // Contar categorías
      if (product.category) {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1
      }
      if (product.subcategory) {
        categoryCounts[product.subcategory] = (categoryCounts[product.subcategory] || 0) + 1
      }

      // Contar marcas
      if (product.specifications && typeof product.specifications === 'object') {
        const spec = product.specifications as any
        if (spec.tags && Array.isArray(spec.tags)) {
          spec.tags.forEach((tag: any) => {
            if (tag.code === 'Brand' && tag.value) {
              brandCounts[tag.value] = (brandCounts[tag.value] || 0) + 1
            }
          })
        }
      }
    })

    return {
      categories: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
      brands: Object.entries(brandCounts).map(([name, count]) => ({ name, count }))
    }
  }


  /**
   * Limpiar cache expirado
   */
  cleanExpiredCache(): void {
    const now = Date.now()
    for (const [sku, data] of this.priceCache.entries()) {
      if (now - data.timestamp > this.CACHE_DURATION) {
        this.priceCache.delete(sku)
      }
    }
  }
}

export const hybridSync = new HybridSync()