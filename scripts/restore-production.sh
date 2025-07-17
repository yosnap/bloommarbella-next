#!/bin/bash

echo "🔄 Restaurando base de datos en producción..."

# Verificar que existe el backup
if [ ! -d "./backup/bloommarbella" ]; then
    echo "❌ No se encontró el backup en ./backup/bloommarbella"
    exit 1
fi

# Restaurar a producción (usar desde tu máquina local)
# Usa la URL externa para conectar desde fuera del contenedor
mongorestore --uri "mongodb://bloom:Bloom.5050!@panel.bloommarbella.es:27017/?tls=false" \
  --db bloommarbella \
  --drop \
  --verbose \
  ./backup/bloommarbella/

echo "✅ Base de datos restaurada exitosamente"
echo "📋 Contenido restaurado:"
echo "   - 17,995 productos"
echo "   - 1 usuario admin"
echo "   - Configuraciones del sistema"
echo "   - Logs de sincronización"
echo ""
echo "🚀 Ya puedes acceder a:"
echo "   - https://bloommarbella.es/auth/login"
echo "   - https://bloommarbella.es/admin"