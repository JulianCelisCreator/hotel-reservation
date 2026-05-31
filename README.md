# Hotel Reservation

Sistema de gestión de reservas de hotel desarrollado con FastAPI y React + Vite.

---

## Estructura del proyecto

```
hotel-reservation/
├── backend/        # API REST con FastAPI y PostgreSQL
├── frontend/       # Interfaz de usuario con React + Vite + TypeScript
├── entrega2.sql    # Esquema de la base de datos y seed data
├── sql/
│   ├── creation.sql      # Esquema de base de datos
│   └── insertion.sql     # Datos iniciales adicionales
└── README.md
```

---

## Requisitos globales

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 20+            |
| Python      | 3.12+          |
| Poetry      | 2.0+           |
| PostgreSQL  | 14+            |

### Instalar Node.js (con nvm)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Reiniciar terminal, luego:
nvm install --lts
nvm use --lts
```

### Instalar Poetry
```bash
curl -sSL https://install.python-poetry.org | python3 -
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

---

## Base de datos (PostgreSQL)

### 1. Crear usuario y base de datos
```bash
sudo -u postgres psql
```

Dentro de psql:
```sql
CREATE USER <tu_usuario> WITH PASSWORD '<tu_password>';
CREATE DATABASE project_hotel OWNER <tu_usuario>;
GRANT ALL PRIVILEGES ON DATABASE project_hotel TO <tu_usuario>;
\q
```

### 2. Cargar el esquema y datos
```bash
psql -U <tu_usuario> -d project_hotel -h localhost -f sql/creation.sql
psql -U <tu_usuario> -d project_hotel -h localhost -f sql/insertion.sql
```

---

## Levantar el proyecto

Ver instrucciones específicas en cada carpeta:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
