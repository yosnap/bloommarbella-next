# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-01-18

### 🎯 Mejoras Completas del Catálogo y Experiencia de Usuario

#### ⚡ Optimizaciones de Rendimiento
- ✅ **React Query v5**: Implementación completa con integración de cache del admin
- ✅ **Cache diferenciado**: Configuración específica por tipo de datos
  - Precios: 2 minutos (críticos)
  - Categorías: 10 minutos (estables)
  - Catálogo general: 30 minutos (configurable)
- ✅ **Skeleton loading**: Carga visual completa durante obtención de datos
- ✅ **Página estática**: Solo recarga la lista de productos, mantiene UI intacta

#### 🔧 Correcciones Críticas de Paginación
- ✅ **Fix límite hardcodeado**: Eliminado límite de 20 productos por página
- ✅ **Fix cálculo de total**: Corrección en count real de productos (18,317 productos)
- ✅ **Paginación funcional**: 1,145 páginas correctas con navegación completa
- ✅ **Productos por página**: Cambiado por defecto de 16 a 15 productos

#### 🎨 Mejoras de Interfaz de Usuario
- ✅ **Filtros activos mejorados**: Visualización completa con códigos de color
- ✅ **Eliminación individual**: Botón × en cada filtro para eliminación selectiva
- ✅ **Botón admin**: Visible en header para usuarios administradores
- ✅ **Sidebar limpio**: Eliminado botón "Clear All" innecesario

#### 🔗 URLs Amigables Completas
- ✅ **Filtros básicos**: URLs semánticas (`/catalogo/marca/lechuza`)
- ✅ **Filtros avanzados**: Query parameters completos en URL
- ✅ **Sincronización bidireccional**: Estado ↔ URL en tiempo real
- ✅ **Navegación del navegador**: Botones atrás/adelante funcionan correctamente
- ✅ **URLs compartibles**: Marcadores y enlaces mantienen estado completo

#### 🎛️ Sliders y Filtros Avanzados
- ✅ **Inputs numéricos**: Campos editables en sliders de precio/medidas
- ✅ **Filtrado al soltar**: Consultas solo cuando se termina de deslizar
- ✅ **Optimización móvil**: Soporte completo para dispositivos táctiles
- ✅ **Validación inteligente**: Valores mantenidos dentro de rangos

#### 🏢 Panel de Administración Mejorado
- ✅ **Cache configurable**: Nuevos campos para cache específico por tipo
- ✅ **Tiempos diferenciados**: Configuración independiente para precios y categorías
- ✅ **Interfaz mejorada**: Controles organizados en grid de 3 columnas

#### 🔄 Parámetros de URL Implementados
```typescript
// Filtros básicos
?brands=marca1,marca2
?categories=cat1,cat2
?search=término

// Filtros avanzados  
?price_min=50&price_max=200
?height_min=10&height_max=50
?in_stock=true&location=indoor
?colors=black,white&planting_system=soil

// Paginación y orden
?page=2&sort=price&order=desc&per_page=15
```

#### 🛠️ Mejoras Técnicas
- ✅ **Hooks optimizados**: `useProductsQuery` con cache inteligente
- ✅ **Prefetching**: Precarga automática de siguiente página
- ✅ **Placeholder data**: Transiciones suaves entre filtros
- ✅ **TypeScript**: Tipado completo de URLs y filtros
- ✅ **Memoización**: Prevención de re-renders innecesarios

#### 📊 Estadísticas del Catálogo
- **Total productos activos**: 18,317
- **Páginas totales**: 1,145 (con 15 productos por página)
- **Filtros disponibles**: 8 tipos diferentes con eliminación individual
- **URLs amigables**: Soporte completo para SEO y compartir

### 🐛 Correcciones
- ✅ **Fix hooks order**: Corrección de orden de React hooks
- ✅ **Fix skeleton infinito**: Resolución de bucle de carga
- ✅ **Fix filtros invisibles**: Filtros activos ahora visibles correctamente
- ✅ **Fix cache config**: Integración completa con configuración del admin

## [1.0.1] - 2025-01-17

### 🔧 Correcciones Críticas y Mejoras de Estabilidad

#### ⚡ Optimizaciones de Base de Datos
- ✅ **Migración a MongoDB nativo**: Reemplazadas operaciones Prisma problemáticas con driver nativo de MongoDB
- ✅ **Compatibilidad híbrida**: Soporte para MongoDB standalone (desarrollo) y replica set (producción)
- ✅ **Migración automática**: Corrección automática de campos null en createdAt/updatedAt (Error P2032)
- ✅ **Eliminación de dependencias de transacciones** para operaciones simples

#### 🔄 Sistema de Sincronización Avanzado
- ✅ **Cron configurable desde admin**: Intervalos (hourly, daily, weekly, monthly, custom cron)
- ✅ **Configuración de lotes**: Prevención de sobrecarga del servidor con batch processing
- ✅ **Parámetro sysmodified**: Sincronización incremental usando fecha de última actualización
- ✅ **Interfaz de administración completa** para gestión de configuración
- ✅ **Logs detallados** con progreso y estadísticas en tiempo real

#### 💾 Sistema de Backup y Restauración
- ✅ **Backup completo de base de datos** con selección de colecciones
- ✅ **Backup de ajustes del sistema** por separado
- ✅ **Restauración selectiva** con validación de integridad de archivos
- ✅ **Prevención de errores de usuario**: Validación de tipo de archivo antes de restaurar
- ✅ **Logs de backup**: Registro completo de operaciones de backup/restore

#### 🚀 Mejoras de Despliegue
- ✅ **Dockerfile optimizado**: Configuración específica para Next.js standalone mode en EasyPanel
- ✅ **Corrección de servidor**: `next start` → `node server.js` para compatibilidad con contenedores
- ✅ **Configuración MongoDB en producción**: Conexión optimizada para servicios en la nube
- ✅ **Logo como favicon**: Configuración del logo de Bloom Marbella como favicon del sitio

#### 🐛 Correcciones de Errores
- ✅ **Fix P2031**: Eliminación de dependencia de replica set para operaciones básicas
- ✅ **Fix P2032**: Manejo automático de campos null en timestamps
- ✅ **Fix 400 errors**: Debug logging mejorado en endpoints de sincronización
- ✅ **Fix sync-config**: Validación mejorada de datos de configuración
- ✅ **Fix backup validation**: Prevención de mezcla entre archivos de BD y ajustes

#### 🛠️ Mejoras Técnicas
- ✅ **Scripts de producción**: `create-admin-production.js` para setup inicial
- ✅ **AdminHeader**: Agregado a páginas de administración faltantes
- ✅ **Interfaz mejorada**: Corrección de ancho de página y visibilidad de controles
- ✅ **Validación robusta**: Checks de integridad en todas las operaciones críticas

#### 📋 Endpoints Migrados a MongoDB Nativo
- ✅ `/api/admin/sync-config` - Configuración de sincronización
- ✅ `/api/admin/sync-execute` - Ejecución de sincronización
- ✅ `/api/admin/backup/settings/restore` - Restauración de ajustes

## [1.1.0] - 2025-01-12

### ✨ Nueva Funcionalidad: Sistema de WhatsApp

#### 💬 Sistema de Contacto por WhatsApp
- ✅ Botón de WhatsApp reemplazando temporalmente el carrito de compras
- ✅ Mensaje pre-formateado automático con información del producto
- ✅ Configuración completa desde el panel de administración:
  - Habilitar/deshabilitar funcionalidad
  - Número de WhatsApp de contacto
  - Nombre de la persona de contacto
  - Plantilla personalizable del mensaje
- ✅ Integración con WhatsApp Web (wa.me)
- ✅ Validación de configuración en el backend
- ✅ API endpoint público para obtener configuración
- ✅ Utilidades para generación de mensajes y URLs

#### 🛠️ Mejoras Técnicas
- ✅ Nuevo archivo `/lib/whatsapp.ts` con utilidades especializadas
- ✅ API endpoint `/api/whatsapp-config` para configuración pública
- ✅ Validación de números de teléfono y plantillas de mensaje
- ✅ Manejo de variables dinámicas en plantillas: `{contactName}`, `{productName}`, `{productUrl}`

#### 🐛 Correcciones
- ✅ Fix: Favoritos para usuarios anónimos ahora cargan correctamente
- ✅ Fix: Eliminados errores 401 en ProductCard para usuarios no autenticados
- ✅ Fix: Middleware actualizado para permitir acceso a favoritos sin login

## [1.0.0] - 2025-01-11

### 🎉 Lanzamiento Inicial - Versión Estable

#### ✨ Funcionalidades Principales Implementadas

##### Autenticación y Usuarios
- ✅ Sistema de autenticación completo con NextAuth.js
- ✅ Roles de usuario: CUSTOMER y ASSOCIATE  
- ✅ Registro con aprobación manual para asociados
- ✅ Páginas de login y registro personalizadas
- ✅ Gestión de sesiones con MongoDB

##### Catálogo de Productos  
- ✅ Integración completa con API Nieuwkoop Europe
- ✅ Listado con paginación configurable (12, 16, 24, 36 items)
- ✅ Ordenamiento múltiple: alfabético, precio, fecha, ofertas
- ✅ Filtros por categorías jerárquicas
- ✅ Vista grid/lista intercambiable
- ✅ Búsqueda por nombre de producto
- ✅ Sincronización en tiempo real del stock

##### Sistema de Precios Avanzado
- ✅ Multiplicador configurable sobre precios base (x2.5 default)
- ✅ Precios diferenciados por rol de usuario
- ✅ Toggle IVA para usuarios asociados
- ✅ Visualización de descuentos con precios tachados
- ✅ Descuento del 20% para asociados

##### Sistema de Favoritos
- ✅ Agregar/quitar productos de favoritos
- ✅ Soporte completo para usuarios anónimos con localStorage
- ✅ Sincronización automática al iniciar sesión
- ✅ Contador en header con badge numérico
- ✅ Página dedicada de gestión de favoritos
- ✅ Notificaciones toast al interactuar

##### Sistema de Traducciones Dinámicas
- ✅ Base de datos de traducciones por categorías
- ✅ Panel de administración CRUD completo
- ✅ Autocompletado inteligente en búsquedas
- ✅ Importación/exportación masiva en CSV
- ✅ API endpoints para uso en cliente
- ✅ Cache con TTL de 5 minutos

##### Panel de Administración
- ✅ Dashboard con métricas principales
- ✅ Gestión de visibilidad de productos
- ✅ Búsqueda por ItemCode con autocompletado
- ✅ Configuración del multiplicador de precios
- ✅ Gestión completa de traducciones
- ✅ Configuración de cache y sistema
- ✅ Acciones rápidas en dashboard

##### Interfaz de Usuario Premium
- ✅ Diseño elegante con paleta de colores personalizada (#183a1d, #f0a04b)
- ✅ Tipografías Cormorant Infant + Inter
- ✅ Componentes reutilizables con shadcn/ui
- ✅ Animaciones suaves y transiciones
- ✅ Banner deslizante informativo para asociados
- ✅ Sistema global de notificaciones toast
- ✅ Diseño responsive mobile-first

#### 🛠️ Stack Tecnológico

- **Framework**: Next.js 15.3.5 con App Router
- **Lenguaje**: TypeScript 5.x
- **Base de Datos**: MongoDB con Prisma ORM
- **Estilos**: Tailwind CSS + shadcn/ui
- **Autenticación**: NextAuth.js v4
- **Iconos**: Lucide React
- **Optimización de Imágenes**: Next/Image

#### 🐛 Correcciones Importantes

- Fix: Compatibilidad completa con Next.js 15 (params como Promise)
- Fix: Traducciones de características usando API routes
- Fix: Gestión de múltiples instancias del servidor
- Fix: Sistema de precios para diferentes roles
- Fix: Autenticación y autorización de rutas
- Fix: PrismaClient en entorno de navegador

#### 📝 Documentación

- README.md completo con instalación y configuración
- CLAUDE.md con documentación técnica detallada
- CHANGELOG.md con historial de cambios
- Estructura de proyecto bien organizada
- Comentarios en código para funciones críticas

## [0.9.0] - 2025-01-10

### Añadido
- Sistema de favoritos completo con localStorage
- Notificaciones toast globales
- Banner deslizante para asociados
- Debug panel para desarrollo
- Traducciones dinámicas desde BD

### Mejorado
- Rendimiento del catálogo con lazy loading
- Sistema de cache optimizado
- Manejo de errores mejorado

## [0.8.0] - 2025-01-09

### Añadido
- Panel de administración funcional
- Gestión de productos y visibilidad
- Sistema de traducciones con autocompletado
- Configuración de multiplicador de precios

### Actualizado
- Migración a Prisma ORM desde Mongoose
- Mejoras en la UI del admin

## [0.7.0] - 2025-01-08

### Añadido
- Sistema de precios diferenciados por rol
- Toggle IVA para asociados
- Precios tachados con descuentos
- Integración con API de stock en tiempo real

## [0.6.0] - 2025-01-07

### Añadido
- Catálogo de productos completo
- Filtros y ordenamiento avanzado
- Paginación configurable
- Vista grid/lista

## [0.5.0] - 2025-01-06

### Añadido
- Sistema de autenticación con NextAuth.js
- Roles de usuario (CUSTOMER, ASSOCIATE)
- Páginas de login y registro

## [0.4.0] - 2025-01-05

### Añadido
- Integración inicial con API Nieuwkoop
- Modelos de datos con TypeScript
- Estructura base del proyecto

## [0.3.0] - 2025-01-04

### Configurado
- Proyecto Next.js 15 con App Router
- TypeScript y ESLint
- Tailwind CSS y shadcn/ui

## [0.2.0] - 2025-01-03

### Añadido
- Definición de requerimientos
- Documentación inicial
- Planificación del proyecto

## [0.1.0] - 2025-01-02

### Iniciado
- Creación del repositorio
- Estructura inicial del proyecto
- Documentación base

---

## Roadmap Futuro

### 📋 Próximas Funcionalidades

- [ ] Sistema de carrito de compras persistente
- [ ] Proceso de checkout completo
- [ ] Integración con pasarelas de pago
- [ ] Historial y tracking de pedidos
- [ ] Sistema de blog/CMS
- [ ] Reviews y ratings de productos
- [ ] Sistema de cupones y descuentos
- [ ] Chat en vivo/soporte
- [ ] PWA (Progressive Web App)
- [ ] Multiidioma completo

---

*Para ver cambios detallados entre versiones, consulte los commits en el [repositorio](https://github.com/yosnap/bloommarbella-next).*