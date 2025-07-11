'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layouts/header'
import { prisma } from '@/lib/prisma'
import { calculatePrice } from '@/lib/pricing'
import { ShoppingCart, Search, Filter, Grid, List } from 'lucide-react'
import Image from 'next/image'

const mockProducts = [
  {
    id: '1',
    nieuwkoopId: 'demo_001',
    sku: 'PLT-FICUS-001',
    name: 'Ficus Benjamina Premium',
    description: 'Hermoso ficus benjamina ideal para interiores. Planta resistente y fácil de cuidar.',
    category: 'Plantas',
    subcategory: 'Interior',
    basePrice: 45.00,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1591958063670-a17859c19f3c?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      light: 'Luz indirecta',
      water: 'Moderado',
      humidity: 'Media-Alta',
      temperature: '18-24°C'
    },
    active: true,
    availability: 'in_stock' as const
  },
  {
    id: '2',
    nieuwkoopId: 'demo_002',
    sku: 'POT-CER-002',
    name: 'Maceta Cerámica Mediterránea',
    description: 'Elegante maceta de cerámica con diseño mediterráneo. Perfecta para plantas de interior y exterior.',
    category: 'Macetas',
    subcategory: 'Cerámica',
    basePrice: 32.50,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      material: 'Cerámica esmaltada',
      drainage: 'Con agujero de drenaje',
      frost_resistant: 'Sí'
    },
    active: true,
    availability: 'in_stock' as const
  },
  {
    id: '3',
    nieuwkoopId: 'demo_003',
    sku: 'PLT-SUCC-003',
    name: 'Colección Suculentas Mix',
    description: 'Set de 6 suculentas variadas perfectas para principiantes. Incluye macetas individuales.',
    category: 'Plantas',
    subcategory: 'Suculentas',
    basePrice: 28.90,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      light: 'Luz directa',
      water: 'Poco frecuente',
      humidity: 'Baja',
      temperature: '15-30°C'
    },
    active: true,
    availability: 'in_stock' as const
  }
]

interface Product {
  id: string
  nieuwkoopId: string
  sku: string
  name: string
  description: string
  category: string
  subcategory: string
  basePrice: number
  stock: number
  images: string[]
  specifications: Record<string, any>
  active: boolean
  availability: 'in_stock' | 'out_of_stock' | 'limited'
}

interface ProductCardProps {
  product: Product
  userRole?: 'ADMIN' | 'ASSOCIATE' | 'CUSTOMER'
  priority?: boolean
}

function ProductCard({ product, userRole, priority = false }: ProductCardProps) {
  const finalPrice = calculatePrice(product.basePrice, userRole)
  const discount = userRole === 'ASSOCIATE' ? 20 : 0
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {product.images.length > 0 && (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
            priority={priority}
          />
        )}
        {product.availability === 'limited' && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
            Stock limitado
          </div>
        )}
        {product.availability === 'out_of_stock' && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
            Agotado
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{product.category} • {product.subcategory}</p>
            <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#183a1d]">
              €{finalPrice.toFixed(2)}
            </div>
            {discount > 0 && (
              <div className="text-sm text-gray-500 line-through">
                €{(product.basePrice * 2.5).toFixed(2)}
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 bg-[#183a1d] text-white px-4 py-2 rounded-lg hover:bg-[#2a5530] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={product.availability === 'out_of_stock'}
          >
            <ShoppingCart size={16} />
            Agregar al carrito
          </button>
        </div>
        
        {userRole === 'ASSOCIATE' && (
          <div className="mt-2 px-3 py-1 bg-[#f0a04b] text-white rounded-full text-xs text-center">
            Descuento Asociado: 20%
          </div>
        )}
      </div>
    </div>
  )
}

export default function CatalogoSimplePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const categories = Array.from(new Set(mockProducts.map(p => p.category)))
  
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory && product.active
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar con filtros */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar productos
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#183a1d] focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="bg-[#f0a04b] text-white p-3 rounded-lg text-sm">
                <p className="font-medium">Catálogo Demo</p>
                <p>Productos de demostración con datos mock</p>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Catálogo de Productos</h1>
                <p className="text-gray-600">
                  {filteredProducts.length} productos encontrados
                </p>
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No se encontraron productos</p>
                <p className="text-gray-500 mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    userRole="CUSTOMER"
                    priority={index < 3}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}