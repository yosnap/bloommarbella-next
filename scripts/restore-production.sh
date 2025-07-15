#!/bin/bash

echo "🔄 Restaurando base de datos en producción..."

# Verificar que existe el backup
if [ ! -d "./backup/bloommarbella" ]; then
    echo "❌ No se encontró el backup en ./backup/bloommarbella"
    exit 1
fi

# Restaurar a producción
mongorestore --host 31.97.79.180:27017 \
  --db bloommarbella \
  --username bloom \
  --password "Bloom.5050!" \
  --authenticationDatabase admin \
  --drop \
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