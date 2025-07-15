# Guía de Deploy en EasyPanel

## 📋 Pre-requisitos

1. **Repositorio en GitHub** con el código actualizado
2. **Cuenta en EasyPanel** 
3. **Base de datos MongoDB** (Atlas recomendado)

## 🚀 Pasos para Deploy

### 1. Configurar MongoDB

**Opción A: MongoDB Atlas (Recomendado)**
- Crear cluster en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Obtener connection string
- Ejemplo: `mongodb+srv://user:password@cluster.mongodb.net/bloommarbella`

**Opción B: MongoDB en EasyPanel**
- Crear servicio MongoDB en EasyPanel
- Configurar usuario y contraseña
- Obtener connection string interno

### 2. Configurar aplicación en EasyPanel

1. **Crear nueva aplicación**:
   - Source: GitHub Repository
   - Repository: `tu-usuario/bloommarbella-nextjs`
   - Branch: `main`

2. **Configurar Build**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Node Version: `18.x`

3. **Variables de entorno**:
   ```bash
   NODE_ENV=production
   NEXTAUTH_URL=https://tu-dominio.com
   NEXTAUTH_SECRET=genera-un-secret-muy-seguro-aqui
   DATABASE_URL=mongodb://connection-string
   NIEUWKOOP_API_URL=https://customerapi.nieuwkoop-europe.com
   NIEUWKOOP_API_USER=Ground131880
   NIEUWKOOP_API_PASSWORD=A18A65A2E3
   NIEUWKOOP_API_MODE=production
   NEXT_TELEMETRY_DISABLED=1
   ```

### 3. Configurar dominio

1. **Dominio personalizado**:
   - Agregar dominio en EasyPanel
   - Configurar DNS records
   - Actualizar `NEXTAUTH_URL` con el dominio real

2. **SSL/TLS**:
   - EasyPanel configura SSL automáticamente
   - Verificar que `https://` funciona correctamente

### 4. Post-deployment

1. **Acceder al panel de administración**:
   - Ve a `https://tu-dominio.com/admin`
   - Crea usuario administrador si es necesario

2. **Sincronizar productos**:
   - Ejecutar sincronización completa
   - Verificar que los productos se cargan correctamente

3. **Verificar funcionalidad**:
   - Registro de usuarios
   - Sistema de favoritos
   - Catálogo de productos
   - Autenticación

## 🔧 Comandos útiles

```bash
# Generar secret para NextAuth
openssl rand -base64 32

# Verificar conexión MongoDB
mongosh "mongodb://connection-string"

# Logs de la aplicación
# (Disponible en EasyPanel dashboard)
```

## 🐛 Troubleshooting

### Error de conexión a MongoDB
- Verificar `DATABASE_URL`
- Comprobar whitelist IP en Atlas
- Verificar usuario/contraseña

### Error 500 en producción
- Revisar logs en EasyPanel
- Verificar todas las variables de entorno
- Comprobar que Prisma está generado correctamente

### NextAuth no funciona
- Verificar `NEXTAUTH_URL` coincide con dominio
- Verificar `NEXTAUTH_SECRET` está configurado
- Comprobar que HTTPS está activo

## 📊 Monitoreo

- **Logs**: Disponibles en EasyPanel dashboard
- **Métricas**: CPU, memoria, requests
- **Uptime**: Monitoreo automático de EasyPanel
- **Errores**: Revisar logs de aplicación y base de datos

## 🔒 Seguridad

- Usar secrets seguros para `NEXTAUTH_SECRET`
- Configurar IP whitelist en MongoDB Atlas
- Mantener credenciales API seguras
- Usar HTTPS para todas las comunicaciones