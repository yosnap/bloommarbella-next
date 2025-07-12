# Bloom Marbella - E-commerce Platform

## Información del Proyecto

### Descripción
E-commerce moderno desarrollado para Bloom Marbella que consume y gestiona datos del API de Nieuwkoop Europe, proporcionando una experiencia de compra elegante y funcional con gestión avanzada de precios, usuarios asociados y contenido dinámico.

### Objetivo
Crear una plataforma e-commerce premium para Bloom Marbella que permita:
- Catálogo completo de productos con información detallada del API Nieuwkoop Europe
- Sistema de gestión de precios con multiplicador configurable (x2.5 por defecto)
- Programa de usuarios asociados con descuentos exclusivos del 20%
- Panel de administración completo para gestión de contenido
- Blog integrado y sección de servicios
- Procesamiento de órdenes de venta
- Experiencia de usuario elegante con diseño inspirado en la naturaleza

### Características Principales Implementadas

#### 🌿 **Catálogo de Productos**
- Búsqueda avanzada con filtros por categorías, materiales, y características
- Ordenamiento por: precio, alfabético, fecha, ofertas
- Paginación con selector de items por página (12, 16, 24, 36)
- Vista grid/lista
- Integración en tiempo real con API Nieuwkoop

#### 📦 **Gestión de Stock**
- Visualización en tiempo real del inventario disponible
- Estados: en stock, stock limitado, agotado
- Sincronización automática con API
- Caché inteligente con TTL configurable

#### 💰 **Sistema de Precios Dinámico**
- Multiplicador configurable sobre precios del API (x2.5 por defecto)
- Precios diferenciados por rol de usuario
- Toggle IVA para usuarios asociados
- Visualización de precios tachados para descuentos

#### 👥 **Sistema de Usuarios**
- **Clientes regulares**: Precios con IVA incluido
- **Usuarios Asociados**: 
  - Descuento del 20%
  - Opción de ver precios con/sin IVA
  - Banner deslizante informativo
  - Registro con aprobación manual

#### ❤️ **Sistema de Favoritos**
- Agregar/quitar productos de favoritos
- Soporte para usuarios anónimos (localStorage)
- Sincronización con cuenta al iniciar sesión
- Contador en header
- Página dedicada de gestión

#### 🎨 **Diseño Premium**
- Interfaz elegante con colores primario #183a1d y secundario #f0a04b
- Tipografía Cormorant Infant + Inter
- Animaciones suaves y transiciones
- Diseño responsive mobile-first
- Componentes reutilizables con shadcn/ui

#### 🌐 **Sistema de Traducciones**
- Traducciones dinámicas desde base de datos
- Gestión por categorías (general, productos, tags, etc.)
- Panel de administración para traducciones
- Autocompletado inteligente
- Importación/exportación masiva

#### 💬 **Sistema de Contacto por WhatsApp**
- Botón de WhatsApp en cada producto reemplazando el carrito temporal
- Mensaje pre-formateado con información del producto
- Configuración admin para número, contacto y plantilla de mensaje
- Integración directa con WhatsApp Web

#### 🛒 **Sistema de Pedidos** (Próximamente)
- Carrito de compras
- Checkout optimizado
- Gestión de órdenes
- Historial de pedidos

#### ⚙️ **Panel de Administración**
- Dashboard con métricas clave
- Gestión de productos y visibilidad
- Configuración de multiplicador de precios
- Gestión de usuarios y roles
- Sistema de traducciones
- Configuración de caché
- Acciones rápidas

#### 🔄 **Sincronización con API**
- Sistema híbrido: base de datos local + API tiempo real
- Actualización automática de stock
- Importación masiva de productos
- Webhooks para actualizaciones

#### 📱 **Características Adicionales**
- Sistema de notificaciones toast
- Debug panel para desarrollo
- Logs detallados de API
- Manejo robusto de errores
- SEO optimizado con metadatos dinámicos

### Tecnologías Utilizadas
- **Frontend Framework**: Next.js 15.3.5 con App Router
- **Lenguaje**: TypeScript 5.x
- **Estilizado**: Tailwind CSS + shadcn/ui
- **Tipografías**: Cormorant Infant + Inter (Google Fonts)
- **Base de Datos**: MongoDB con Prisma ORM
- **Estado Global**: Context API + Custom Hooks
- **Cliente HTTP**: Fetch API nativo
- **Autenticación**: NextAuth.js v4
- **Validación**: Tipos TypeScript
- **Iconos**: Lucide React
- **Imágenes**: Next/Image con optimización
- **Linting**: ESLint + Prettier

### Paleta de Colores
- **Color Primario**: #183a1d (Verde oscuro)
- **Color Secundario**: #f0a04b (Naranja cálido)
- **Fuente Principal**: Cormorant Infant

### API de Nieuwkoop Europe
La aplicación consume el API REST de Nieuwkoop Europe que proporciona:
- Endpoints para datos de productos
- Información de inventario
- Sistema de precios
- Gestión de imágenes
- Procesamiento de pedidos
- Metadatos y tags de productos

**URL del API**: https://developer.nieuwkoop-europe.io/  
**Playground**: https://customerapi_playground.nieuwkoop-europe.com/swagger/

### Requisitos del Sistema
- Node.js 18.17 o superior
- npm 9+ o yarn 1.22+
- Navegador moderno con soporte ES6+
- Conexión a internet estable

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/yosnap/bloommarbella-next.git
cd bloommarbella-next

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar migraciones de base de datos
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar linter
npm run prisma:push  # Actualizar esquema BD
npm run prisma:studio # GUI de Prisma
```

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="mongodb://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# API Nieuwkoop
NIEUWKOOP_API_KEY="your-api-key"
NIEUWKOOP_API_URL="https://customerapi.nieuwkoop-europe.com"

# Configuración
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Estructura del Proyecto

```
bloommarbella-next/
├── app/                    # App Router pages
│   ├── (auth)/            # Páginas de autenticación
│   ├── admin/             # Panel de administración
│   ├── api/               # API Routes
│   ├── catalogo/          # Catálogo de productos
│   ├── cuenta/            # Área de usuario
│   └── productos/         # Detalle de productos
├── components/            # Componentes React
│   ├── admin/            # Componentes admin
│   ├── layouts/          # Layouts principales
│   ├── products/         # Componentes de productos
│   └── ui/               # Componentes UI base
├── contexts/             # Context providers
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuración
│   ├── nieuwkoop/       # Integración API
│   ├── translations/    # Sistema de traducciones
│   └── prisma.ts        # Cliente Prisma
├── prisma/              # Esquema y migraciones
├── public/              # Archivos estáticos
└── types/               # Tipos TypeScript
```

### Equipo de Desarrollo
- **Cliente**: Bloom Marbella
- **Proyecto**: Integración API Nieuwkoop Europe
- **Inicio del Proyecto**: Enero 2025
- **Stack Principal**: Next.js 15 + TypeScript + MongoDB

### Licencia
Proyecto privado desarrollado para Bloom Marbella. Todos los derechos reservados.

### Enlaces Útiles
- [Repositorio GitHub](https://github.com/yosnap/bloommarbella-next)
- [Documentación del API](https://developer.nieuwkoop-europe.io/)
- [API Playground](https://customerapi_playground.nieuwkoop-europe.com/swagger/)
- [Registro de Cambios](./CHANGELOG.md)
- [Documentación Claude](./CLAUDE.md)