# Bitácora — CLAUDE.es.md

Traducción al español del documento de referencia principal (CLAUDE.md).
Ambos archivos deben mantenerse siempre sincronizados. Después de cada
merge a main, Claude Code debe actualizar los dos archivos juntos.

---

## Qué es este proyecto

Bitácora es una app web personal de organización de viajes (PWA — Aplicación
Web Progresiva). Permite crear viajes y gestionar dentro de cada uno: gastos
con soporte multi-moneda, itinerario diario, checklist de imprescindibles,
alojamientos, ciudades con lugares a visitar y opciones de chip SIM/eSIM.
Incluye exportación a Excel y un asistente de IA integrado.

La app está pensada principalmente para viajes internacionales largos, pero
también es totalmente usable para viajes cortos dentro de Argentina. Algunas
funciones son contextuales:
- Opciones de SIM/eSIM: solo relevante para viajes internacionales
- Multi-moneda: solo relevante para viajes internacionales; los viajes
  nacionales usan ARS (pesos argentinos) por defecto
- Estas secciones deben ocultarse o marcarse como opcionales en viajes nacionales

La app está diseñada mobile-first. Cada pantalla debe funcionar perfectamente
en un celular (caso de uso principal: estar de viaje). El diseño de escritorio
se construye en paralelo pero es prioridad secundaria.

---

## Soporte sin conexión (PWA)

La app debe funcionar sin conexión a internet. Este es un requisito central
porque los usuarios van a estar de viaje y muchas veces van a tener señal
mala o nula.

**Cómo funciona:**
- Cuando el usuario abre la app con internet, todos sus datos del viaje se
  guardan localmente en el dispositivo usando la caché del navegador
- Si se pierde el internet, el usuario puede seguir viendo y editando
  todos sus datos
- Cuando vuelve el internet, la app sincroniza los cambios automáticamente
- Esto se implementa con vite-plugin-pwa + service workers + caché local

**Qué funciona sin conexión:**
- Ver todos los viajes, gastos, itinerario, checklist, alojamientos, ciudades
- Agregar y editar gastos, ítems del checklist y notas
- Ver el itinerario completo

**Qué requiere conexión:**
- El asistente de IA (llama a la API de Anthropic)
- Búsqueda de lugares en Google Maps
- Login y registro
- Sincronizar datos con el servidor

---

## Diseño visual

La estética es colorida, cálida y con temática de viajes. La idea es
aventura, movimiento y energía — similar a apps como Polarsteps o Google Trips.

**Paleta de colores:**
- Primario: naranja cálido `#FF6B35` — energía, aventura
- Secundario: azul cielo profundo `#1B4FD8` — cielo, mar, viajes largos
- Acento: amarillo dorado `#FFD23F` — sol, destinos exóticos
- Fondo: blanco roto `#FAFAF8` — limpio pero no frío
- Texto: azul marino oscuro `#1A1A2E`
- Éxito: `#22C55E`
- Error: `#EF4444`

**Tipografía:**
- Títulos y encabezados: `Nunito` (redondeada, amigable)
- Texto de la UI: `Inter` (limpia, legible)
- Ambas cargadas desde Google Fonts

**Patrones de UI para móvil:**
- Barra de navegación inferior con íconos (móvil)
- Tarjetas grandes y fáciles de tocar para los ítems del viaje
- Botón flotante (+) para agregar ítems nuevos
- Badges de colores por categoría en los gastos
- Emoji de bandera o foto del destino en las tarjetas de viaje

**Patrones de UI para escritorio:**
- Navegación en barra lateral izquierda
- Layouts de dos o tres columnas donde corresponda
- Misma paleta de colores, más espacio entre elementos

---

## Estructura de pantallas

```
Página de inicio (pública)
  └── Hero: "Organizá tu próxima aventura" — vender el producto, botón de acción
      Sección de funciones, capturas, botón de registro
Pantalla de Login / Registro (pública)
  └── Email + contraseña, formulario limpio para móvil
Dashboard (privado)
  └── Lista de viajes del usuario (tarjetas con destino, fechas, estado)
    └── Detalle del viaje
          ├── Gastos
          ├── Itinerario
          ├── Checklist (Imprescindibles)
          ├── Alojamientos
          ├── Ciudades y Lugares
          ├── SIM/eSIM (solo viajes internacionales)
          └── Exportar a Excel
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core 10 Web API con controllers |
| ORM | Entity Framework Core 10 + Npgsql |
| Base de datos | PostgreSQL en Supabase |
| Autenticación | ASP.NET Core Identity + JWT Bearer |
| Exportar Excel | ClosedXML |
| IA | API de Anthropic (solo server-side, nunca expuesta al frontend) |
| Frontend | React 19 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| PWA / Sin conexión | vite-plugin-pwa + Workbox service workers |
| Deploy API | Railway |
| Deploy Frontend | Vercel |

---

## Estructura de carpetas

```
bitacora/
├── CLAUDE.md          ← archivo principal (inglés)
├── CLAUDE.es.md       ← este archivo (español), siempre sincronizado
├── README.md
├── .gitignore
├── backend/
│   ├── Bitacora.sln
│   ├── Bitacora.API/            ← controllers, Program.cs, configuración
│   ├── Bitacora.Application/    ← interfaces, servicios, DTOs
│   ├── Bitacora.Domain/         ← entidades puras, sin dependencias externas
│   └── Bitacora.Infrastructure/ ← EF Core, DbContext, implementaciones
└── frontend/
    └── src/
        ├── components/
        │   └── ui/              ← componentes reutilizables compartidos
        ├── pages/
        ├── hooks/
        ├── services/            ← funciones que llaman a la API
        └── types/
```

---

## Arquitectura

Clean Architecture con cuatro capas. Las dependencias solo apuntan hacia adentro.

Esto significa que cada capa solo "conoce" a las capas que están más adentro,
nunca a las de afuera. Es como una cebolla:

```
API → Application → Domain
Infrastructure → Application → Domain
```

**Reglas que nunca se rompen:**
- Domain no importa nada externo (ni EF, ni Npgsql, ni paquetes de terceros)
- Application solo importa Domain
- Infrastructure implementa las interfaces definidas en Application
- La API key de Anthropic y la connection string nunca tocan el frontend
- Todas las claves secretas viven solo en el servidor

**Por qué esta separación existe:**
Imaginate que querés cambiar de Supabase a otra base de datos. Con esta
arquitectura, solo tocás Infrastructure y nada más. El resto del código
no se entera del cambio. Sin esta separación, tendrías que cambiar código
en todos lados.

---

## Modelo de dominio

Todas las entidades incluyen `UserId` y `TripId` desde el día uno para
soportar múltiples usuarios aunque la autenticación se implemente después.

```
User (ASP.NET Core Identity — el sistema de usuarios)
└── Trip (Viaje)
    ├── Expense (Gasto)
    ├── ItineraryItem (Ítem del itinerario)
    ├── ChecklistItem (Ítem del checklist)
    ├── Accommodation (Alojamiento)
    ├── City (Ciudad)
    │   └── PlaceToVisit (Lugar a visitar)
    └── SimOption (solo en viajes internacionales)
```

### Entidades y sus campos

**Trip (Viaje)**
- Id: número único que identifica el viaje
- Name: nombre del viaje (ej: "Europa 2026")
- Description: descripción opcional
- StartDate / EndDate: fechas de inicio y fin
- IsInternational: verdadero/falso — si es internacional, habilita SIM y multi-moneda
- CreatedAt: fecha en que se creó el registro
- UserId: a qué usuario pertenece

**Expense (Gasto)**
- Id, TripId: identificadores
- CategoryId: categoría (alojamiento, transporte, comida, etc.)
- Description: descripción del gasto
- City: ciudad donde se hizo el gasto
- PaymentDate: fecha de pago
- PaymentMethodId: método de pago (efectivo, tarjeta, etc.)
- CurrencyId: moneda (ARS, USD, EUR, etc.)
- Amount: monto
- ExchangeRate: tipo de cambio usado (para multi-moneda)
- Observations: notas adicionales
- CreatedAt, UserId

**ItineraryItem (Ítem del itinerario)**
- Id, TripId
- Date: fecha del día
- DayNumber: número del día (Día 1, Día 2, etc.)
- City: ciudad del día
- Accommodation: dónde se aloja ese día
- Activities: qué hacer
- Transport: transporte del día
- Flight: información de vuelo si corresponde
- Observations, Link: notas y links útiles
- CreatedAt, UserId

**ChecklistItem (Ítem del checklist de imprescindibles)**
- Id, TripId
- Item: nombre del ítem (ej: "Pasaporte")
- Status: estado (ej: "OK", "Pendiente", "En trámite")
- Order: orden en la lista
- CreatedAt, UserId

**Accommodation (Alojamiento)**
- Id, TripId
- Name: nombre del alojamiento
- Address: dirección
- City: ciudad
- CheckIn / CheckOut: fechas de entrada y salida
- Observations: notas
- CreatedAt, UserId

**City (Ciudad)**
- Id, TripId
- Name: nombre de la ciudad
- Order: orden en la lista
- CreatedAt, UserId

**PlaceToVisit (Lugar a visitar)**
- Id, CityId
- Name: nombre del lugar
- PlaceId: ID de Google Maps (para vincular al mapa)
- MapsLink: link directo a Google Maps
- Notes: notas propias
- Visited: si ya fue visitado (bool)
- CreatedAt, UserId

**SimOption (Opción de SIM/eSIM — solo viajes internacionales)**
- Id, TripId
- Company: nombre de la compañía
- Type: SIM física o eSIM
- Coverage: cobertura (países que cubre)
- Notes: notas adicionales
- Decided: si ya se decidió usar esta opción (bool)
- CreatedAt, UserId

### Tablas de consulta (valores configurables por el usuario)

Estas tablas permiten que el usuario agregue sus propias categorías,
métodos de pago y monedas en lugar de tener valores fijos en el código.

- ExpenseCategory (Id, Name, UserId) — categorías de gasto
- PaymentMethod (Id, Name, UserId) — métodos de pago
- Currency (Id, Code, Name, Symbol, UserId) — monedas

Para viajes nacionales (IsInternational = false), la moneda por defecto
es ARS y los campos de multi-moneda se ocultan en la UI.

---

## Convenciones de código

**Idioma:**
- Código, clases, métodos, variables, comentarios: inglés
- Mensajes de error devueltos por la API: español
- Título y descripción del commit: inglés
- Logs de consola para debug: inglés

**Nombres:**
- Clases y métodos: PascalCase (ej: `TripService`)
- Variables locales y parámetros: camelCase (ej: `tripId`)
- Rutas de la API: kebab-case → `/api/trips/{tripId}/expenses`
- Tablas en la base de datos: PascalCase plural → `Trips`, `Expenses`

**DTOs (objetos de transferencia de datos):**
- Request (lo que recibe la API): `CreateTripRequest`, `UpdateExpenseRequest`
- Response (lo que devuelve la API): `TripResponse`, `ExpenseResponse`
- Ubicación: `Bitacora.Application/DTOs/`

**Servicios e interfaces:**
- Interfaz: `ITripService`
- Implementación: `TripService`
- Interfaz en Application, implementación en Application o Infrastructure

**Respuestas de la API:**
Siempre usar este formato para todos los endpoints:
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }   // si salió bien o no
    public T? Data { get; set; }        // los datos que devuelve
    public string? Message { get; set; } // mensaje general
    public List<string> Errors { get; set; } = new(); // lista de errores
}
```

**Manejo de errores:**
- Usar middleware global de excepciones (un solo lugar que atrapa todos los errores)
- Nunca exponer stack traces en producción
- Los mensajes de error al cliente siempre en español

---

## Convenciones del frontend

**Enfoque de diseño:**
- Mobile-first: cada componente se diseña para móvil primero
- Layout de escritorio se agrega en paralelo con breakpoints de Tailwind (md: lg:)
- Usar Tailwind CSS para todos los estilos — sin estilos inline ni CSS modules
- Áreas táctiles amigables (mínimo 44px de altura en elementos interactivos)
- Barra de navegación inferior para móvil, barra lateral izquierda para escritorio
- Botón flotante (+) para crear nuevos ítems en móvil

**Colores en Tailwind:**
Los colores se definen en `src/index.css` usando el bloque `@theme` de Tailwind v4:
```css
@theme {
  --color-primary: #FF6B35;        /* usar: text-primary, bg-primary */
  --color-primary-dark: #e55a27;   /* usar: hover:bg-primary-dark */
  --color-secondary: #1B4FD8;
  --color-accent: #FFD23F;
  --color-accent-dark: #f0c430;
  --color-background: #FAFAF8;
  --color-foreground: #1A1A2E;
  --color-success: #22C55E;
  --color-success-dark: #16a34a;
  --color-error: #EF4444;
  --font-heading: "Nunito", system-ui, sans-serif;  /* usar: font-heading */
  --font-body: "Inter", system-ui, sans-serif;      /* usar: font-body */
}
```
Nunca usar valores hex arbitrarios como `[#FF6B35]` — siempre usar el token nombrado.

**Estructura de componentes:**
- Un componente por archivo
- Componentes de UI compartidos en `src/components/ui/`
- Componentes de página en `src/pages/`
- Hooks personalizados en `src/hooks/`
- Funciones que llaman a la API en `src/services/`

**Manejo de estado:**
- Estado local con useState para casos simples
- Context API para el estado de autenticación
- Sin Redux a menos que la complejidad lo requiera (consultar al usuario primero)

---

## Convenciones de Git

**Ramas:**
- `main` → producción, siempre estable
- `develop` → rama base de desarrollo (se crea una sola vez, nunca se borra)
- `feature/nombre-descriptivo` → una rama por tarea

**Flujo de trabajo (seguir este orden exacto):**
1. Crear rama desde `develop`: `feature/nombre`
2. Desarrollar e implementar
3. Hacer commit con título y descripción (ambos en inglés)
4. El usuario testea y aprueba
5. Mergear a `main`
6. Pushear `main` al repositorio remoto
7. Borrar la rama de feature (local y remota)
8. Actualizar `develop` para que quede igual a `main`
9. Pushear `develop` al repositorio remoto
10. Actualizar tanto CLAUDE.md como CLAUDE.es.md con lo que se construyó

**Formato de commits (siempre título Y descripción, ambos en inglés):**
```
tipo: descripción corta en tiempo presente

Explicación más larga de qué se hizo y por qué.
Lista los cambios principales del commit.
```

Tipos válidos: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`

**Claude Code nunca hace commits automáticamente.** Solo cuando el usuario
lo indica explícitamente. Siempre proponer el título y la descripción antes
de commitear para que el usuario pueda aprobar o ajustar.

---

## Cómo Claude Code explica los cambios

Antes y después de cada cambio, Claude Code debe explicar en términos simples:
- Qué se está creando o modificando y por qué
- Qué hace el archivo o código nuevo, explicado como si fuera a alguien
  que está aprendiendo
- Por qué se eligió este enfoque sobre otras alternativas
- Qué debe ver o testear el usuario después del cambio

Sin tecnicismos sin explicar. Cada concepto nuevo que aparezca debe
explicarse en lenguaje simple.

---

## Comandos útiles

```bash
# Compilar el backend
cd backend && dotnet build

# Correr la API
cd backend/Bitacora.API && dotnet run

# Crear migración (siempre confirmar con el usuario antes de ejecutar)
cd backend && dotnet ef migrations add NombreMigracion \
  --project Bitacora.Infrastructure \
  --startup-project Bitacora.API

# Aplicar migración a Supabase
cd backend && dotnet ef database update \
  --project Bitacora.Infrastructure \
  --startup-project Bitacora.API

# Correr el frontend
cd frontend && npm run dev

# Build del frontend para producción
cd frontend && npm run build
```

---

## Configuración sensible

**Ninguna credencial se commitea al repositorio.**

| Credencial | Desarrollo local | Producción |
|---|---|---|
| Connection string de Supabase | user-secrets en Bitacora.API | Variable de entorno en Railway |
| JWT Secret | user-secrets en Bitacora.API | Variable de entorno en Railway |
| API Key de Anthropic | user-secrets en Bitacora.API | Variable de entorno en Railway |
| API Key de Google Maps | user-secrets en Bitacora.API | Variable de entorno en Railway |
| URL base de la API | .env.local en /frontend | Variable de entorno en Vercel |

El nombre de la connection string en user-secrets y en el código
es siempre `ConnectionStrings:DefaultConnection`.

---

## Despliegue

**Estado: EN VIVO.** Backend en Railway, frontend en Vercel, ambos
desplegados desde `main` y confirmados funcionando de punta a punta
(registro/login probados).

**Backend (Railway)** — https://bitacora-production-839a.up.railway.app
- Root Directory: `backend` (obligatorio — `Bitacora.API` tiene
  `ProjectReference`s relativos a `Bitacora.Application`,
  `Bitacora.Infrastructure` y `Bitacora.Domain`, todos hermanos dentro
  de `backend/`)
- Se construye con `backend/Dockerfile` (multi-stage: restore, publish,
  y corre sobre la imagen de runtime aspnet). Primero se probó con el
  builder Railpack (por defecto en Railway), pero no pudo manejar de
  forma confiable este layout multi-proyecto (supuestos opacos sobre
  copiado de archivos en dos fases que no encajan con `.csproj`
  anidados), así que el build se hizo totalmente explícito
- En Networking → Generate Domain se define un puerto de destino (ej.
  `8080`); Railway inyecta ese valor como variable de entorno `PORT` en
  runtime
- `Program.cs` lee `PORT` y hace que Kestrel escuche en
  `http://0.0.0.0:$PORT` cuando está presente. También omite
  `UseHttpsRedirection()` en Railway, ya que el proxy de borde de
  Railway ya termina el TLS y reenvía HTTP plano — dejar el redirect
  activo provoca un loop de redirecciones
- En cada arranque, `Program.cs` corre `dbContext.Database.Migrate()`
  automáticamente, aplicando cualquier migración pendiente de EF Core
  contra Supabase. No hace falta correr `dotnet ef database update` a
  mano después de cada deploy (sigue siendo necesario en desarrollo
  local)
- **`ConnectionStrings__DefaultConnection` debe usar el connection
  pooler de Supabase** (`aws-1-sa-east-1.pooler.supabase.com:5432`,
  usuario `postgres.<project-ref>`), no el host directo
  (`db.<project-ref>.supabase.co`). El host directo resuelve solo a
  una dirección IPv6, y Railway no tiene salida IPv6, por lo que la
  app crasheaba al arrancar con `Network is unreachable` hasta que se
  cambió esto. El desarrollo local sigue usando el host directo sin
  problema (ahí sí hay salida IPv6)
- Variables de entorno requeridas en Railway: `ASPNETCORE_ENVIRONMENT`,
  `ConnectionStrings__DefaultConnection` (host del pooler, ver arriba),
  `JwtSettings__Secret`, `JwtSettings__Issuer`, `JwtSettings__Audience`,
  `Cors__AllowedOrigins__0` (la URL desplegada de Vercel, sin barra
  final)
- Warnings conocidos y no bloqueantes en los logs: `Cannot load
  library libgssapi_krb5.so.2` (la imagen mínima de aspnet no tiene
  una librería de Kerberos que Npgsql prueba; cae bien igual) y un
  warning de DataProtection keys (las claves no persisten entre
  reinicios del contenedor — inofensivo hoy porque el login usa JWT
  con secreto propio, solo importaría si más adelante se agrega
  reseteo de contraseña o 2FA)

**Frontend (Vercel)** — https://bitacora-travel.vercel.app
- Root Directory: `frontend`
- Framework preset: Vite (autodetectado). Build command `npm run build`,
  output directory `dist`
- Variable de entorno requerida: `VITE_API_URL` (la URL desplegada de
  Railway, sin barra final) — se lee en build time desde cada servicio
  de `src/services/`, así que cambiarla requiere un redeploy
- **`VITE_API_URL` debe incluir el esquema `https://`.** Si se
  configura con un hostname pelado (sin esquema), el navegador lo trata
  como una ruta relativa al propio origen de Vercel en vez de un host
  externo — los pedidos terminan como
  `https://<dominio-vercel>/<hostname-railway>/api/...` y Vercel
  responde 404. Esto ya rompió el registro una vez; si algún pedido a
  la API da 404 con el hostname de Railway apareciendo dentro del path
  en vez de como host, esta es la causa
- Renombrar el proyecto en Vercel (Settings → General → Project Name)
  cambia el subdominio `*.vercel.app` al instante. Hay que actualizar
  `Cors__AllowedOrigins__0` en Railway para que coincida justo después

**Conectar ambos**
- Vercel necesita la URL de Railway en `VITE_API_URL`
- Railway necesita la URL de Vercel en `Cors__AllowedOrigins__0`
- Cada push a `main` dispara un redeploy automático en ambas plataformas

---

## Roadmap de desarrollo

### Fase 1 — Backend ✅ COMPLETO
Todas las entidades con endpoints CRUD completos, auth con ASP.NET Core
Identity + JWT, y exportación a Excel con ClosedXML. Todo terminado.

### Fase 2 — Frontend React ✅ COMPLETA

Los 5 pasos siguientes están listos: tab de itinerario, gestión de
lookups, UI de exportación a Excel, edición de viajes y soporte PWA offline.

**Paso 1 · `feature/itinerary-tab`** *(pequeño)* ✅ HECHO (2026-06-29)

**Paso 2 · `feature/lookup-management`** *(mediano — ALTA PRIORIDAD)* ✅ HECHO (2026-06-29)
Sin esto el usuario no puede crear gastos (no existen categorías ni monedas).
- Página `/settings` accesible desde el header del dashboard
- Tres secciones: Categorías de gasto, Métodos de pago, Monedas
- CRUD completo de cada una (agregar nombre, eliminar)
- Campos de Moneda: code (USD), name (Dólar), symbol ($)
- Enlace desde ExpensesTab cuando las listas están vacías

**Paso 3 · `feature/excel-export-ui`** *(pequeño)* ✅ HECHO (2026-06-30)
- Botón "Exportar Excel" en el header de TripDetailPage
- Llama a `GET /api/trips/{id}/export`, descarga el `.xlsx` via blob response
- Estado de carga mientras se genera el archivo

**Paso 4 · `feature/trip-editing`** *(pequeño)* ✅ HECHO (2026-06-30)
- Botón de edición (ícono lápiz) en el header de TripDetailPage
- Modal reutilizando la misma estructura de NewTripModal
- Llama a `PUT /api/trips/{id}`

**Paso 5 · `feature/pwa`** *(mediano)* ✅ HECHO (2026-06-30)
- Instalar `vite-plugin-pwa`, configurar `manifest.json` (nombre, íconos, colores)
- Estrategia de caché con Workbox: StaleWhileRevalidate para llamadas a la API
- Pre-cache de assets estáticos (JS, CSS, fonts)
- Banner de "instalá la app" en mobile
- Indicador visual cuando el usuario está offline

### Fase 3 — Integraciones

**Paso 6 · `feature/ai-assistant`** *(grande)*
- Widget flotante de chat visible en todas las páginas privadas
- Panel lateral o modal con historial de mensajes
- Endpoint backend `POST /api/ai/chat` que llama a la API de Anthropic con contexto del viaje actual
- El asistente conoce los datos del viaje (gastos, destinos, fechas) para dar sugerencias
- La API key nunca se expone al frontend

**Paso 7 · `feature/google-maps`** *(mediano)*
- Autocomplete con Google Places API al agregar un lugar en CitiesTab
- Completa automáticamente el nombre y el link de Maps al seleccionar un lugar
- El PlaceId de Google se guarda en la base de datos (el campo ya existe)

---

## Lo que Claude Code NO debe hacer

- Usar Minimal APIs (siempre usar controllers)
- Poner lógica de negocio en los controllers (la lógica va en los servicios)
- Hardcodear valores de configuración en el código
- Hacer commits sin que el usuario lo pida explícitamente
- Crear migraciones sin avisar al usuario primero y pedir confirmación
- Exponer la connection string, JWT secret o API keys en ningún archivo
- Agregar dependencias nuevas sin mencionarlo primero
- Saltear la explicación de un cambio antes de implementarlo
- Hacer más de un cambio significativo sin pausar para explicar
- Actualizar CLAUDE.md sin actualizar también CLAUDE.es.md

---

## Registro de progreso

Esta sección se actualiza después de cada merge a main.
Tanto CLAUDE.md como CLAUDE.es.md deben actualizarse juntos.

| Fecha | Rama mergeada | Qué se construyó |
|---|---|---|
| 2026-06-22 | — | Scaffold inicial: estructura de la solución, entidad Trip, EF Core + migración a Supabase, frontend React + Vite |
| 2026-06-23 | feature/auth | Sistema de autenticación completo: ApplicationUser (Identity), AuthService con generación de JWT, interfaz IAuthService, DTOs RegisterRequest/LoginRequest/AuthResponse/ApiResponse, AuthController con endpoints /register /login /me, migración AddIdentityTables aplicada a Supabase |
| 2026-06-23 | feature/trips | CRUD de viajes: entidad Trip actualizada (Description, IsInternational), ITripService, TripService, DTOs CreateTripRequest/UpdateTripRequest/TripResponse, TripsController con endpoints GET/POST/PUT/DELETE (JWT requerido, filtrado por userId), migración AddTripFields aplicada a Supabase |
| 2026-06-23 | feature/lookup-tables | CRUD de tablas de referencia: entidades ExpenseCategory, PaymentMethod, Currency, DTOs compartidos LookupRequest/LookupResponse, DTOs CurrencyRequest/CurrencyResponse, 3 interfaces de servicio, 3 implementaciones de servicio, ExpenseCategoriesController/PaymentMethodsController/CurrenciesController con CRUD completo, migración AddLookupTables aplicada a Supabase |
| 2026-06-25 | feature/expenses | CRUD de gastos: entidad Expense, DTOs CreateExpenseRequest/UpdateExpenseRequest/ExpenseResponse (la respuesta incluye CategoryName, PaymentMethodName, CurrencyCode, CurrencySymbol desnormalizados), IExpenseService, ExpenseService con JOIN LINQ sobre tablas de referencia y validación de pertenencia, ExpensesController bajo api/trips/{tripId}/expenses con CRUD completo (JWT requerido), migración AddExpenses aplicada a Supabase |
| 2026-06-26 | feature/itinerary-items | CRUD de ítems de itinerario: entidad ItineraryItem, DTOs CreateItineraryItemRequest/UpdateItineraryItemRequest/ItineraryItemResponse, IItineraryItemService, ItineraryItemService con validación de pertenencia al viaje, ItineraryItemsController bajo api/trips/{tripId}/itinerary con CRUD completo (JWT requerido), migración AddItineraryItems aplicada a Supabase |
| 2026-06-26 | feature/checklist-items | CRUD de ítems del checklist: entidad ChecklistItem (Status como bool), DTOs CreateChecklistItemRequest/UpdateChecklistItemRequest/ChecklistItemResponse, IChecklistItemService, ChecklistItemService con ToggleStatusAsync y validación de pertenencia al viaje, ChecklistItemsController bajo api/trips/{tripId}/checklist con CRUD + endpoint PATCH toggle, migración AddChecklistItems aplicada a Supabase |
| 2026-06-26 | feature/accommodations | CRUD de alojamientos: entidad Accommodation (Name, Address, City, CheckIn, CheckOut, Observations), DTOs, IAccommodationService, AccommodationService ordenado por CheckIn, AccommodationsController bajo api/trips/{tripId}/accommodations con CRUD completo (JWT requerido), migración AddAccommodations aplicada a Supabase |
| 2026-06-27 | feature/cities | CRUD de ciudades y lugares: entidad City (Name, Order), entidad PlaceToVisit (Name, PlaceId para Google Places, MapsLink, Notes, Visited), DTOs, ICityService/IPlaceToVisitService, CityService (ciudades ordenadas por Order+Name, respuesta incluye lista anidada de Places), PlaceToVisitService con ToggleVisitedAsync, CitiesController bajo api/trips/{tripId}/cities, PlacesToVisitController bajo api/trips/{tripId}/cities/{cityId}/places con CRUD completo + PATCH /visited toggle (JWT requerido), migración AddCitiesAndPlacesToVisit aplicada a Supabase |
| 2026-06-28 | feature/sim-options | CRUD de opciones SIM/eSIM: entidad SimOption (Company, Type, Coverage, Notes, Decided), DTOs, ISimOptionService, SimOptionService con ToggleDecidedAsync y validación de pertenencia al viaje, SimOptionsController bajo api/trips/{tripId}/sim-options con CRUD completo + PATCH /decided toggle (JWT requerido), migración AddSimOptions aplicada a Supabase |
| 2026-06-28 | feature/excel-export | Exportación Excel: ClosedXML 0.105.0 instalado, interfaz IExcelExportService, ExcelExportService con un método por entidad (gastos, itinerario, checklist, alojamientos, ciudades+lugares, sim-options) más ExportTripAsync global que combina todas las hojas en un workbook. ExportController bajo api/trips/{tripId}/export/* con endpoints GET por entidad + GET / para exportación completa del viaje. Encabezados con color primario #FF6B35. La hoja SIM solo se incluye en viajes internacionales. |
| 2026-06-28 | feature/frontend-setup | Base del frontend Fase 2: Tailwind CSS v4 con tokens @theme (primary, secondary, accent, background, foreground, success, error + variantes dark), React Router v7 con rutas /, /login, /register, /dashboard. Google Fonts (Nunito + Inter). LandingPage con hero, grilla de 6 features, banner CTA y footer. LoginPage y RegisterPage con validación de formulario y almacenamiento de JWT. DashboardPage con grilla de viajes, TripCard (fechas, badge, eliminar con confirmación), NewTripModal (nombre, descripción, fechas, toggle internacional), estado vacío, FAB en mobile. authService y tripService como wrappers de axios. CORS habilitado en el backend para localhost:5173. |
| 2026-06-28 | feature/trip-detail | Página de detalle de viaje con header sticky y barra de tabs con scroll horizontal. Tabs implementadas: ChecklistTab (barra de progreso, toggle, eliminar), ExpensesTab (selects de categoría/moneda/método de pago, total acumulado), AccommodationsTab (fechas check-in/check-out, ciudad, dirección), CitiesTab (lista anidada de PlaceToVisit con toggle visitado y link a Maps, formulario inline de agregar lugar por ciudad), SimTab (tipo SIM/eSIM, cobertura, toggle elegida — visible solo en viajes internacionales). Cada tab tiene su propio módulo de servicio en src/services/ y componente en src/tabs/. También se corrigió el error 500 de Npgsql: se agregó AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true) en Program.cs para que los campos DateTime enviados desde inputs HTML de fecha (Kind=Unspecified) sean aceptados por PostgreSQL. |
| 2026-06-29 | feature/itinerary-tab | ItineraryTab: itineraryService.ts con getItinerary/createItineraryItem/deleteItineraryItem conectado a /api/trips/{id}/itinerary. ItineraryTab.tsx muestra los días ordenados por número de día como tarjetas con badge primario (número de día), fecha formateada, ciudad y filas de detalle opcionales para alojamiento, actividades, transporte, vuelo, observaciones y link clickeable. Formulario para agregar nuevos días con todos los campos. Reemplaza el placeholder ComingSoon en TripDetailPage. Todos los tabs del detalle de viaje están completos. |
| 2026-06-29 | feature/lookup-management | Gestión de lookups: lookupService.ts con CRUD completo para categorías de gastos, métodos de pago y monedas. SettingsPage.tsx en /settings con tres secciones (componente LookupSection reutilizable para lookups de nombre, CurrencySection con campos código/símbolo/nombre). Link a /settings agregado en el header del dashboard. ExpensesTab muestra aviso con link a /settings cuando alguna lista de lookup está vacía. |
| 2026-06-30 | feature/excel-export-ui | Excel export UI: exportService.ts llama a GET /api/trips/{id}/export y descarga la respuesta como blob. El header de TripDetailPage tiene un botón "Exportar Excel" con estado de carga mientras se genera el archivo. Se eliminó el componente ComingSoon que quedó sin uso de tabs anteriores (rompía el build de TypeScript). |
| 2026-06-30 | feature/trip-editing | Edición de viajes: se agregó updateTrip() a tripService.ts que llama a PUT /api/trips/{id}. El header de TripDetailPage tiene un botón de lápiz que abre EditTripModal, precargado con los datos actuales del viaje y reutilizando la misma estructura de formulario que NewTripModal del dashboard. |
| 2026-06-30 | feature/trip-menu-navigation | Rediseño de navegación en el detalle de viaje: se reemplazó la barra de tabs horizontal por una pantalla de menú con cards cuadradas (una por sección: Checklist, Gastos, Itinerario, Alojamientos, Ciudades, SIM/eSIM). Al elegir una card se muestra el contenido de esa sección con un botón "Volver al menú" en lugar de la barra de tabs. |
| 2026-06-30 | feature/pwa | Soporte PWA offline: vite-plugin-pwa configurado en vite.config.ts con registro autoUpdate, un manifest (nombre, colores, íconos — reutilizando favicon.svg por ahora) y caché con Workbox (StaleWhileRevalidate para /api/*, CacheFirst para Google Fonts). Se agregaron OfflineBanner (aparece cuando el navegador pierde conexión) e InstallPrompt (banner de instalación en mobile via beforeinstallprompt), montados globalmente en App.tsx. La Fase 2 (frontend React) queda completa. |
| 2026-07-02 | feature/deploy-config, feature/railpack-fix, feature/railpack-fix-2, feature/docker-deploy, feature/fix-timestamp-migration-drift | Primer despliegue a producción: backend en Railway (https://bitacora-production-839a.up.railway.app), frontend en Vercel (https://bitacora-travel.vercel.app). Program.cs ahora hace que Kestrel escuche en la variable de entorno PORT de Railway, omite UseHttpsRedirection detrás del proxy de Railway, y corre Database.Migrate() automáticamente al arrancar. El backend se construye con backend/Dockerfile (multi-stage) después de que el builder Railpack de Railway no pudo manejar el layout multi-proyecto. Se corrigió un drift de migraciones de EF Core preexistente (desfasaje timestamp con/sin zona horaria causado por Npgsql.EnableLegacyTimestampBehavior) que solo salió a la luz cuando las migraciones automáticas empezaron a validar el modelo. La conexión a la base en producción usa el connection pooler de Supabase en vez del host directo (que es solo IPv6 e inalcanzable desde Railway). Confirmado funcionando de punta a punta: registro y login probados exitosamente en producción. |
| 2026-07-02 | feature/fix-pwa-install-prompt | Se corrigió que el banner de "instalá la app" nunca apareciera en mobile. Había dos causas: (1) el manifest solo referenciaba un logo SVG no cuadrado, y Chrome exige íconos reales de 192x192/512x512 para considerar la app instalable, por lo que `beforeinstallprompt` nunca se disparaba — se reemplazó por íconos PNG reales (192, 512 y una variante maskable de 512) en `frontend/public/icons/`, conectados en `vite.config.ts`; (2) Safari en iOS nunca soporta `beforeinstallprompt` — `InstallPrompt.tsx` ahora detecta iOS y muestra instrucciones manuales de "Compartir > Agregar a inicio", usando un nuevo `apple-touch-icon` referenciado desde `index.html`. El banner también se omite ahora si la app ya está corriendo instalada (modo standalone). |
| 2026-07-02 | feature/fix-spa-routing-vercel | Se corrigió un 404 al abrir la PWA instalada desde el ícono en la pantalla de inicio de iOS. Causa: iOS abre el `start_url` del manifest (`/dashboard`) como un pedido nuevo directo al servidor, a diferencia de la navegación dentro del navegador que llega ahí vía React Router del lado del cliente — Vercel no tenía ninguna regla de reescritura y respondía 404 en cualquier ruta sin archivo estático coincidente. Se agregó `frontend/vercel.json` con una reescritura catch-all (`/(.*) → /index.html`) para que todas las rutas del lado del cliente resuelvan bien sin importar por dónde se entre. |
