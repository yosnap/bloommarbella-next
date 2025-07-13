# Pasos detallados para editar mongod.conf

## 1. Conectar al VPS
```bash
ssh root@31.97.79.180
```

## 2. Hacer backup de la configuración actual
```bash
sudo cp /etc/mongod.conf /etc/mongod.conf.backup
```

## 3. Editar el archivo de configuración
```bash
sudo nano /etc/mongod.conf
```

## 4. Qué modificar en el archivo

El archivo tiene formato YAML (usa espacios, no tabs). Busca o agrega estas secciones:

### Sección de red (probablemente ya existe):
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0  # Permite conexiones remotas
```

### Sección de replicación (agregar al final si no existe):
```yaml
replication:
  replSetName: "rs0"
```

### Ejemplo de cómo debería verse el archivo completo:
```yaml
# mongod.conf

# for documentation of all options, see:
#   http://docs.mongodb.org/manual/reference/configuration-options/

# Where and how to store data.
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0

# how the process runs
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

#security:
#  authorization: enabled

# Agregar esta sección para replica set
replication:
  replSetName: "rs0"
```

## 5. Guardar y salir de nano
- `Ctrl + O` para guardar
- `Enter` para confirmar
- `Ctrl + X` para salir

## 6. Verificar que el archivo está bien formateado
```bash
# Verificar sintaxis YAML
cat /etc/mongod.conf | grep -E "^[[:space:]]*replication:|^[[:space:]]*replSetName:"
```

Deberías ver:
```
replication:
  replSetName: "rs0"
```

## 7. Reiniciar MongoDB
```bash
sudo systemctl restart mongod
```

## 8. Verificar que MongoDB arrancó correctamente
```bash
# Ver estado del servicio
sudo systemctl status mongod

# Ver últimas líneas del log
sudo tail -20 /var/log/mongodb/mongod.log
```

## 9. Si hay errores al reiniciar

### Error común: sintaxis YAML incorrecta
- Asegúrate de usar espacios, no tabs
- La indentación debe ser consistente (2 espacios)
- No dejes espacios al final de las líneas

### Para revisar errores:
```bash
# Ver log completo
sudo journalctl -u mongod -n 50

# O ver el archivo de log
sudo tail -50 /var/log/mongodb/mongod.log | grep -i error
```

### Si necesitas revertir cambios:
```bash
sudo cp /etc/mongod.conf.backup /etc/mongod.conf
sudo systemctl restart mongod
```

## 10. Una vez que MongoDB esté corriendo con replica set

Conectar a mongo shell:
```bash
mongosh
# o si usas versión antigua:
mongo
```

Inicializar replica set:
```javascript
rs.initiate()
```

Verificar estado:
```javascript
rs.status()
```

Salir:
```javascript
exit
```

## Notas importantes

1. **Indentación YAML**: Usa 2 espacios, nunca tabs
2. **bindIp**: `0.0.0.0` permite conexiones remotas, asegúrate de tener firewall configurado
3. **Backup**: Siempre haz backup antes de editar
4. **Logs**: Si algo falla, revisa `/var/log/mongodb/mongod.log`