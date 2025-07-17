# Sistema de Backup y Restauración - Bloom Marbella

## Descripción General

El sistema de backup y restauración permite crear copias de seguridad completas de la base de datos y de los ajustes del sistema, así como restaurarlas cuando sea necesario.

## Características Principales

### 🗃️ Backup de Base de Datos Completa
- **Incluye**: Productos, usuarios, configuraciones, traducciones, categorías, logs y favoritos
- **Formato**: JSON comprimido con metadatos
- **Seguridad**: Excluye passwords por seguridad
- **Descarga**: Archivo descargable desde la interfaz web

### ⚙️ Backup de Ajustes del Sistema
- **Incluye**: Solo configuraciones del sistema
- **Automático**: Nuevas configuraciones se agregan automáticamente
- **Selectivo**: Solo ajustes permitidos son respaldados
- **Portátil**: Fácil de transferir entre entornos

### 🔄 Restauración Inteligente
- **Validación**: Verifica formato y estructura del backup
- **Seguridad**: Preserva usuario admin actual
- **Logs**: Registra cada operación de restauración
- **Parcial**: Permite restauración parcial con reportes de errores

## Acceso al Sistema

### Interfaz Web
- **URL**: `/admin/backup`
- **Acceso**: Solo administradores
- **Funciones**: Backup, restauración e historial

### API Endpoints
- `POST /api/admin/backup/database` - Crear backup completo
- `POST /api/admin/backup/database/restore` - Restaurar base de datos
- `POST /api/admin/backup/settings` - Exportar ajustes
- `POST /api/admin/backup/settings/restore` - Importar ajustes

## Uso Manual

### Crear Backup Completo
1. Ir a `/admin/backup`
2. Pestaña "Base de Datos"
3. Hacer clic en "Descargar Backup Completo"
4. Guardar el archivo `.json` en lugar seguro

### Restaurar Base de Datos
1. Ir a `/admin/backup`
2. Pestaña "Base de Datos"
3. Hacer clic en "Seleccionar Archivo de Backup"
4. Elegir archivo `.json` del backup
5. Confirmar restauración

### Exportar Ajustes
1. Ir a `/admin/backup`
2. Pestaña "Ajustes del Sistema"
3. Hacer clic en "Descargar Ajustes"
4. Guardar archivo de configuración

### Importar Ajustes
1. Ir a `/admin/backup`
2. Pestaña "Ajustes del Sistema"
3. Hacer clic en "Seleccionar Archivo de Ajustes"
4. Elegir archivo `.json` de ajustes
5. Confirmar importación

## Uso Automático

### Script de Backup Automático
```bash
# Ejecutar backup automático
npm run backup-auto

# O directamente con node
node scripts/auto-backup.js
```

### Programación con Cron
```bash
# Backup diario a las 2:00 AM
0 2 * * * cd /path/to/project && npm run backup-auto

# Backup cada 6 horas
0 */6 * * * cd /path/to/project && npm run backup-auto
```

### Características del Backup Automático
- **Limpieza**: Elimina backups de más de 7 días
- **Ubicación**: Guarda en `/backups/` del proyecto
- **Logs**: Registra operaciones en la base de datos
- **Nombres**: Usa timestamp para nombres únicos

## Ajustes Incluidos en Backup

### Configuraciones Generales
- `priceMultiplier` - Multiplicador de precios
- `associateDiscount` - Descuento para asociados
- `defaultDeliveryTime` - Tiempo de entrega predeterminado
- `minStockAlert` - Alerta de stock mínimo
- `maxStockAlert` - Alerta de stock máximo
- `enableCache` - Activar caché
- `cacheTime` - Tiempo de caché
- `newBadgeDays` - Días para badge "nuevo"

### Configuraciones de Comunicación
- `whatsappEnabled` - WhatsApp activado
- `whatsappNumber` - Número de WhatsApp
- `whatsappContactName` - Nombre de contacto

### Configuraciones de Sincronización
- `sync_schedule` - Horarios de sincronización
- `sync_batch_settings` - Configuración de lotes
- `sync_settings` - Ajustes generales de sync

### Configuraciones Futuras
*Cualquier nueva configuración agregada al sistema será incluida automáticamente en el backup de ajustes.*

## Estructura de Archivos de Backup

### Backup Completo
```json
{
  "version": "1.0",
  "timestamp": "2025-01-17T12:00:00.000Z",
  "collections": {
    "products": { "count": 150, "data": [...] },
    "users": { "count": 25, "data": [...] },
    "configurations": { "count": 12, "data": [...] },
    "translations": { "count": 500, "data": [...] },
    "categoryVisibility": { "count": 30, "data": [...] },
    "syncLogs": { "count": 100, "data": [...] },
    "favorites": { "count": 75, "data": [...] }
  },
  "metadata": {
    "createdBy": "admin@example.com",
    "totalRecords": 892
  }
}
```

### Backup de Ajustes
```json
{
  "version": "1.0",
  "timestamp": "2025-01-17T12:00:00.000Z",
  "type": "settings",
  "settings": {
    "priceMultiplier": {
      "value": 2.5,
      "description": "Multiplicador de precios"
    },
    "associateDiscount": {
      "value": 0.2,
      "description": "Descuento para asociados"
    }
  },
  "metadata": {
    "createdBy": "admin@example.com",
    "totalSettings": 12
  }
}
```

## Seguridad

### Protecciones Implementadas
- **Autenticación**: Solo administradores pueden acceder
- **Validación**: Verifica formato y estructura de archivos
- **Logs**: Registra todas las operaciones
- **Preservación**: Mantiene usuario admin actual en restauraciones
- **Exclusión**: No incluye passwords en backups

### Recomendaciones
- Guarda backups en ubicación segura
- Programa backups automáticos regulares
- Verifica integridad de backups periódicamente
- Usa conexiones seguras para transferir archivos

## Monitoreo

### Logs del Sistema
Todas las operaciones de backup y restauración se registran en la tabla `syncLog`:
- **Tipo**: `backup-database`, `backup-settings`, `restore-database`, `restore-settings`
- **Estado**: `success`, `error`, `partial`
- **Metadatos**: Detalles específicos de cada operación

### Verificación de Backups
```bash
# Verificar backups recientes
ls -la backups/

# Ver logs de backup en la base de datos
# Consultar tabla syncLog con type LIKE 'backup%'
```

## Troubleshooting

### Problemas Comunes

**Error: "Formato de backup inválido"**
- Verificar que el archivo sea un JSON válido
- Comprobar que tenga la estructura correcta
- Asegurar que sea un backup generado por el sistema

**Error: "No se pudo restaurar backup"**
- Verificar permisos de base de datos
- Comprobar espacio en disco
- Revisar logs del sistema para detalles

**Backup incompleto**
- Verificar conexión a base de datos
- Comprobar que todas las tablas existan
- Revisar logs de errores específicos

### Recuperación de Emergencia

1. **Backup corrupto**: Usar backup anterior más reciente
2. **Fallo de restauración**: Verificar integridad de BD antes de reintentar
3. **Pérdida de datos**: Contactar soporte técnico con logs detallados

## Mantenimiento

### Tareas Regulares
- Verificar que backups automáticos funcionen
- Limpiar backups antiguos manualmente si es necesario
- Probar restauración en entorno de pruebas
- Actualizar documentación con nuevas configuraciones

### Ampliación del Sistema
Para agregar nuevas configuraciones al backup de ajustes:
1. Agregar la clave en el array `SETTINGS_KEYS` en `/api/admin/backup/settings/route.ts`
2. La nueva configuración se incluirá automáticamente en futuros backups

---

**Nota**: Este sistema está diseñado para ser extensible. Cualquier nueva funcionalidad de configuración que se agregue al sistema será automáticamente incluida en los backups de ajustes.