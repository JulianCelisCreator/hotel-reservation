# Frontend — Hotel Reservation UI

Interfaz de usuario moderna construida con **React 19**, **Vite 8**, **TypeScript** y **CSS3**. Proporciona una experiencia completa para buscar hoteles, hacer reservas y gestionar la cuenta de usuario.

---

## Estructura del Proyecto

```text
frontend/
├── src/
│   ├── main.tsx                    # Punto de entrada de React
│   ├── index.css                   # Estilos globales
│   ├── api/
│   │   └── client.ts               # Cliente HTTP (Fetch API)
│   ├── assets/                     # Imágenes y recursos estáticos
│   ├── components/                 # Componentes reutilizables
│   │   ├── Navbar.tsx              # Barra de navegación
│   │   ├── Header.tsx              # Encabezado principal
│   │   ├── Footer.tsx              # Pie de página
│   │   ├── SearchBar.tsx           # Buscador de hoteles
│   │   ├── HotelCard.tsx           # Tarjeta de hotel
│   │   ├── HotelInfoBar.tsx        # Información del hotel
│   │   ├── HotelMap.tsx            # Mapa de ubicación
│   │   ├── Gallery.tsx             # Galería de imágenes
│   │   ├── BottomBar.tsx           # Barra inferior
│   │   ├── Navigation.tsx          # Navegación de secciones
│   │   └── IVANotice.tsx           # Aviso de IVA
│   ├── context/
│   │   └── AuthContext.tsx         # Context para autenticación global
│   ├── pages/                      # Páginas completas
│   │   ├── Home.tsx                # Página de inicio
│   │   ├── Login.tsx               # Login de usuario
│   │   ├── Register.tsx            # Registro de usuario
│   │   ├── HotelDetail.tsx         # Detalle de hotel
│   │   ├── BookingForm.tsx         # Formulario de reserva
│   │   ├── MisReservas.tsx         # Mis reservas
│   │   ├── AdminDashboard.tsx      # Dashboard adminstrativo
│   │   ├── AdminHoteles.tsx        # Gestión de hoteles
│   │   ├── AdminReservas.tsx       # Gestión de reservas
│   │   ├── AdminUsuarios.tsx       # Gestión de usuarios
│   │   ├── AdminNuevaReserva.tsx   # Crear reserva (admin)
│   │   ├── AdminReservaDetalle.tsx # Detalle de reserva (admin)
│   │   ├── AdminUsuarioDetalle.tsx # Detalle de usuario (admin)
│   │   └── AdminTable.tsx          # Tabla genérica para admin
│   ├── routes/                     # Configuración de rutas
│   │   ├── AppRouter.tsx           # Router principal
│   │   ├── ProtectedRoute.tsx      # Rutas protegidas
│   │   └── AdminLayout.tsx         # Layout para admin
│   ├── services/                   # Servicios de API
│   │   ├── authService.ts          # Autenticación
│   │   ├── catalogoService.ts      # Búsqueda de hoteles
│   │   ├── hotelService.ts         # Operaciones con hoteles
│   │   ├── reservaService.ts       # Operaciones con reservas
│   │   └── adminService.ts         # Funciones administrativas
│   └── App.tsx                     # Componente raíz
├── public/                         # Archivos estáticos (favicon, etc.)
├── index.html                      # HTML base
├── vite.config.ts                  # Configuración de Vite
├── tsconfig.json                   # Configuración de TypeScript
├── tsconfig.app.json               # Config específica de app
├── tsconfig.node.json              # Config para nodos
├── eslint.config.js                # Configuración de ESLint
├── Dockerfile                      # Contenedor para producción
└── package.json                    # Dependencias del proyecto
```

---

## Dependencias Principales

| Paquete         | Versión | Uso                              |
|-----------------|---------|----------------------------------|
| react           | ^19.0   | Librería de UI                   |
| react-dom       | ^19.0   | Renderizado en el navegador      |
| react-router-dom| ^6.x    | Enrutamiento de páginas          |
| typescript      | ^5.x    | Tipado de JavaScript             |
| vite            | ^5.x    | Build tool y dev server          |
| eslint          | ^8.x    | Linter de código                 |

---

## Instalación y Ejecución

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Ejecutar servidor de desarrollo
```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:5173**

---

## Scripts Disponibles

| Comando           | Descripción                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Levanta el servidor de desarrollo    |
| `npm run build`   | Compila para producción              |
| `npm run preview` | Previsualiza el build de producción  |
| `npm run lint`    | Revisa el código con ESLint          |

---

## Estructura de Páginas

### Público (sin autenticación)
- **Home** — Búsqueda y navegación de hoteles
- **Login** — Iniciar sesión
- **Register** — Crear nueva cuenta
- **HotelDetail** — Información detallada de un hotel
- **BookingForm** — Formulario de reserva

### Autenticado (usuario regular)
- **MisReservas** — Ver todas mis reservas

### Administrador
- **AdminDashboard** — Panel principal con estadísticas
- **AdminHoteles** — CRUD de hoteles
- **AdminReservas** — Gestión de todas las reservas
- **AdminUsuarios** — Gestión de usuarios
- **AdminNuevaReserva** — Crear reserva manualmente
- **AdminReservaDetalle** — Editar reserva
- **AdminUsuarioDetalle** — Editar usuario

---

## Context API (AuthContext)

Gestiona globalmente:
- Usuario autenticado
- Token JWT
- Rol del usuario
- Funciones de login/logout

```typescript
// Uso en componentes
const { user, token, role, login, logout } = useContext(AuthContext);
```

---

## Servicios API

### authService.ts
```typescript
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

### hotelService.ts
```typescript
- getHoteles(filtros)
- getHotelById(id)
- createHotel(datos)
- updateHotel(id, datos)
- deleteHotel(id)
```

### reservaService.ts
```typescript
- getReservas()
- getReservaById(id)
- createReserva(datos)
- updateReserva(id, datos)
- cancelReserva(id)
```

### catalogoService.ts
```typescript
- buscar(filtros, fechas, ubicacion)
```

### adminService.ts
```typescript
- getStats()
- getUsuarios()
- getTodasLasReservas()
- createUsuario(datos)
```

---

## Autenticación

El token JWT se almacena en **localStorage** y se envía en cada request:

```typescript
headers: {
  "Authorization": `Bearer ${token}`
}
```

Las rutas protegidas (`ProtectedRoute`) verifican la autenticación y redirigen al login si es necesario.

---

## Estilos

Cada componente tiene su archivo CSS asociado:
- `HotelCard.css` — Estilos de tarjeta de hotel
- `BookingForm.css` — Formulario de reserva
- `AdminDashboard.css` — Dashboard administrativo
- `index.css` — Estilos globales

Se utiliza **CSS3 moderno** con variables CSS para tema consistente.

---

## Configuración de Ambiente

Las variables de entorno se configuran en:
- **Desarrollo**: `vite.config.ts` define URL del backend
- **Docker**: `docker-compose.yml` pasa `BACKEND_URL`

```typescript
// En client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

---

## Ejecución con Docker

```bash
docker-compose up
```

El contenedor expone el puerto **5173** y se conecta automáticamente al backend.

---

## Build para Producción

```bash
npm run build
npm run preview  # Previsualizar build local
```

Los archivos compilados estarán en `dist/`

---

## Troubleshooting

### Error: `CORS`
Verifica que `FRONTEND_URL` en el backend `.env` sea correcto

### Error: `Cannot find module`
```bash
npm install
npm run dev
```

### Tokens expirados
El sistema renueva automáticamente los tokens expirados

---

## Características Principales

✅ Búsqueda de hoteles con filtros
✅ Reservas en línea
✅ Gestión de perfil de usuario
✅ Dashboard administrativo completo
✅ Autenticación JWT segura
✅ Interfaz responsive
✅ Manejo de errores robusto

---

## Contacto y Soporte

Para dudas sobre componentes o funcionalidades, revisa el código en `src/`
| vite         | Servidor y bundler          |
| typescript   | Tipado estático             |
