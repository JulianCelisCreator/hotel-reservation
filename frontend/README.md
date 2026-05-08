# Frontend — Hotel Reservation

Interfaz de usuario construida con React 19, Vite 8 y TypeScript.

---

## Estructura

```text
frontend/
├── src/
│   ├── main.tsx         # Punto de entrada de React
│   └── App.tsx          # Componente raíz
├── public/              # Archivos estáticos
├── index.html           # HTML base
├── vite.config.ts       # Configuración de Vite
├── tsconfig.json        # Configuración de TypeScript
└── package.json         # Dependencias del proyecto
```

---

## Instalación y ejecución

```bash
npm install
npm run dev
```

El servidor de desarrollo corre en `http://localhost:5173`

---

## Scripts disponibles

| Comando           | Descripción                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Levanta el servidor de desarrollo    |
| `npm run build`   | Compila para producción              |
| `npm run preview` | Previsualiza el build de producción  |
| `npm run lint`    | Revisa el código con ESLint          |

---

## Dependencias principales

| Paquete      | Uso                         |
|--------------|-----------------------------|
| react        | Librería de UI              |
| react-dom    | Renderizado en el navegador |
| vite         | Servidor y bundler          |
| typescript   | Tipado estático             |
