# SQL — Esquema y Datos de la Base de Datos

Contiene los scripts SQL para la creación de la estructura de la base de datos PostgreSQL y población inicial de datos.

---

## Archivos

### `creation.sql`
Define el esquema completo de la base de datos:
- **Tablas**: `usuarios`, `hoteles`, `reservas`, `extras`
- **Tipos de datos**: Enumerados para roles, estados de reservas, etc.
- **Vistas**: `vista_stats_admin` para estadísticas del sistema
- **Constrains**: Foreign keys, unique constraints, check constraints
- **Índices**: Optimización de consultas frecuentes

### `insertion.sql`
Inserta datos iniciales para pruebas:
- Usuarios de prueba (admin, clientes)
- Hoteles de ejemplo con diferentes características
- Reservas de muestra
- Extras disponibles

---

## Uso

### Con Docker Compose
Los scripts se cargan automáticamente al iniciar el contenedor:
```bash
docker-compose up
```

El contenedor de PostgreSQL ejecutará:
1. `01-creation.sql` (esquema)
2. `02-insertion.sql` (datos)

### Manualmente en PostgreSQL
```bash
# Conectar a la base de datos
psql -U hotel_user -d project_hotel -h localhost

# Ejecutar scripts
\i sql/creation.sql
\i sql/insertion.sql

# O desde línea de comandos
psql -U hotel_user -d project_hotel -h localhost -f sql/creation.sql
psql -U hotel_user -d project_hotel -h localhost -f sql/insertion.sql
```

---

## Estructura de Tablas

### Tabla: `usuarios`
```
- id (PK)
- email (UNIQUE)
- contraseña (hasheada)
- nombre
- rol (admin, cliente, staff)
- estado (activo, inactivo)
- fecha_creacion
```

### Tabla: `hoteles`
```
- id (PK)
- nombre
- ubicacion
- descripcion
- precio_por_noche
- calificacion
- imagen_url
- estado (disponible, mantenimiento)
```

### Tabla: `reservas`
```
- id (PK)
- usuario_id (FK)
- hotel_id (FK)
- fecha_entrada
- fecha_salida
- num_huespedes
- estado (pendiente, confirmada, cancelada)
- precio_total
```

### Tabla: `extras`
```
- id (PK)
- reserva_id (FK)
- nombre (desayuno, spa, traslado, etc.)
- precio
```

---

## Vistas Disponibles

### `vista_stats_admin`
Proporciona estadísticas para el dashboard administrativo:
- Total de reservas
- Ingresos totales
- Hoteles más reservados
- Clientes más activos

---

## Notas Importantes

- Los scripts están ordenados con prefijos numéricos (`01-`, `02-`) para ejecutarse en secuencia
- Las contraseñas en `insertion.sql` son **solo para pruebas**
- Los datos de prueba se pueden borrar sin afectar la estructura del esquema
- Mantén ambos scripts sincronizados con los modelos ORM del backend

---

## Mantenimiento

Para agregar nuevas tablas o modificaciones:
1. Edita `creation.sql` para cambios de esquema
2. Edita `insertion.sql` para nuevos datos de prueba
3. Regenera la base de datos con Docker: `docker-compose down && docker-compose up`
