# Manual de Usuario - Nieuwkoop Europe API Client

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Configuración Inicial](#configuración-inicial)
4. [Funcionalidades Principales](#funcionalidades-principales)
5. [Guía de Uso](#guía-de-uso)
6. [Solución de Problemas](#solución-de-problemas)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

## Introducción

Bienvenido al manual de usuario de Nieuwkoop Europe API Client. Esta aplicación le permite gestionar el catálogo de productos, inventario y pedidos de Nieuwkoop Europe de manera eficiente y sencilla.

## Instalación

### Requisitos Previos
- Node.js 18.17 o superior instalado
- Git para clonar el repositorio
- Credenciales del API de Nieuwkoop Europe

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd nieuwkoop-europe-client
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```

4. **Editar el archivo .env.local con sus credenciales**
   ```
   NEXT_PUBLIC_API_URL=https://customerapi.nieuwkoop-europe.com
   API_USERNAME=su_usuario
   API_PASSWORD=su_contraseña
   ```

5. **Iniciar la aplicación en desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

6. **Acceder a la aplicación**
   Abrir navegador en: http://localhost:3000

## Configuración Inicial

### 1. Credenciales del API
Para obtener credenciales de producción:
1. Evalúe primero el Playground con las credenciales de prueba
2. Acceda a: https://www.nieuwkoop-europe.com/en/account/request-api-access-en
3. Complete el formulario de solicitud
4. Espere la aprobación y reciba sus credenciales

### 2. Configuración de la Aplicación
- **Idioma**: Configurable en Ajustes > Idioma
- **Moneda**: EUR (predeterminado)
- **Zona horaria**: CET/CEST
- **Frecuencia de actualización**: Configurable (recomendado: cada 30 minutos)

## Funcionalidades Principales

### 📋 Catálogo de Productos

#### Navegación
- **Búsqueda**: Use la barra superior para buscar por nombre, código o descripción
- **Filtros**: Panel lateral con filtros por:
  - Categorías
  - Material
  - Tamaño
  - Precio
  - Disponibilidad
  - Ubicación de envío

#### Vista de Producto
- Click en cualquier producto para ver detalles
- Información disponible:
  - Imágenes en alta resolución
  - Descripción completa
  - Especificaciones técnicas
  - Precio actualizado
  - Stock disponible
  - Tags y características

### 📦 Gestión de Inventario

#### Panel de Control
- Vista general del stock total
- Productos con bajo inventario
- Últimas actualizaciones
- Exportar datos a Excel/CSV

#### Alertas de Stock
- Configure alertas para productos específicos
- Notificaciones cuando el stock baje del mínimo
- Reportes automáticos por email

### 💬 Sistema de Contacto por WhatsApp

#### Cómo Funciona
1. Navegue al catálogo de productos
2. Busque el producto que le interese
3. Haga clic en el botón verde de WhatsApp en cada producto
4. Se abrirá WhatsApp con un mensaje pre-formateado que incluye:
   - Nombre del producto
   - Enlace directo al producto
   - Mensaje personalizado de consulta

#### Ventajas del Sistema
- **Comunicación directa**: Contacte inmediatamente con el equipo de ventas
- **Información contextual**: El mensaje incluye automáticamente los datos del producto
- **Proceso simplificado**: Sin necesidad de carritos complejos
- **Atención personalizada**: Reciba asesoramiento específico para cada producto

### 🛒 Sistema de Pedidos

#### Crear Pedido
1. Navegue al catálogo o use la búsqueda rápida
2. Añada productos al carrito
3. Revise cantidades y precios
4. Complete información de envío
5. Confirme el pedido

#### Gestión de Pedidos
- **Estados**: Pendiente, Procesando, Enviado, Entregado
- **Historial**: Acceso completo a pedidos anteriores
- **Duplicar**: Opción para repetir pedidos frecuentes
- **Exportar**: Descargue facturas y albaranes

### 📊 Reportes y Análisis

#### Tipos de Reportes
- Ventas por período
- Productos más vendidos
- Análisis de inventario
- Tendencias de precios

#### Exportación
- Formatos: PDF, Excel, CSV
- Programación automática
- Envío por email

## Guía de Uso

### Flujo de Trabajo Típico

1. **Inicio de Sesión**
   - Acceda con sus credenciales
   - El sistema recordará su sesión (opcional)

2. **Revisión Diaria**
   - Verifique alertas de stock
   - Revise pedidos pendientes
   - Actualice inventario si es necesario

3. **Gestión de Pedidos**
   - Procese nuevos pedidos
   - Actualice estados
   - Genere documentación

4. **Mantenimiento**
   - Actualice información de productos
   - Ajuste precios si tiene permisos
   - Gestione imágenes y descripciones

### Atajos de Teclado
- `Ctrl/Cmd + K`: Búsqueda rápida
- `Ctrl/Cmd + N`: Nuevo pedido
- `Ctrl/Cmd + P`: Imprimir vista actual
- `Esc`: Cerrar modal/diálogo

### Tips de Productividad
1. Use favoritos para productos frecuentes
2. Configure vistas personalizadas
3. Aproveche los filtros guardados
4. Utilice la búsqueda avanzada con operadores

## Solución de Problemas

### Problemas Comunes

#### Error de Conexión al API
- Verifique credenciales en .env.local
- Compruebe conexión a internet
- Confirme que el API esté operativo

#### Datos no se Actualizan
- Limpie caché del navegador
- Fuerce actualización con F5
- Verifique configuración de sincronización

#### Imágenes no Cargan
- Compruebe bloqueadores de anuncios
- Verifique permisos de CORS
- Intente con otro navegador

### Logs y Depuración
Los logs se encuentran en:
- Cliente: Consola del navegador (F12)
- Servidor: Terminal donde ejecuta la aplicación
- Archivos: `/logs` (si está configurado)

## Preguntas Frecuentes

### General

**¿Con qué frecuencia se actualizan los datos?**
Los datos se sincronizan según su configuración, por defecto cada 30 minutos.

**¿Puedo trabajar sin conexión?**
La aplicación mantiene un caché local, pero requiere conexión para sincronizar cambios.

**¿Hay límite de usuarios simultáneos?**
Depende de su plan con Nieuwkoop Europe.

### Pedidos

**¿Puedo cancelar un pedido enviado?**
Contacte directamente con Nieuwkoop Europe para cancelaciones.

**¿Cómo se calculan los precios?**
Los precios se obtienen en tiempo real del API según su acuerdo comercial.

### Técnico

**¿Es compatible con dispositivos móviles?**
Sí, la aplicación es totalmente responsive.

**¿Qué navegadores son compatibles?**
Chrome, Firefox, Safari y Edge en sus versiones más recientes.

**¿Puedo integrar con mi ERP?**
Sí, mediante la API REST disponible. Consulte DEVELOPMENT.md.

## Soporte

### Canales de Ayuda
- **Documentación técnica**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Registro de cambios**: [CHANGELOG.md](./CHANGELOG.md)
- **Soporte Nieuwkoop API**: developer@nieuwkoop-europe.com

### Reportar Problemas
1. Verifique si el problema está documentado
2. Recopile información relevante (logs, capturas)
3. Contacte al equipo de soporte

---

*Última actualización: Enero 2025*