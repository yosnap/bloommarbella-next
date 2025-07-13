# Configurar MongoDB como Replica Set en VPS

## Pasos para configurar MongoDB como replica set

### 1. Conectar al VPS por SSH
```bash
ssh usuario@31.97.79.180
```

### 2. Editar configuración de MongoDB
```bash
sudo nano /etc/mongod.conf
```

### 3. Agregar configuración de replica set
Busca la sección `replication` y modifícala (o agrégala si no existe):

```yaml
replication:
  replSetName: "rs0"
```

### 4. Reiniciar MongoDB
```bash
sudo systemctl restart mongod
```

### 5. Inicializar el replica set
Conectar a MongoDB:
```bash
mongosh
```

O si usas mongo shell clásico:
```bash
mongo
```

Luego ejecutar:
```javascript
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})
```

### 6. Verificar el estado
```javascript
rs.status()
```

Deberías ver que el miembro está en estado "PRIMARY".

### 7. Salir de mongo shell
```javascript
exit
```

## Configuración de usuario (si es necesario)

Si necesitas recrear el usuario después de configurar el replica set:

```javascript
use admin
db.createUser({
  user: "bloom",
  pwd: "Bloom.5050!",
  roles: [
    { role: "readWrite", db: "bloommarbella" },
    { role: "dbAdmin", db: "bloommarbella" }
  ]
})
```

## Actualizar connection string

Una vez configurado, tu connection string en `.env` debería funcionar:
```
DATABASE_URL="mongodb://bloom:Bloom.5050!@31.97.79.180:27017/bloommarbella?authSource=admin&tls=false"
```

O si necesitas especificar el replica set:
```
DATABASE_URL="mongodb://bloom:Bloom.5050!@31.97.79.180:27017/bloommarbella?authSource=admin&replicaSet=rs0&tls=false"
```

## Troubleshooting

### Si MongoDB no reinicia
Verifica el log:
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

### Si hay errores de permisos
Asegúrate de que el usuario mongodb tenga permisos:
```bash
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

### Para verificar que el replica set está activo
```bash
mongosh --eval "rs.status()"
```