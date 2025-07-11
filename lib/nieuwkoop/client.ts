interface NieuwkoopConfig {
  baseURL: string
  username: string
  password: string
  mode: 'demo' | 'production'
  timeout: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface NieuwkoopProduct {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  subcategory?: string
  price: number
  currency: string
  stock: number
  images: string[]
  specifications?: Record<string, any>
  dimensions?: {
    height?: number
    width?: number
    depth?: number
    diameter?: number
  }
  weight?: number
  availability: 'in_stock' | 'out_of_stock' | 'limited'
  tags?: string[]
  createdAt: string
  updatedAt: string
}

interface ProductFilters {
  category?: string
  subcategory?: string
  availability?: 'in_stock' | 'out_of_stock' | 'limited'
  minPrice?: number
  maxPrice?: number
  search?: string
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

class NieuwkoopClient {
  private config: NieuwkoopConfig

  constructor(config: Partial<NieuwkoopConfig> = {}) {
    this.config = {
      baseURL: process.env.NIEUWKOOP_API_URL || 'https://demo-api.nieuwkoop-europe.io',
      apiKey: process.env.NIEUWKOOP_API_KEY || 'demo_key_12345',
      mode: (process.env.NIEUWKOOP_API_MODE as 'demo' | 'production') || 'demo',
      timeout: 30000,
      ...config,
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`
    
    // If in demo mode, return mock data
    if (this.config.mode === 'demo') {
      return this.getMockResponse<T>(endpoint, options)
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-API-Version': '1.0',
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data,
        pagination: data.pagination,
      }
    } catch (error: any) {
      console.error('Nieuwkoop API Error:', error)
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      }
    }
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit): ApiResponse<T> {
    // Mock responses for demo mode
    if (endpoint.includes('/products')) {
      return this.getMockProducts() as ApiResponse<T>
    }
    
    if (endpoint.includes('/categories')) {
      return this.getMockCategories() as ApiResponse<T>
    }

    return {
      success: false,
      error: 'Mock endpoint not implemented',
    }
  }

  private getMockProducts(): ApiResponse<NieuwkoopProduct[]> {
    const mockProducts: NieuwkoopProduct[] = [
      {
        id: 'demo_001',
        sku: 'PLT-FICUS-001',
        name: 'Ficus Benjamina Premium',
        description: 'Hermoso ficus benjamina ideal para interiores. Planta resistente y fácil de cuidar.',
        category: 'Plantas',
        subcategory: 'Interior',
        price: 45.00,
        currency: 'EUR',
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1591958063670-a17859c19f3c?w=400',
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'
        ],
        specifications: {
          light: 'Luz indirecta',
          water: 'Moderado',
          humidity: 'Media-Alta',
          temperature: '18-24°C'
        },
        dimensions: {
          height: 120,
          diameter: 25
        },
        weight: 8.5,
        availability: 'in_stock',
        tags: ['interior', 'facil-cuidado', 'purificador'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: 'demo_002',
        sku: 'POT-CER-002',
        name: 'Maceta Cerámica Mediterránea',
        description: 'Elegante maceta de cerámica con diseño mediterráneo. Perfecta para plantas de interior y exterior.',
        category: 'Macetas',
        subcategory: 'Cerámica',
        price: 32.50,
        currency: 'EUR',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
          'https://images.unsplash.com/photo-1586953811686-0c2f4b7f4bc1?w=400'
        ],
        specifications: {
          material: 'Cerámica esmaltada',
          drainage: 'Con agujero de drenaje',
          frost_resistant: 'Sí'
        },
        dimensions: {
          height: 35,
          diameter: 30
        },
        weight: 3.2,
        availability: 'in_stock',
        tags: ['ceramica', 'mediterraneo', 'exterior'],
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-18T12:45:00Z'
      },
      {
        id: 'demo_003',
        sku: 'PLT-SUCC-003',
        name: 'Colección Suculentas Mix',
        description: 'Set de 6 suculentas variadas perfectas para principiantes. Incluye macetas individuales.',
        category: 'Plantas',
        subcategory: 'Suculentas',
        price: 28.90,
        currency: 'EUR',
        stock: 40,
        images: [
          'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400',
          'https://images.unsplash.com/photo-1416024576156-4bf68ea06caa?w=400'
        ],
        specifications: {
          light: 'Luz directa',
          water: 'Poco frecuente',
          humidity: 'Baja',
          temperature: '15-30°C'
        },
        dimensions: {
          height: 8,
          diameter: 6
        },
        weight: 0.5,
        availability: 'in_stock',
        tags: ['suculentas', 'principiantes', 'set', 'poco-riego'],
        createdAt: '2024-01-12T14:20:00Z',
        updatedAt: '2024-01-22T08:15:00Z'
      },
      {
        id: 'demo_004',
        sku: 'GDN-TOOL-004',
        name: 'Kit Herramientas Jardinería Premium',
        description: 'Set completo de herramientas profesionales para jardinería. Incluye pala, rastrillo, tijeras y más.',
        category: 'Jardín',
        subcategory: 'Herramientas',
        price: 89.99,
        currency: 'EUR',
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400'
        ],
        specifications: {
          material: 'Acero inoxidable',
          handle: 'Mango ergonómico',
          warranty: '2 años'
        },
        dimensions: {
          height: 40,
          width: 25,
          depth: 8
        },
        weight: 2.1,
        availability: 'limited',
        tags: ['herramientas', 'profesional', 'acero', 'ergonomico'],
        createdAt: '2024-01-08T11:30:00Z',
        updatedAt: '2024-01-25T16:20:00Z'
      },
      {
        id: 'demo_005',
        sku: 'PLT-ORCH-005',
        name: 'Orquídea Phalaenopsis Blanca',
        description: 'Elegante orquídea blanca de la variedad Phalaenopsis. Floración prolongada y cuidado moderado.',
        category: 'Plantas',
        subcategory: 'Florales',
        price: 65.00,
        currency: 'EUR',
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1583515557027-28535ec5d9b5?w=400',
          'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400'
        ],
        specifications: {
          light: 'Luz indirecta brillante',
          water: 'Semanal por inmersión',
          humidity: 'Alta (60-80%)',
          temperature: '20-25°C'
        },
        dimensions: {
          height: 60,
          diameter: 12
        },
        weight: 1.8,
        availability: 'limited',
        tags: ['orquidea', 'floral', 'elegante', 'regalo'],
        createdAt: '2024-01-05T13:45:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'demo_006',
        sku: 'POT-FIB-006',
        name: 'Maceta Fibra Natural Grande',
        description: 'Maceta ecológica de fibra natural. Ligera, resistente y perfecta para plantas grandes.',
        category: 'Macetas',
        subcategory: 'Fibra',
        price: 48.75,
        currency: 'EUR',
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'
        ],
        specifications: {
          material: 'Fibra natural reciclada',
          drainage: 'Excelente drenaje',
          uv_resistant: 'Sí'
        },
        dimensions: {
          height: 45,
          diameter: 40
        },
        weight: 1.5,
        availability: 'in_stock',
        tags: ['fibra', 'ecologico', 'ligero', 'grande'],
        createdAt: '2024-01-14T12:00:00Z',
        updatedAt: '2024-01-19T14:15:00Z'
      }
    ]

    return {
      success: true,
      data: mockProducts,
      pagination: {
        page: 1,
        limit: 20,
        total: mockProducts.length,
        totalPages: 1
      }
    }
  }

  private getMockCategories(): ApiResponse<string[]> {
    return {
      success: true,
      data: ['Plantas', 'Macetas', 'Jardín', 'Herramientas', 'Fertilizantes']
    }
  }

  // Public methods
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<NieuwkoopProduct[]>> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const endpoint = `/products?${queryParams.toString()}`
    return this.request<NieuwkoopProduct[]>(endpoint)
  }

  async getProduct(id: string): Promise<ApiResponse<NieuwkoopProduct>> {
    return this.request<NieuwkoopProduct>(`/products/${id}`)
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/categories')
  }

  async getStock(sku: string): Promise<ApiResponse<{ sku: string; stock: number }>> {
    return this.request<{ sku: string; stock: number }>(`/inventory/${sku}`)
  }

  async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ApiResponse<NieuwkoopProduct[]>> {
    return this.getProducts({ ...filters, search: query })
  }
}

// Export singleton instance
export const nieuwkoopClient = new NieuwkoopClient()
export type { NieuwkoopProduct, ProductFilters, ApiResponse }