# 🚌 BusWay — Portal Web (Next.js 14)

> Sitio web oficial y paneles de usuario de BusWay. Construido con Next.js 14, Tailwind CSS y Firebase Authentication.

---

## Requisitos previos

| Herramienta | Versión | Descarga |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | incluido con Node.js |

---

## Instalación

### 1. Ir a la carpeta web

```bash
cd busway-main/web
```

### 2. Instalar dependencias

```bash
npm install
```

---

## Variables de entorno

Crea un archivo `.env.local` dentro de la carpeta `web/`:

> ⚠️ Este archivo **no se sube a GitHub** — ya está en `.gitignore`.

---

## Ejecutar el proyecto

```bash
npm run dev
```

Abre en el navegador:

```
http://localhost:3001
```

> Si el puerto 3001 está ocupado, Next.js asigna el siguiente disponible. Revisa la terminal para ver cuál usó.

---

## Estructura de carpetas

```
web/
├── public/
│   └── logo.png                  ← logo de BusWay
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── admin/            ← panel administrador
│   │   │   │   ├── escuelas/
│   │   │   │   ├── ingresos/
│   │   │   │   └── usuarios/
│   │   │   ├── conductor/        ← panel conductor
│   │   │   │   ├── estudiantes/
│   │   │   │   ├── pagos/
│   │   │   │   ├── perfil/
│   │   │   │   └── viajes/
│   │   │   ├── padre/            ← panel padre
│   │   │   └── layout.js         ← protección de rutas
│   │   ├── login/                ← inicio de sesión
│   │   ├── globals.css
│   │   ├── layout.js             ← layout raíz
│   │   └── page.js               ← landing page (/)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── PanelSection.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── PublicPage.jsx
│   └── lib/
│       ├── api.js                ← conexión al backend
│       └── firebase.js           ← configuración Firebase
└── middleware.js                 ← protección de rutas autenticadas
```

---

## Rutas disponibles

| URL | Descripción | Acceso |
|---|---|---|
| `/` | Landing page | Público |
| `/login` | Inicio de sesión | Público |
| `/dashboard/admin` | Panel administrador | Solo admin |
| `/dashboard/admin/escuelas` | Gestión de escuelas | Solo admin |
| `/dashboard/admin/usuarios` | Gestión de usuarios | Solo admin |
| `/dashboard/admin/ingresos` | Reportes de ingresos | Solo admin |
| `/dashboard/conductor` | Panel conductor | Solo conductor |
| `/dashboard/conductor/viajes` | Viajes activos | Solo conductor |
| `/dashboard/conductor/estudiantes` | Lista de estudiantes | Solo conductor |
| `/dashboard/padre` | Panel padre | Solo padre |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS |
| Autenticación | Firebase Authentication |
| Backend | Node.js + Express (carpeta `be/`) |

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar versión de producción
npm start

# Revisar errores de código
npm run lint
```

---

## Notas del equipo

- El backend (`be/`) debe estar corriendo en `localhost:3000` para que el panel funcione correctamente.
- La clave de Firebase ya está configurada en `.env.local` — no compartir públicamente.
- El logo debe estar en `public/logo.png`.

---

*BusWay · tus hijos seguros en cada ruta 🚌*