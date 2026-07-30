# 🧳 Bitácora

**Bitácora** es un organizador de viajes personal, tipo PWA (Progressive Web
App), pensado para funcionar incluso sin conexión a internet. Permite crear
viajes y gestionar dentro de cada uno: gastos multi-moneda, itinerario diario,
checklist de esenciales, alojamientos, ciudades con lugares para visitar,
opciones de SIM/eSIM y exportación a Excel. Incluye un asistente de IA
integrado.

Pensada principalmente para viajes internacionales de larga distancia, pero
totalmente usable también para viajes cortos dentro de Argentina (algunas
secciones como multi-moneda o SIM/eSIM se ocultan u opcionalizan en ese caso).

🔗 **App en producción:** https://bitacora-travel.vercel.app

---

## ✨ Funcionalidades

- **Viajes** — creación y edición, marcados como nacionales o internacionales
- **Gastos** — categorías, métodos de pago y monedas configurables por el
  usuario, con tipo de cambio y total en tiempo real
- **Itinerario** — día por día, con ciudad, alojamiento, actividades,
  transporte, vuelo y notas
- **Checklist** — lista de esenciales con progreso y orden
- **Alojamientos** — check-in/check-out, dirección y notas
- **Ciudades y lugares** — lugares para visitar por ciudad, con link a Google
  Maps y estado de "visitado"
- **SIM/eSIM** — comparación de opciones, solo visible en viajes
  internacionales
- **Exportación a Excel** — descarga de todo el viaje (o por sección) en
  `.xlsx`
- **Asistente de IA** — chat con contexto del viaje actual (Anthropic API)
- **Modo offline** — los datos quedan disponibles sin conexión y se
  sincronizan al recuperar internet

## 📱 Diseño

Mobile-first: cada pantalla está pensada primero para el celular (caso de uso
principal: viajando), con navegación inferior, tarjetas táctiles grandes y
botón flotante para agregar. El layout de escritorio se agrega en paralelo
con sidebar lateral. Estética cálida y colorida, inspirada en apps como
Polarsteps o Google Trips.

## 🏗️ Stack

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core 10 Web API (controllers) |
| ORM | Entity Framework Core 10 + Npgsql |
| Base de datos | PostgreSQL (Supabase) |
| Auth | ASP.NET Core Identity + JWT |
| Exportación Excel | ClosedXML |
| IA | Anthropic API (solo server-side) |
| Frontend | React 19 + TypeScript + Vite |
| Estilos | Tailwind CSS v4 |
| PWA / Offline | vite-plugin-pwa + Workbox |
| Deploy backend | Railway |
| Deploy frontend | Vercel |

Arquitectura del backend en **Clean Architecture** (API → Application →
Domain, Infrastructure → Application → Domain), con las claves de API y la
cadena de conexión únicamente del lado del servidor.

## 📂 Estructura del repositorio

```
bitacora/
├── backend/
│   ├── Bitacora.API/             # controllers, Program.cs, configuración
│   ├── Bitacora.Application/     # interfaces, servicios, DTOs
│   ├── Bitacora.Domain/          # entidades puras, sin dependencias externas
│   └── Bitacora.Infrastructure/  # EF Core, DbContext, implementaciones
└── frontend/
    └── src/
        ├── components/ui/        # componentes reutilizables
        ├── pages/
        ├── hooks/
        ├── services/              # llamadas a la API
        └── types/
```

## 🚀 Levantar el proyecto localmente

### Requisitos
- .NET 10 SDK
- Node.js 20+
- Una base de datos PostgreSQL (por ejemplo, un proyecto de Supabase)

### Backend

```bash
cd backend

# configurar secretos locales (no se commitean)
cd Bitacora.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<tu-connection-string>"
dotnet user-secrets set "JwtSettings:Secret" "<tu-secreto>"
dotnet user-secrets set "Anthropic:ApiKey" "<tu-api-key>"

cd ..
dotnet build
cd Bitacora.API
dotnet run
```

### Frontend

```bash
cd frontend
npm install
# crear frontend/.env.local con VITE_API_URL=http://localhost:<puerto-api>
npm run dev
```

## 🗺️ Roadmap

- [x] **Fase 1** — Backend: CRUD completo de todas las entidades, auth con
  JWT, exportación a Excel
- [x] **Fase 2** — Frontend React: todos los tabs del viaje, gestión de
  catálogos, edición de viajes, soporte PWA/offline
- [ ] **Fase 3** — Integraciones: asistente de IA con contexto del viaje,
  autocompletado de lugares con Google Places API

## 📄 Licencia

Proyecto personal, sin licencia pública definida todavía.
