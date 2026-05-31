# 🏨 Hotel Reservation System

Sistema completo de gestión y reservas de hoteles con **backend moderno en Python** y **frontend responsivo en React**.

---

## 📋 Descripción General

Este proyecto es una aplicación web full-stack para la gestión de reservas de hoteles. Incluye:

- ✅ **Catálogo de hoteles** con búsqueda y filtros
- ✅ **Sistema de reservas** con validación de fechas
- ✅ **Autenticación segura** con JWT
- ✅ **Panel administrativo** completo
- ✅ **Gestión de usuarios y hoteles**
- ✅ **APIs REST documentadas** con Swagger
- ✅ **Containerizado con Docker** para fácil deployment

---

## 🏗️ Estructura del Proyecto

```
hotel-reservation/
├── backend/                    # API REST (FastAPI + PostgreSQL)
│   ├── app/
│   │   ├── core/              # Config, seguridad, permisos
│   │   ├── models/            # Modelos ORM
│   │   ├── schemas/           # Validación Pydantic
│   │   ├── repositories/      # Data Access Layer
│   │   ├── services/          # Lógica de negocio
│   │   ├── routers/           # Endpoints por módulo
│   │   └── utils/             # Funciones auxiliares
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── README.md
│
├── frontend/                   # UI (React + Vite + TypeScript)
│   ├── src/
│   │   ├── api/               # Cliente HTTP
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas completas
│   │   ├── services/          # Servicios de API
│   │   ├── routes/            # Configuración de rutas
│   │   ├── context/           # State global (AuthContext)
│   │   └── assets/            # Recursos estáticos
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
│
├── sql/                        # Scripts de base de datos
│   ├── creation.sql           # Esquema y estructura
│   ├── insertion.sql          # Datos iniciales
│   └── README.md
│
├── docker-compose.yml         # Orquestación de servicios
├── LICENSE
└── README.md
```

---

## 🛠️ Requisitos Globales

| Herramienta | Versión mínima | Descripción                      |
|-------------|----------------|----------------------------------|
| Docker      | 20.0+          | Containerización (recomendado)   |
| Docker Compose | 2.0+        | Orquestación de contenedores     |
| Node.js     | 20+            | Runtime de JavaScript            |
| Python      | 3.12+          | Runtime de Python                |
| Poetry      | 2.0+           | Gestor de dependencias Python    |
| PostgreSQL  | 14+            | Base de datos (si no usa Docker) |

### Instalación Rápida (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python
sudo apt-get install -y python3.12 python3.12-venv

# Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Docker
sudo apt-get install -y docker.io docker-compose
```

---

## 🚀 Inicio Rápido con Docker (Recomendado)

### Opción 1: Levantarlo todo automáticamente

```bash
docker-compose up --build
```

Este comando:
1. Crea las imágenes de Docker para frontend y backend
2. Inicia PostgreSQL con el esquema de base de datos
3. Levanta el servidor backend en `http://localhost:8000`
4. Levanta el servidor frontend en `http://localhost:5173`

Accede a:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

### Opción 2: Parar los servicios

```bash
docker-compose down
```

### Opción 3: Eliminar volúmenes (resetear BD)

```bash
docker-compose down -v
docker-compose up --build
```

## 🔐 Autenticación y Roles

El sistema implementa **JWT (JSON Web Tokens)** con tres roles:

| Rol    | Acceso                                    | Rutas Disponibles           |
|--------|-------------------------------------------|-----------------------------|
| **admin** | Todo el sistema                        | `/admin/*`                  |
| **staff** | Gestión de hoteles y reservas          | `/admin/hoteles`, `/admin/reservas` |
| **cliente** | Búsqueda y sus propias reservas        | `/mis-reservas`             |

**Credenciales de ejemplo** (después de ejecutar `insertion.sql`):
```
Email: admin@hotel.com
Contraseña: admin123

Email: cliente@hotel.com  
Contraseña: cliente123
```

---

## 📊 Endpoints Principales

### Autenticación
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
```

### Hoteles
```
GET    /api/hoteles
GET    /api/hoteles/{id}
POST   /api/hoteles (admin)
PUT    /api/hoteles/{id} (admin)
DELETE /api/hoteles/{id} (admin)
```

### Reservas
```
GET    /api/reservas
POST   /api/reservas
GET    /api/reservas/{id}
PUT    /api/reservas/{id}
DELETE /api/reservas/{id}
```

### Admin
```
GET    /api/admin/stats
GET    /api/admin/usuarios
GET    /api/admin/reservas
```

Documentación interactiva completa: **http://localhost:8000/docs** (Swagger UI)

---

## 🎯 Flujos Principales

### Búsqueda y Reserva (Usuario)

1. **Inicio de Sesión** → Login/Register
2. **Búsqueda** → Filtrar hoteles por fecha y ubicación
3. **Detalle** → Ver información del hotel
4. **Reserva** → Completar formulario de reserva
5. **Confirmación** → Ver mis reservas

### Administración (Admin)

1. **Dashboard** → Ver estadísticas
2. **Gestión de Hoteles** → CRUD completo
3. **Gestión de Reservas** → Editar/cancelar
4. **Gestión de Usuarios** → Crear/editar usuarios



## 👥 Autores

Desarrollado como proyecto académico de Bases de Datos Avanzadas.

---
