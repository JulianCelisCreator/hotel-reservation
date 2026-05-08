# Backend — Hotel Reservation API

API REST construida con FastAPI, SQLAlchemy (async) y PostgreSQL.

---

## Estructura

```
backend/
├── app/
│   ├── main.py          # Punto de entrada, configuración de la app
│   ├── database.py      # Conexión a PostgreSQL con SQLAlchemy async
│   ├── models/          # Modelos ORM (mapeo de tablas)
│   ├── schemas/         # Schemas Pydantic (validación de datos)
│   └── routers/         # Endpoints agrupados por módulo
├── .env.example         # Variables de entorno requeridas
├── pyproject.toml       # Dependencias del proyecto
└── poetry.lock
```

---

## Configuración

Copia el archivo de ejemplo y completa tus datos:

```bash
cp .env.example .env
```

Edita `.env` con tu configuración de base de datos:

```
DATABASE_URL=postgresql+asyncpg://usuario:password@localhost:5432/project_hotel
```

---

## Instalación y ejecución

```bash
poetry install
poetry run uvicorn app.main:app --reload
```

El servidor corre en `http://localhost:8000`

---

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
