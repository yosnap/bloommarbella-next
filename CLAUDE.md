# CLAUDE.md - Documentación para Claude AI

## Descripción del Proyecto

Bloom Marbella es una plataforma e-commerce desarrollada con Next.js 15 que consume el API de Nieuwkoop Europe para gestionar un catálogo de productos de jardinería y plantas. El proyecto incluye un sistema completo de gestión de usuarios, precios diferenciados, favoritos y administración.

## Estado Actual del Proyecto

### ✅ Funcionalidades Completadas

#### Sistema de Autenticación y Usuarios
- **NextAuth.js** configurado con MongoDB
- **Roles de usuario**: CUSTOMER (cliente regular) y ASSOCIATE (asociado con descuentos)
- **Registro con aprobación manual** para usuarios asociados
- **Sistema de sesiones** con persistencia en base de datos
- **Páginas de login/registro** con diseño personalizado

#### Catálogo de Productos
- **Listado de productos** con paginación (12, 16, 24, 36 items por página)
- **Ordenamiento**: alfabético, precio (ASC/DESC), fecha, ofertas
- **Filtros por categorías** con estructura jerárquica
- **Vista grid/lista** intercambiable
- **Búsqueda** por nombre de producto
- **Integración en tiempo real** con API Nieuwkoop para stock

#### Sistema de Precios
- **Multiplicador configurable** (x2.5 por defecto) sobre precios del API
- **Precios diferenciados por rol**:
  - Clientes: ven precios con IVA incluido
  - Asociados: 20% descuento + opción ver con/sin IVA
- **Toggle IVA** en menú de usuario para asociados
- **Precios tachados** mostrando descuento aplicado

#### Sistema de Favoritos
- **Agregar/quitar favoritos** desde cards y detalle de producto
- **Soporte usuarios anónimos** usando localStorage
- **Sincronización automática** al iniciar sesión
- **Contador en header** con badge numérico
- **Página dedicada** `/cuenta/favoritos` para gestión
- **Notificaciones toast** al agregar/quitar

#### Sistema de Traducciones
- **Base de datos de traducciones** dinámicas
- **Categorías**: general, products, categories, tags, etc.
- **Panel de administración** con CRUD completo
- **Autocompletado** en búsquedas de traducciones
- **Importación/exportación masiva** CSV
- **API endpoints** para uso en cliente
- **Cache** con TTL de 5 minutos

#### Panel de Administración
- **Dashboard** con métricas principales
- **Gestión de productos**:
  - Ocultar/mostrar productos individuales
  - Búsqueda por ItemCode con autocompletado
- **Configuración del sistema**:
  - Multiplicador de precios
  - Configuración de cache
  - Tarifas de asociados
- **Gestión de traducciones** completa
- **Acciones rápidas** en dashboard

#### UI/UX
- **Diseño premium** con colores #183a1d y #f0a04b
- **Tipografías**: Cormorant Infant + Inter
- **Componentes reutilizables** con shadcn/ui
- **Animaciones suaves** y transiciones
- **Banner deslizante** para asociados con mensajes rotativos
- **Sistema de notificaciones toast** global
- **Responsive** mobile-first

#### Integración API Nieuwkoop
- **Sistema híbrido**: BD local + API tiempo real
- **Endpoints integrados**:
  - `/articles`: catálogo de productos
  - `/stock`: información de inventario
  - `/images`: galería de productos
- **Cache inteligente** con TTL configurable
- **Logs detallados** de llamadas API
- **Manejo de errores** robusto

### 🚧 En Desarrollo / Pendiente

#### Sistema de Carrito y Checkout
- Carrito de compras persistente
- Proceso de checkout optimizado
- Integración con pasarelas de pago
- Gestión de direcciones de envío

#### Órdenes y Pedidos
- Historial de pedidos del usuario
- Estados de orden (pendiente, procesando, enviado, etc.)
- Tracking de envíos
- Facturas PDF

#### Blog y CMS
- Sistema de blog con categorías
- Editor WYSIWYG para contenido
- SEO optimizado para artículos
- Gestión de imágenes

#### Mejoras Planificadas
- Sistema de cupones y descuentos
- Programa de puntos/fidelización
- Chat en vivo / soporte
- Reviews y ratings de productos
- Wishlist compartibles
- Comparador de productos

## Estructura de Archivos Clave

### Configuración Principal
- `/app/layout.tsx` - Layout raíz con providers
- `/app/globals.css` - Estilos globales y animaciones
- `/lib/prisma.ts` - Cliente Prisma singleton
- `/lib/auth.ts` - Configuración NextAuth
- `/middleware.ts` - Protección de rutas

### Contextos Globales
- `/contexts/auth-context.tsx` - Estado de autenticación
- `/contexts/pricing-context.tsx` - Preferencias de precios/IVA
- `/contexts/toast-context.tsx` - Sistema de notificaciones

### Hooks Personalizados
- `/hooks/use-user-pricing.ts` - Lógica de precios por usuario
- `/hooks/use-favorites.ts` - Gestión de favoritos
- `/hooks/use-toast.ts` - Notificaciones toast

### Componentes Principales
- `/components/layouts/header.tsx` - Header con navegación
- `/components/products/product-card.tsx` - Card de producto
- `/components/ui/sliding-banner.tsx` - Banner para asociados
- `/components/ui/toast.tsx` - Componente de notificaciones

### API Routes Importantes
- `/api/auth/[...nextauth]` - Autenticación
- `/api/products` - CRUD productos
- `/api/favorites` - Gestión favoritos
- `/api/translations` - Sistema traducciones
- `/api/nieuwkoop/sync` - Sincronización con API

### Librerías de Integración
- `/lib/nieuwkoop/` - Cliente API y utilidades
- `/lib/translations/` - Sistema de traducciones
- `/lib/pricing.ts` - Cálculos de precios

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Linting y formateo
npm run lint
npm run lint:fix

# Base de datos
npx prisma db push
npx prisma studio
npx prisma generate

# Build
npm run build
npm run start

# Sincronización API
curl -X POST http://localhost:3000/api/nieuwkoop/sync
```

## Variables de Entorno Críticas

```env
DATABASE_URL          # MongoDB connection string
NEXTAUTH_URL         # URL de la aplicación
NEXTAUTH_SECRET      # Secret para JWT
NIEUWKOOP_API_KEY    # API key de Nieuwkoop
NIEUWKOOP_API_URL    # Base URL del API
```

## Consideraciones Técnicas

### Next.js 15 - Breaking Changes
- Params dinámicos ahora son Promise: `await params`
- Usar `use client` para componentes interactivos
- App Router por defecto

### Prisma con MongoDB
- IDs deben ser `@db.ObjectId`
- Relaciones requieren IDs de referencia
- Índices únicos compuestos con `@@unique`

### Sistema de Precios
- Precios base vienen sin IVA del API
- Multiplicador se aplica antes del IVA
- Descuentos se calculan sobre precio base
- IVA (21%) se aplica al final

### Performance
- Imágenes optimizadas con Next/Image
- Cache de traducciones 5 minutos
- Lazy loading en catálogo
- Estado en localStorage para anónimos

## Debugging y Troubleshooting

### Errores Comunes

1. **"PrismaClient is unable to run in browser"**
   - Usar API routes para operaciones de BD
   - No importar Prisma en componentes cliente

2. **"Port 3000 already in use"**
   - `lsof -ti:3000 | xargs kill -9`
   - Reiniciar servidor

3. **401 Unauthorized en API**
   - Verificar sesión con `/api/auth/session`
   - Comprobar rol de usuario en BD

4. **Traducciones no se aplican**
   - Limpiar cache: `/api/translations/clear-cache`
   - Verificar categoría correcta

### Logs y Debug
- API Nieuwkoop: prefijo `🌐` en consola
- Errores de auth: revisar `/api/auth/session`
- Debug panel: `/api/users/debug` (solo admins)

## Mejores Prácticas del Proyecto

1. **Siempre usar TypeScript** estricto
2. **Componentes pequeños y reutilizables**
3. **Server Components por defecto**, Client solo cuando necesario
4. **Manejo de errores** con try/catch y mensajes usuario
5. **Logs descriptivos** para debugging
6. **Cache inteligente** para reducir llamadas API
7. **Validación de datos** en cliente y servidor
8. **SEO optimizado** con metadatos dinámicos

## Contacto y Soporte

- **Cliente**: Bloom Marbella
- **Repositorio**: https://github.com/yosnap/bloommarbella-next
- **API Docs**: https://developer.nieuwkoop-europe.io/

---

*Última actualización: Enero 2025*