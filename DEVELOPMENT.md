# Documentación de Desarrollo - Nieuwkoop Europe API Client

## Tabla de Contenidos
1. [Información Técnica](#información-técnica)
2. [Arquitectura](#arquitectura)
3. [Configuración de Desarrollo](#configuración-de-desarrollo)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [API de Nieuwkoop Europe](#api-de-nieuwkoop-europe)
6. [Guía de Desarrollo](#guía-de-desarrollo)
7. [Testing](#testing)
8. [Despliegue](#despliegue)
9. [TODO List](#todo-list)
10. [Notas de Desarrollo](#notas-de-desarrollo)

## Información Técnica

### Stack Tecnológico
- **Framework**: Next.js 14.x con App Router
- **Lenguaje**: TypeScript 5.x
- **Estilizado**: Tailwind CSS 3.x + shadcn/ui
- **Tipografía**: Cormorant Infant (Google Fonts)
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: NextAuth.js
- **Estado Global**: Zustand 4.x
- **Cliente HTTP**: Axios 1.x
- **Cache**: TanStack Query 5.x
- **Validación**: Zod 3.x
- **Editor de Contenido**: TipTap o Slate.js
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (recomendado)

### Diseño y Branding
- **Color Primario**: #183a1d (Verde oscuro natural)
- **Color Secundario**: #f0a04b (Naranja cálido)
- **Fuente Principal**: Cormorant Infant
- **Inspiración**: bloommarbella.es
- **Estilo**: Moderno, elegante, inspirado en la naturaleza

### Requisitos de Desarrollo
```json
{
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  }
}
```

## Arquitectura

### Patrón de Diseño
La aplicación sigue una arquitectura de capas con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────┐
│                  Presentación                    │
│          (Componentes React + UI)                │
├─────────────────────────────────────────────────┤
│              Lógica de Negocio                  │
│    (Hooks, Contextos, Estados, Precios)         │
├─────────────────────────────────────────────────┤
│               Capa de Datos                     │
│   (API Services, MongoDB, Cache, Validación)    │
├─────────────────────────────────────────────────┤
│                Infraestructura                  │
│     (HTTP Client, Auth, DB, Utilidades)         │
└─────────────────────────────────────────────────┘
```

### Flujo de Datos
1. **Usuario** → Interactúa con componentes UI
2. **Componentes** → Utilizan hooks personalizados
3. **Hooks** → Llaman a servicios API
4. **Servicios** → Realizan peticiones HTTP
5. **API Client** → Gestiona autenticación y errores
6. **Cache** → Optimiza rendimiento y reduce llamadas

## Configuración de Desarrollo

### Variables de Entorno
```env
# .env.local
# API Nieuwkoop Europe
NEXT_PUBLIC_API_URL=https://customerapi_playground.nieuwkoop-europe.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_USERNAME=DemoUser
API_PASSWORD=Spring2128
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_ENABLE_CACHE=true
NEXT_PUBLIC_CACHE_TIME=1800000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bloom-marbella
MONGODB_DB=bloom-marbella

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Configuración de Precios
NEXT_PUBLIC_PRICE_MULTIPLIER=2.5
NEXT_PUBLIC_ASSOCIATE_DISCOUNT=0.20

# Colores del Tema
NEXT_PUBLIC_PRIMARY_COLOR=#183a1d
NEXT_PUBLIC_SECONDARY_COLOR=#f0a04b
```

### Scripts de NPM
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

## Estructura del Proyecto

```
bloom-marbella-ecommerce/
├── app/                      # App Router de Next.js
│   ├── (auth)/              # Rutas de autenticación
│   ├── (admin)/             # Panel de administración
│   ├── (shop)/              # Tienda principal
│   ├── blog/                # Sistema de blog
│   ├── servicios/           # Sección de servicios
│   ├── asociados/           # Portal de usuarios asociados
│   ├── api/                 # API Routes
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página de inicio
├── components/              # Componentes React
│   ├── ui/                 # Componentes UI base
│   ├── features/           # Componentes de funcionalidades
│   ├── layouts/            # Componentes de layout
│   └── icons/              # Iconos personalizados
├── lib/                    # Librerías y utilidades
│   ├── api/               # Cliente API y servicios
│   ├── db/                # Modelos y conexión MongoDB
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Funciones utilitarias
│   ├── types/             # Definiciones TypeScript
│   └── pricing/           # Lógica de precios
├── public/                # Assets estáticos
├── styles/               # Estilos globales
├── tests/                # Tests
└── config/               # Configuraciones
```

## API de Nieuwkoop Europe

### Endpoints Principales

#### Autenticación
```typescript
POST /api/auth/login
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "username": "string",
  "password": "string"
}
Response: {
  "token": "string",
  "expiresIn": number
}
```

#### Productos
```typescript
// Listar productos
GET /api/products
Query: {
  page?: number,
  limit?: number,
  search?: string,
  category?: string,
  inStock?: boolean
}

// Detalle de producto
GET /api/products/{id}

// Buscar productos
GET /api/products/search
Query: {
  q: string,
  filters?: object
}
```

#### Inventario
```typescript
// Estado del inventario
GET /api/inventory
Query: {
  location?: string,
  lowStock?: boolean
}

// Actualización de stock
GET /api/inventory/{productId}
```

#### Pedidos
```typescript
// Crear pedido
POST /api/orders
Body: {
  items: Array<{
    productId: string,
    quantity: number
  }>,
  shippingInfo: object
}

// Listar pedidos
GET /api/orders
Query: {
  status?: string,
  from?: Date,
  to?: Date
}
```

### Manejo de Errores
```typescript
interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Códigos de error comunes
- 401: No autorizado
- 403: Prohibido
- 404: No encontrado
- 429: Límite de rate excedido
- 500: Error del servidor
```

## Guía de Desarrollo

### Convenciones de Código

#### Nomenclatura
- **Componentes**: PascalCase (`ProductCard.tsx`)
- **Funciones/Hooks**: camelCase (`useProducts.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Tipos/Interfaces**: PascalCase con prefijo (`IProduct`, `TApiResponse`)

#### Estructura de Componentes
```typescript
// components/features/ProductCard.tsx
import { FC } from 'react';
import { IProduct } from '@/lib/types';

interface ProductCardProps {
  product: IProduct;
  onSelect?: (product: IProduct) => void;
}

export const ProductCard: FC<ProductCardProps> = ({ product, onSelect }) => {
  // Lógica del componente
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};
```

### Servicios API
```typescript
// lib/api/services/products.service.ts
import { apiClient } from '../client';
import { IProduct, IProductFilters } from '@/lib/types';

export const productsService = {
  async getAll(filters?: IProductFilters): Promise<IProduct[]> {
    const { data } = await apiClient.get('/products', { params: filters });
    return data;
  },
  
  async getById(id: string): Promise<IProduct> {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  }
};
```

### Custom Hooks
```typescript
// lib/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/lib/api/services';

export const useProducts = (filters?: IProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

## Testing

### Estructura de Tests
```
tests/
├── unit/              # Tests unitarios
├── integration/       # Tests de integración
├── e2e/              # Tests end-to-end
└── fixtures/         # Datos de prueba
```

### Ejemplo de Test
```typescript
// tests/unit/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/features/ProductCard';
import { mockProduct } from '@/tests/fixtures';

describe('ProductCard', () => {
  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.price)).toBeInTheDocument();
  });
});
```

## Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Variables de entorno en Vercel
# Configurar en el dashboard de Vercel
```

### Hosting Alternativo
```bash
# Configuración para servidores tradicionales
npm run build
npm run start

# Variables de entorno en producción
# Configurar en el panel de hosting
```

## TODO List

### 🚀 Alta Prioridad

#### [x] Configuración Inicial
- [x] Crear proyecto Next.js con TypeScript
- [x] Configurar Tailwind CSS y shadcn/ui
- [x] Instalar y configurar fuente Cormorant Infant
- [x] Configurar colores del tema (#183a1d y #f0a04b)
- [ ] Configurar ESLint y Prettier
- [x] Configurar estructura de carpetas actualizada
- [x] Configurar variables de entorno
- [x] Configurar MongoDB y Mongoose (Prisma)

#### [x] Diseño Base
- [x] Crear header con navegación estilo Bloom Marbella
- [x] Implementar mega menú con categorías
- [x] Diseñar iconos personalizados para el header
- [x] Crear layout responsivo base
- [x] Implementar tema de colores y tipografía

#### [x] Sistema de Precios
- [x] Implementar lógica de multiplicador de precios (x2.5)
- [x] Crear sistema de descuentos para asociados (20%)
- [x] Desarrollar utilidades de cálculo de precios
- [ ] Configurar precios dinámicos desde admin

#### [🚧] Autenticación y Usuarios
- [x] Implementar NextAuth.js
- [x] Crear sistema de roles (admin, asociado, cliente)
- [ ] Implementar registro de usuarios asociados
- [ ] Crear contexto de autenticación
- [ ] Implementar páginas de login/logout
- [x] Configurar middleware de protección de rutas

#### [x] Base de Datos MongoDB
- [x] Diseñar esquemas para blog posts
- [x] Crear modelos para servicios
- [x] Implementar modelo de usuarios asociados
- [x] Crear modelo de configuración del sitio
- [x] Implementar conexión a MongoDB (Prisma)

#### [ ] Cliente API Base
- [ ] Configurar Axios con interceptores
- [ ] Implementar transformación de precios en respuestas
- [ ] Implementar manejo global de errores
- [ ] Configurar reintentos automáticos
- [ ] Implementar logging de peticiones

### 📦 Media Prioridad

#### [ ] Panel de Administración
- [ ] Crear dashboard administrativo
- [ ] Implementar gestión de multiplicador de precios
- [ ] Crear gestión de usuarios asociados
- [ ] Implementar editor de contenido para blog
- [ ] Crear gestión de servicios
- [ ] Implementar configuración general del sitio

#### [ ] Catálogo de Productos
- [ ] Crear servicio de productos con precios calculados
- [ ] Implementar listado con paginación
- [ ] Crear componente ProductCard estilo Bloom
- [ ] Implementar búsqueda y filtros avanzados
- [ ] Crear vista detallada de producto
- [ ] Implementar galería de imágenes optimizada
- [ ] Añadir precios diferenciados para asociados

#### [ ] Sistema de Blog
- [ ] Crear modelo y API para posts
- [ ] Implementar editor de contenido (TipTap/Slate)
- [ ] Crear listado de artículos
- [ ] Implementar vista individual de post
- [ ] Añadir sistema de categorías y tags
- [ ] Implementar SEO para blog

#### [ ] Sección de Servicios
- [ ] Crear modelo para servicios
- [ ] Implementar página de servicios
- [ ] Crear tarjetas de servicio
- [ ] Añadir formulario de contacto por servicio
- [ ] Implementar galería de trabajos realizados

#### [ ] Portal de Asociados
- [ ] Crear dashboard para asociados
- [ ] Mostrar precios con descuento aplicado
- [ ] Implementar historial de compras
- [ ] Crear sistema de referidos
- [ ] Añadir beneficios exclusivos

#### [ ] Sistema de Pedidos
- [ ] Implementar carrito de compras
- [ ] Aplicar descuentos automáticos para asociados
- [ ] Crear proceso de checkout
- [ ] Implementar gestión de pedidos
- [ ] Crear historial de pedidos

### 🔧 Baja Prioridad

#### [ ] Optimizaciones
- [ ] Implementar lazy loading
- [ ] Configurar service worker
- [ ] Optimizar bundle size
- [ ] Implementar compresión de imágenes
- [ ] Configurar CDN

#### [ ] Testing
- [ ] Configurar Jest y React Testing Library
- [ ] Escribir tests unitarios (>80% cobertura)
- [ ] Implementar tests de integración
- [ ] Configurar tests E2E con Playwright
- [ ] Implementar tests de rendimiento

#### [ ] Documentación
- [ ] Documentar componentes con Storybook
- [ ] Crear guía de contribución
- [ ] Documentar API interna
- [ ] Crear videos tutoriales
- [ ] Actualizar documentación técnica

#### [ ] DevOps
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Implementar análisis de código
- [ ] Configurar monitoreo con Sentry
- [ ] Implementar métricas con Analytics
- [ ] Configurar backups automáticos

## Notas de Desarrollo

### Decisiones Técnicas

#### Por qué Next.js 14 con App Router
- Mejor rendimiento con React Server Components
- SEO optimizado out-of-the-box
- Routing basado en archivos intuitivo
- Soporte nativo para API Routes
- Excelente experiencia de desarrollo

#### Por qué Zustand sobre Redux
- API más simple y menos boilerplate
- Mejor rendimiento para aplicaciones medianas
- TypeScript support excelente
- Fácil de aprender y mantener

#### Por qué TanStack Query
- Gestión de cache automática
- Sincronización de datos en background
- Optimistic updates
- Manejo de estados de carga/error
- DevTools excelentes

#### Por qué MongoDB
- Flexibilidad para contenido dinámico (blog, servicios)
- Escalabilidad para futuro crecimiento
- Integración perfecta con Next.js
- Esquemas flexibles para diferentes tipos de contenido

#### Sistema de Precios
- Multiplicador configurable permite ajustes rápidos
- Descuentos automáticos para asociados
- Cálculos en el servidor para mayor seguridad
- Histórico de cambios de precios

### Problemas Conocidos
1. **CORS en desarrollo**: Configurar proxy en next.config.js
2. **Rate limiting del API**: Implementar throttling en cliente
3. **Imágenes grandes**: Usar Next.js Image con optimización
4. **Cálculo de precios**: Siempre calcular en servidor para evitar manipulación
5. **Fuentes personalizadas**: Precargar Cormorant Infant para mejor rendimiento

### Enlaces Útiles
- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Bloom Marbella (Referencia)](https://bloommarbella.es)

### Contacto Desarrollo
- **API Nieuwkoop**: developer@nieuwkoop-europe.com
- **Proyecto**: Bloom Marbella Development Team

---

*Última actualización: 2025-01-10*
*Versión del documento: 1.2.0*

### Progreso de Implementación

#### ✅ Completado
- Sistema base con Next.js 14 y TypeScript
- Configuración de Tailwind CSS v3
- Diseño profesional de la página principal
- Header con navegación y mega menú
- Sistema de iconos personalizados
- Configuración de colores y tipografía (Cormorant Infant)
- Base de datos con Prisma y MongoDB
- Modelos de datos completos (usuarios, productos, pedidos, blog, servicios)
- Sistema de autenticación con NextAuth.js
- Middleware de protección de rutas
- Utilidades de cálculo de precios con multiplicador y descuentos
- Variables de entorno configuradas

#### 🚧 En Progreso
- Páginas de autenticación (login/registro)
- Integración con API de Nieuwkoop

#### 📋 Próximos Pasos
1. Crear páginas de login y registro
2. Implementar el contexto de autenticación
3. Crear la integración con la API de Nieuwkoop
4. Desarrollar el catálogo de productos
5. Implementar el carrito de compras