# Backend — Hotel Reservation API

API REST construida con **FastAPI**, **SQLAlchemy (async)** y **PostgreSQL**. Proporciona todos los endpoints para gestionar usuarios, hoteles, reservas y administración del sistema.

---

## Estructura del Proyecto

```
backend/
├── app/
│   ├── main.py                 # Punto de entrada, configuración CORS y routers
│   ├── database.py             # Conexión async a PostgreSQL con SQLAlchemy
│   ├── core/
│   │   ├── config.py           # Variables de entorno y configuración
│   │   ├── security.py         # Funciones de hashing y JWT
│   │   └── permissions.py      # Control de permisos y roles
│   ├── models/
│   │   ├── usuario.py          # Modelo Usuario ORM
│   │   ├── hotel.py            # Modelo Hotel ORM
│   │   ├── reserva.py          # Modelo Reserva ORM
│   │   └── extras.py           # Modelo Extras ORM
│   ├── schemas/
│   │   ├── auth.py             # Schemas para login/registro (Pydantic)
│   │   ├── hotel.py            # Schemas para hoteles
│   │   └── reserva.py          # Schemas para reservas
│   ├── repositories/           # Data Access Layer (acceso a BD)
│   │   ├── usuario_repository.py
│   │   ├── hotel_repository.py
│   │   ├── reserva_repository.py
│   │   └── extras_repository.py
│   ├── services/               # Lógica de negocio
│   │   ├── auth_service.py     # Autenticación y registro
│   │   ├── hotel_service.py    # Operaciones con hoteles
│   │   ├── reserva_service.py  # Gestión de reservas
│   │   └── admin_service.py    # Funciones administrativas
│   ├── routers/                # Endpoints agrupados por módulo
│   │   ├── auth.py             # /api/auth
│   │   ├── hotel.py            # /api/hoteles
│   │   ├── reserva.py          # /api/reservas
│   │   ├── admin.py            # /api/admin
│   │   └── catalogo.py         # /api/catalogo (búsqueda)
│   └── utils/
│       └── seed.py             # Funciones auxiliares
├── Dockerfile                  # Configuración para containerizar
├── pyproject.toml              # Dependencias y configuración de Poetry
├── poetry.lock                 # Lock file de dependencias
└── README.md
```

---

## Dependencias Principales

| Paquete           | Versión | Uso                              |
|-------------------|---------|----------------------------------|
| fastapi           | ^0.100  | Framework web                    |
| uvicorn           | ^0.24   | Servidor ASGI                    |
| sqlalchemy        | ^2.0    | ORM para base de datos           |
| asyncpg           | ^0.29   | Driver async para PostgreSQL     |
| pydantic          | ^2.0    | Validación de datos              |
| pydantic-settings | ^2.0    | Gestión de variables de entorno  |
| python-jose       | ^3.3    | JWT tokens                       |
| passlib           | ^1.7    | Hashing de contraseñas           |
| bcrypt            | ^4.0    | Algoritmo de hash seguro         |

---

## Configuración

### 1. Crear archivo `.env`

```bash
cp .env.example .env
```

### 2. Editar `.env` con tu configuración

```env
# Base de Datos
DATABASE_URL=postgresql+asyncpg://hotel_user:hotel1234@localhost:5432/project_hotel

# Seguridad
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Instalación y Ejecución

### Instalación de dependencias
```bash
cd backend
poetry install
```

### Ejecutar servidor de desarrollo
```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: **http://localhost:8000**

### Documentación interactiva
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/register` — Registrarse
- `POST /api/auth/refresh` — Renovar token

### Hoteles
- `GET /api/hoteles` — Listar todos los hoteles
- `GET /api/hoteles/{id}` — Obtener detalle de un hotel
- `POST /api/hoteles` — Crear hotel (admin)
- `PUT /api/hoteles/{id}` — Actualizar hotel (admin)
- `DELETE /api/hoteles/{id}` — Eliminar hotel (admin)

### Reservas
- `GET /api/reservas` — Mis reservas (usuario)
- `POST /api/reservas` — Crear nueva reserva
- `GET /api/reservas/{id}` — Detalle de reserva
- `PUT /api/reservas/{id}` — Actualizar reserva
- `DELETE /api/reservas/{id}` — Cancelar reserva

### Admin
- `GET /api/admin/stats` — Estadísticas del sistema
- `GET /api/admin/usuarios` — Listar usuarios
- `GET /api/admin/reservas` — Todas las reservas
- `POST /api/admin/usuarios` — Crear usuario

### Catálogo
- `GET /api/catalogo/buscar` — Búsqueda de hoteles con filtros

---

## Autenticación y Autorización

El sistema utiliza **JWT (JSON Web Tokens)** con los siguientes roles:

| Rol    | Permisos                                  |
|--------|-------------------------------------------|
| admin  | Acceso completo (usuarios, hoteles, stats) |
| staff  | Gestión de reservas y hoteles             |
| cliente| Solo ver hoteles y sus reservas            |

Los tokens se envían en el header:
```
Authorization: Bearer {token}
```

---

## Estructura de Respuestas

### Éxito (200)
```json
{
  "data": {},
  "message": "Operación exitosa",
  "status": "success"
}
```

### Error (4xx/5xx)
```json
{
  "detail": "Descripción del error",
  "status": "error"
}
```

---

## Ejecución con Docker

El proyecto está preparado para ejecutarse en contenedor:

```bash
docker-compose up --build
```

Esto levantará:
- **Backend**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Frontend**: http://localhost:5173

---

## Variables de Entorno en Docker

El archivo `docker-compose.yml` configura automáticamente:
- `DATABASE_URL`: Conexión a la BD en el contenedor
- `FRONTEND_URL`: URL del frontend

---

## Desarrollo

### Ejecutar migraciones (si aplica)
```bash
# Nota: Las migraciones se aplican automáticamente via SQL scripts
```

### Ejecutar tests (si existen)
```bash
poetry run pytest
```

### Formatear código
```bash
poetry run black app/
poetry run isort app/
```

---

## Troubleshooting

### Error: `ModuleNotFoundError`
```bash
poetry install
poetry run uvicorn app.main:app --reload
```

### Error: `database connection refused`
Verifica que PostgreSQL esté corriendo y la `DATABASE_URL` sea correcta en `.env`

### Error: `CORS`
Asegúrate que `FRONTEND_URL` esté configurado correctamente en `.env`

---

## Contacto y Soporte

Para dudas sobre los endpoints, revisa la documentación Swagger en `/docs`

## Endpoints disponibles

| Método | Ruta                    | Descripción                        |
|--------|-------------------------|------------------------------------|
| GET    | /api                    | Estado de la API                   |
| GET    | /api/hoteles/           | Listar todos los hoteles           |
| GET    | /api/hoteles/{id}       | Detalle de un hotel y habitaciones |

Documentación interactiva: `http://localhost:8000/docs`

---

## Dependencias principales

| Paquete      | Uso                          |
|--------------|------------------------------|
| fastapi      | Framework web                |
| uvicorn      | Servidor ASGI                |
| sqlalchemy   | ORM async                    |
| asyncpg      | Driver PostgreSQL async       |
| python-dotenv| Lectura de variables de entorno |
