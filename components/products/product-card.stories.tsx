/**
 * ProductCard Component Usage Examples
 * 
 * Este archivo muestra diferentes formas de usar el componente ProductCard
 * con distintas props y configuraciones.
 */

import { ProductCard } from './product-card'
import { Product } from '@/types/product'

// Ejemplo de producto de muestra
const sampleProduct: Product = {
  id: '1',
  nieuwkoopId: 'NW001',
  sku: 'NW001',
  slug: 'producto-ejemplo',
  name: 'Maceta de Cerámica Blanca',
  description: 'Hermosa maceta de cerámica blanca perfecta para plantas de interior',
  category: 'Macetas',
  subcategory: 'Cerámica',
  basePrice: 15.99,
  displayPrice: 31.98,
  originalPrice: 39.98,
  stock: 25,
  images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop&q=80'],
  specifications: {},
  active: true,
  availability: 'in_stock',
  isFeatured: false,
  popularity: 5,
  isRealTimeData: true,
  lastPriceCheck: '2024-01-15T10:30:00Z',
  hasDiscount: true,
  stockStatus: 'in_stock',
  stockText: 'Disponible',
  priceText: '31.98 €',
  originalPriceText: '39.98 €',
  isOffer: false
}

// Ejemplo de producto en oferta
const offerProduct: Product = {
  ...sampleProduct,
  id: '2',
  name: 'Maceta Premium en Oferta',
  isOffer: true,
  stockStatus: 'in_stock'
}

// Ejemplo de producto con stock limitado
const limitedStockProduct: Product = {
  ...sampleProduct,
  id: '3',
  name: 'Maceta Edición Limitada',
  stockStatus: 'low_stock',
  stock: 3
}

// Ejemplo de producto agotado
const outOfStockProduct: Product = {
  ...sampleProduct,
  id: '4',
  name: 'Maceta Agotada',
  stockStatus: 'out_of_stock',
  availability: 'out_of_stock',
  stock: 0
}

// Ejemplos de uso del componente

/**
 * Ejemplo 1: Uso básico en vista de cuadrícula
 */
export const BasicGridExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCard
        product={sampleProduct}
        userRole="CUSTOMER"
        viewMode="grid"
      />
      <ProductCard
        product={offerProduct}
        userRole="ASSOCIATE"
        viewMode="grid"
      />
      <ProductCard
        product={limitedStockProduct}
        userRole="CUSTOMER"
        viewMode="grid"
      />
    </div>
  )
}

/**
 * Ejemplo 2: Uso en vista de lista
 */
export const ListViewExample = () => {
  return (
    <div className="space-y-4">
      <ProductCard
        product={sampleProduct}
        userRole="CUSTOMER"
        viewMode="list"
      />
      <ProductCard
        product={offerProduct}
        userRole="ASSOCIATE"
        viewMode="list"
      />
    </div>
  )
}

/**
 * Ejemplo 3: Con funciones personalizadas
 */
export const CustomFunctionsExample = () => {
  const handleProductClick = (product: Product) => {
    console.log('Producto clickeado:', product.name)
    // Navegación personalizada
  }

  const handleAddToCart = (product: Product) => {
    console.log('Agregar al carrito:', product.name)
    // Lógica personalizada del carrito
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProductCard
        product={sampleProduct}
        userRole="CUSTOMER"
        viewMode="grid"
        onClick={handleProductClick}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}

/**
 * Ejemplo 4: Sin botón de agregar al carrito (solo visualización)
 */
export const DisplayOnlyExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProductCard
        product={sampleProduct}
        userRole="CUSTOMER"
        viewMode="grid"
        showAddToCart={false}
      />
    </div>
  )
}

/**
 * Ejemplo 5: Sin ribbons (vista limpia)
 */
export const CleanViewExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProductCard
        product={sampleProduct}
        userRole="CUSTOMER"
        viewMode="grid"
        showRibbons={false}
      />
    </div>
  )
}

/**
 * Ejemplo 6: Sin descuentos visibles
 */
export const NoDiscountExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProductCard
        product={sampleProduct}
        userRole="ASSOCIATE"
        viewMode="grid"
        showDiscount={false}
      />
    </div>
  )
}

/**
 * Ejemplo 7: Con clase CSS personalizada
 */
export const CustomStyleExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProductCard
        product={sampleProduct}
        userRole="CUSTOMER"
        viewMode="grid"
        className="border-2 border-blue-200 hover:border-blue-400"
      />
    </div>
  )
}

/**
 * Ejemplo 8: Diferentes estados de stock
 */
export const StockStatesExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProductCard
        product={sampleProduct}
        userRole="CUSTOMER"
        viewMode="grid"
      />
      <ProductCard
        product={limitedStockProduct}
        userRole="CUSTOMER"
        viewMode="grid"
      />
      <ProductCard
        product={outOfStockProduct}
        userRole="CUSTOMER"
        viewMode="grid"
      />
    </div>
  )
}

/**
 * Props disponibles para el componente ProductCard:
 * 
 * @param product - Objeto Product (requerido)
 * @param userRole - 'ADMIN' | 'ASSOCIATE' | 'CUSTOMER' (opcional)
 * @param viewMode - 'grid' | 'list' (opcional, default: 'grid')
 * @param onClick - Función llamada al hacer clic en el producto (opcional)
 * @param onAddToCart - Función llamada al agregar al carrito (opcional)
 * @param showAddToCart - Mostrar botón de agregar al carrito (opcional, default: true)
 * @param showDiscount - Mostrar descuento de asociado (opcional, default: true)
 * @param showRibbons - Mostrar ribbons de estado (opcional, default: true)
 * @param className - Clases CSS adicionales (opcional)
 */