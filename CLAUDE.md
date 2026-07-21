# Bitácora — CLAUDE.md

Reference document for Claude Code. Read this file completely before writing
any code or executing any command. After every merge to main, update both
this file (CLAUDE.md) and its Spanish translation (CLAUDE.es.md) to reflect
the latest changes made.

---

## What is this project

Bitácora is a personal travel organizer web app (PWA — Progressive Web App).
It allows users to create trips and manage within each one: expenses with
multi-currency support, daily itinerary, essential checklist, accommodations,
cities with places to visit, and SIM/eSIM chip options. It includes Excel
export and an integrated AI assistant.

The app is designed primarily for international long-distance trips but is
also fully usable for short domestic trips within Argentina. Some features
are context-sensitive:
- SIM/eSIM options: only relevant for international trips
- Multi-currency: only relevant for international trips; domestic trips
  default to ARS (Argentine pesos)
- These sections should be hidden or marked as optional for domestic trips

The app is designed mobile-first. Every screen must work perfectly on a
smartphone (primary use case: traveling). Desktop layout is built in
parallel but is secondary priority.

---

## Offline support (PWA)

The app must work without internet connection. This is a core requirement
because users will be traveling and often have poor or no signal.

**How it works:**
- When the user opens the app with internet, all their trip data is saved
  locally on the device using the browser's cache
- If internet is lost, the user can still view and edit all their data
- When internet returns, the app syncs changes automatically
- This is implemented with vite-plugin-pwa + service workers + local cache

**What works offline:**
- View all trips, expenses, itinerary, checklist, accommodations, cities
- Add and edit expenses, checklist items, and notes
- View the full itinerary

**What requires internet:**
- AI assistant (calls Anthropic API)
- Google Maps place search
- Login and registration
- Syncing data to the server

---

## Visual design

The aesthetic is colorful, warm, and travel-inspired. Think adventure,
movement, and energy — similar to apps like Polarsteps or Google Trips.

**Color palette:**
- Primary: warm orange `#FF6B35` — energy, adventure
- Secondary: deep sky blue `#1B4FD8` — sky, ocean, long journeys
- Accent: golden yellow `#FFD23F` — sun, exotic destinations
- Background: off-white `#FAFAF8` — clean but not cold
- Text: dark navy `#1A1A2E`
- Success: `#22C55E`
- Error: `#EF4444`

**Typography:**
- Headings and titles: `Nunito` (rounded, friendly)
- Body text and UI: `Inter` (clean, readable)
- Both loaded from Google Fonts

**Mobile UI patterns:**
- Bottom navigation bar with icons (mobile)
- Large touch-friendly cards for trip items
- Floating action button (+) for adding new items
- Colorful category badges on expenses
- Flag emoji or destination photo on trip cards

**Desktop UI patterns:**
- Left sidebar navigation
- Two or three column layouts where appropriate
- Same color palette, larger spacing

---

## Screen structure

```
Landing Page (public)
  └── Hero: "Organize your next adventure" — sell the product, call to action
      Features section, screenshots, register button
Login / Register Page (public)
  └── Email + password, clean mobile form
Dashboard (private)
  └── List of user's trips (cards with destination, dates, status)
    └── Trip Detail
          ├── Expenses
          ├── Itinerary
          ├── Checklist (Essentials)
          ├── Accommodations
          ├── Cities & Places
          ├── SIM/eSIM (international trips only)
          └── Export to Excel
```

---

## Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 10 Web API with controllers |
| ORM | Entity Framework Core 10 + Npgsql |
| Database | PostgreSQL on Supabase |
| Auth | ASP.NET Core Identity + JWT Bearer |
| Excel Export | ClosedXML |
| AI | Anthropic API (server-side only, never exposed to frontend) |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| PWA / Offline | vite-plugin-pwa + Workbox service workers |
| API Deploy | Railway |
| Frontend Deploy | Vercel |

---

## Folder structure

```
bitacora/
├── CLAUDE.md          ← this file (English)
├── CLAUDE.es.md       ← Spanish translation, always kept in sync
├── README.md
├── .gitignore
├── backend/
│   ├── Bitacora.sln
│   ├── Bitacora.API/            ← controllers, Program.cs, config
│   ├── Bitacora.Application/    ← interfaces, services, DTOs
│   ├── Bitacora.Domain/         ← pure entities, no external dependencies
│   └── Bitacora.Infrastructure/ ← EF Core, DbContext, implementations
└── frontend/
    └── src/
        ├── components/
        │   └── ui/              ← shared reusable components
        ├── pages/
        ├── hooks/
        ├── services/            ← API call functions
        └── types/
```

---

## Architecture

Clean Architecture with four layers. Dependencies only point inward:

```
API → Application → Domain
Infrastructure → Application → Domain
```

**Rules that are never broken:**
- Domain does not import anything external (no EF, no Npgsql, no third-party packages)
- Application only imports Domain
- Infrastructure implements interfaces defined in Application
- The Anthropic API key and connection string never touch the frontend
- All API keys live server-side only

---

## Domain model

All entities include `UserId` and `TripId` from day one to support
multi-user even if auth is implemented later.

```
User (ASP.NET Core Identity)
└── Trip
    ├── Expense
    ├── ItineraryItem
    ├── ChecklistItem
    ├── Accommodation
    ├── City
    │   └── PlaceToVisit
    └── SimOption (international trips only)
```

### Entities

**Trip**
- Id, Name, Description, StartDate, EndDate, IsInternational (bool),
  CreatedAt, UserId

**Expense**
- Id, TripId, CategoryId, Description, City, PaymentDate,
  PaymentMethodId, CurrencyId, Amount, ExchangeRate,
  Observations, CreatedAt, UserId

**ItineraryItem**
- Id, TripId, Date, DayNumber, City, Accommodation, Activities,
  Transport, Flight, Observations, Link, CreatedAt, UserId

**ChecklistItem**
- Id, TripId, Item, Status, Order, CreatedAt, UserId

**Accommodation**
- Id, TripId, Name, Address, City, CheckIn, CheckOut,
  Observations, CreatedAt, UserId

**City**
- Id, TripId, Name, Order, CreatedAt, UserId

**PlaceToVisit**
- Id, CityId, Name, PlaceId (Google), MapsLink, Notes,
  Visited, CreatedAt, UserId

**SimOption** (shown only when Trip.IsInternational = true)
- Id, TripId, Company, Type (SIM/eSIM), Coverage, Notes,
  Decided (bool), CreatedAt, UserId

### Lookup tables (user-configurable values)

- ExpenseCategory (Id, Name, UserId)
- PaymentMethod (Id, Name, UserId)
- Currency (Id, Code, Name, Symbol, UserId)

These tables allow the user to add their own categories, payment methods,
and currencies instead of having hardcoded values.

For domestic trips (IsInternational = false), the default currency is
ARS and multi-currency fields are hidden in the UI.

---

## Coding conventions

**Language:**
- Code, classes, methods, variables, comments: English
- Error messages returned by the API: Spanish
- Commit title and description: English
- Console logs for debugging: English

**Naming:**
- Classes and methods: PascalCase
- Local variables and parameters: camelCase
- API routes: kebab-case → `/api/trips/{tripId}/expenses`
- Database tables: PascalCase plural → `Trips`, `Expenses`

**DTOs:**
- Request: `CreateTripRequest`, `UpdateExpenseRequest`
- Response: `TripResponse`, `ExpenseResponse`
- Location: `Bitacora.Application/DTOs/`

**Services and interfaces:**
- Interface: `ITripService`
- Implementation: `TripService`
- Interface in Application, implementation in Application or Infrastructure

**API Responses:**
Always use this wrapper for all endpoints:
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();
}
```

**Error handling:**
- Use global exception middleware
- Never expose stack traces in production
- Error messages sent to the client are always in Spanish

---

## Frontend conventions

**Design approach:**
- Mobile-first: every component is designed for mobile screen first
- Desktop layout is added in parallel using responsive breakpoints (Tailwind md: lg:)
- Use Tailwind CSS for all styling — no inline styles, no CSS modules
- Touch-friendly tap targets (minimum 44px height on interactive elements)
- Bottom navigation bar for mobile, left sidebar for desktop
- Floating action button (+) for creating new items on mobile

**Color usage in Tailwind:**
Colors are defined in `src/index.css` using Tailwind v4 `@theme` block:
```css
@theme {
  --color-primary: #FF6B35;        /* use: text-primary, bg-primary */
  --color-primary-dark: #e55a27;   /* use: hover:bg-primary-dark */
  --color-secondary: #1B4FD8;
  --color-accent: #FFD23F;
  --color-accent-dark: #f0c430;
  --color-background: #FAFAF8;
  --color-foreground: #1A1A2E;
  --color-success: #22C55E;
  --color-success-dark: #16a34a;
  --color-error: #EF4444;
  --font-heading: "Nunito", system-ui, sans-serif;  /* use: font-heading */
  --font-body: "Inter", system-ui, sans-serif;      /* use: font-body */
}
```
Never use arbitrary hex values like `[#FF6B35]` — always use the named token.

**Component structure:**
- One component per file
- Shared UI components in `src/components/ui/`
- Page components in `src/pages/`
- Custom hooks in `src/hooks/`
- API call functions in `src/services/`

**State management:**
- Local state with useState for simple cases
- Context API for auth state
- No Redux unless complexity requires it (ask user first)

---

## Git conventions

**Branches:**
- `main` → production, always stable
- `develop` → base development branch (created once, never deleted)
- `feature/descriptive-name` → one branch per task

**Workflow (must follow this exact order):**
1. Create branch from `develop`: `feature/name`
2. Develop and implement
3. Commit with title and description (both in English)
4. User tests and approves
5. Merge to `main`
6. Push `main` to remote
7. Delete the feature branch (local and remote)
8. Update `develop` to match `main`
9. Push `develop` to remote
10. Update both CLAUDE.md and CLAUDE.es.md to reflect what was built

**Commit format (always title AND description, both in English):**
```
type: short description in present tense

Longer explanation of what was done and why.
List the main changes made in this commit.
```

Valid types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`

**Claude Code never commits automatically.** Only when the user
explicitly says to commit. Always propose the title and description
before committing so the user can approve or adjust.

---

## How Claude Code explains changes

Before and after every change, Claude Code must explain in simple terms:
- What is being created or modified and why
- What the new file or code does, explained as if to someone learning
- Why this approach was chosen over alternatives
- What the user should see or test after the change

No technical jargon without explanation. Every concept introduced
must be explained in plain language.

---

## Useful commands

```bash
# Build backend
cd backend && dotnet build

# Run the API
cd backend/Bitacora.API && dotnet run

# Create migration (always confirm with user before running)
cd backend && dotnet ef migrations add MigrationName \
  --project Bitacora.Infrastructure \
  --startup-project Bitacora.API

# Apply migration to Supabase
cd backend && dotnet ef database update \
  --project Bitacora.Infrastructure \
  --startup-project Bitacora.API

# Run frontend
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build
```

---

## Sensitive configuration

**No credentials are ever committed to the repository.**

| Credential | Local development | Production |
|---|---|---|
| Supabase connection string | user-secrets in Bitacora.API | Environment variable in Railway |
| JWT Secret | user-secrets in Bitacora.API | Environment variable in Railway |
| Anthropic API Key | user-secrets in Bitacora.API | Environment variable in Railway |
| Google Maps API Key | user-secrets in Bitacora.API | Environment variable in Railway |
| API base URL | .env.local in /frontend | Environment variable in Vercel |

The connection string key name in user-secrets and in code
is always `ConnectionStrings:DefaultConnection`.

---

## Deployment

**Status: LIVE.** Backend on Railway, frontend on Vercel, both deployed
from `main` and confirmed working end to end (register/login tested).

**Backend (Railway)** — https://bitacora-production-839a.up.railway.app
- Root Directory: `backend` (required — `Bitacora.API` has relative
  `ProjectReference`s to `Bitacora.Application`, `Bitacora.Infrastructure`,
  and `Bitacora.Domain`, all siblings inside `backend/`)
- Built via `backend/Dockerfile` (multi-stage: restore, publish, run on
  the aspnet runtime image). Railway's default Railpack builder was
  tried first but couldn't reliably handle this multi-project layout
  (opaque two-phase file-copy/caching assumptions that don't fit
  nested `.csproj` files), so the build was made fully explicit instead
- Networking → Generate Domain sets a target port (e.g. `8080`); Railway
  injects that value as the `PORT` env var at runtime
- `Program.cs` reads `PORT` and binds Kestrel to `http://0.0.0.0:$PORT`
  when present. It also skips `UseHttpsRedirection()` on Railway, since
  Railway's edge proxy already terminates TLS and forwards plain HTTP —
  keeping the redirect on causes a redirect loop
- On every startup, `Program.cs` runs `dbContext.Database.Migrate()`
  automatically, applying any pending EF Core migrations against
  Supabase. No manual `dotnet ef database update` step needed after
  deploy (still required for local development)
- **`ConnectionStrings__DefaultConnection` must use Supabase's
  connection pooler host** (`aws-1-sa-east-1.pooler.supabase.com:5432`,
  username `postgres.<project-ref>`), not the direct `db.<project-ref
  >.supabase.co` host. The direct host resolves to an IPv6-only
  address and Railway has no IPv6 egress, so the app crashed on
  startup with `Network is unreachable` until this was switched.
  Local development still uses the direct host fine (IPv6 works there)
- Required environment variables in Railway: `ASPNETCORE_ENVIRONMENT`,
  `ConnectionStrings__DefaultConnection` (pooler host, see above),
  `JwtSettings__Secret`, `JwtSettings__Issuer`, `JwtSettings__Audience`,
  `Cors__AllowedOrigins__0` (the deployed Vercel URL, no trailing slash)
- Known non-blocking warnings in the logs: `Cannot load library
  libgssapi_krb5.so.2` (the minimal aspnet image lacks a Kerberos lib
  Npgsql probes for; falls back fine) and a DataProtection keys warning
  (keys aren't persisted across container restarts — harmless today
  since login uses JWT with its own secret, would only matter if
  password-reset/2FA tokens are added later)

**Frontend (Vercel)** — https://bitacora-travel.vercel.app
- Root Directory: `frontend`
- Framework preset: Vite (auto-detected). Build command `npm run build`,
  output directory `dist`
- Required environment variable: `VITE_API_URL` (the deployed Railway
  URL, no trailing slash) — read at build time by every service in
  `src/services/`, so changing it requires a redeploy
- **`VITE_API_URL` must include the `https://` scheme.** Setting it to
  a bare hostname (no scheme) makes the browser treat it as a relative
  path on Vercel's own origin instead of an external host — requests
  end up as `https://<vercel-domain>/<railway-hostname>/api/...` and
  Vercel 404s them. This broke registration once already; if API calls
  ever 404 with the Railway hostname appearing inside the request path
  instead of as the host, this is the cause
- Renaming the Vercel project (Settings → General → Project Name)
  changes the `*.vercel.app` subdomain immediately. `Cors__AllowedOrigins__0`
  in Railway must be updated to match right after

**Connecting the two**
- Vercel needs Railway's URL in `VITE_API_URL`
- Railway needs Vercel's URL in `Cors__AllowedOrigins__0`
- Every push to `main` triggers an automatic redeploy on both platforms

---

## Development roadmap

### Phase 1 — Backend ✅ COMPLETE
All entities with full CRUD endpoints, auth with ASP.NET Core Identity + JWT,
and Excel export with ClosedXML. Everything is done.

### Phase 2 — React frontend ✅ COMPLETE

All 5 steps below are done: itinerary tab, lookup management, Excel
export UI, trip editing, and PWA offline support.

**Step 1 · `feature/itinerary-tab`** *(small)* ✅ DONE (2026-06-29)

**Step 2 · `feature/lookup-management`** *(medium — HIGH PRIORITY)* ✅ DONE (2026-06-29)
Without this the user cannot create expenses (no categories or currencies exist).
- Page `/settings` accessible from the dashboard header
- Three sections: Expense categories, Payment methods, Currencies
- Full CRUD for each (add name, delete)
- Currency fields: code (USD), name (Dollar), symbol ($)
- Link from ExpensesTab when lists are empty

**Step 3 · `feature/excel-export-ui`** *(small)* ✅ DONE (2026-06-30)
- "Export Excel" button in the TripDetailPage header
- Calls `GET /api/trips/{id}/export`, downloads `.xlsx` via blob response
- Loading state while the file is generated

**Step 4 · `feature/trip-editing`** *(small)* ✅ DONE (2026-06-30)
- Edit button (pencil icon) in the TripDetailPage header
- Modal reusing the same structure as NewTripModal
- Calls `PUT /api/trips/{id}`

**Step 5 · `feature/pwa`** *(medium)* ✅ DONE (2026-06-30)
- Install `vite-plugin-pwa`, configure `manifest.json` (name, icons, colors)
- Workbox caching strategy: StaleWhileRevalidate for API calls
- Pre-cache of static assets (JS, CSS, fonts)
- "Install app" banner on mobile
- Visual indicator when the user is offline

### Phase 3 — Integrations

**Step 6 · `feature/ai-assistant`** *(large)*
- Floating chat widget visible on all private pages
- Side panel or modal with message history
- Backend endpoint `POST /api/ai/chat` calling Anthropic API with current trip context
- Assistant knows trip data (expenses, destinations, dates) to give suggestions
- API key never exposed to the frontend

**Step 7 · `feature/google-maps`** *(medium)*
- Autocomplete with Google Places API when adding a place in CitiesTab
- Auto-fills name and Maps link on place selection
- Google PlaceId saved to the database (field already exists)

---

## What Claude Code must NOT do

- Use Minimal APIs (always use controllers)
- Put business logic in controllers (logic goes in services)
- Hardcode any configuration values in code
- Commit without the user explicitly requesting it
- Create migrations without warning the user first and asking for confirmation
- Expose connection string, JWT secret, or API keys in any file
- Add new dependencies without mentioning it first
- Skip explaining a change before implementing it
- Make more than one significant change without pausing to explain
- Update CLAUDE.md without also updating CLAUDE.es.md

---

## Progress log

This section is updated after every merge to main.
Both CLAUDE.md and CLAUDE.es.md must be updated together.

| Date | Branch merged | What was built |
|---|---|---|
| 2026-06-22 | — | Initial scaffold: solution structure, Trip entity, EF Core + Supabase migration, React + Vite frontend |
| 2026-06-23 | feature/auth | Complete authentication system: ApplicationUser (Identity), AuthService with JWT generation, IAuthService interface, RegisterRequest/LoginRequest/AuthResponse/ApiResponse DTOs, AuthController with /register /login /me endpoints, AddIdentityTables migration applied to Supabase |
| 2026-06-23 | feature/trips | Trips CRUD: Trip entity updated (Description, IsInternational), ITripService, TripService, CreateTripRequest/UpdateTripRequest/TripResponse DTOs, TripsController with GET/POST/PUT/DELETE endpoints (JWT required, filtered by userId), AddTripFields migration applied to Supabase |
| 2026-06-23 | feature/lookup-tables | Lookup tables CRUD: ExpenseCategory, PaymentMethod, Currency domain entities, shared LookupRequest/LookupResponse DTOs, CurrencyRequest/CurrencyResponse DTOs, 3 service interfaces, 3 service implementations, ExpenseCategoriesController/PaymentMethodsController/CurrenciesController with full CRUD, AddLookupTables migration applied to Supabase |
| 2026-06-25 | feature/expenses | Expenses CRUD: Expense domain entity, CreateExpenseRequest/UpdateExpenseRequest/ExpenseResponse DTOs (response includes denormalized CategoryName, PaymentMethodName, CurrencyCode, CurrencySymbol), IExpenseService, ExpenseService with LINQ JOIN across lookup tables and ownership validation, ExpensesController under api/trips/{tripId}/expenses with full CRUD (JWT required), AddExpenses migration applied to Supabase |
| 2026-06-26 | feature/itinerary-items | Itinerary items CRUD: ItineraryItem domain entity, CreateItineraryItemRequest/UpdateItineraryItemRequest/ItineraryItemResponse DTOs, IItineraryItemService, ItineraryItemService with trip ownership validation, ItineraryItemsController under api/trips/{tripId}/itinerary with full CRUD (JWT required), AddItineraryItems migration applied to Supabase |
| 2026-06-26 | feature/checklist-items | Checklist items CRUD: ChecklistItem domain entity (Status as bool), CreateChecklistItemRequest/UpdateChecklistItemRequest/ChecklistItemResponse DTOs, IChecklistItemService, ChecklistItemService with ToggleStatusAsync and trip ownership validation, ChecklistItemsController under api/trips/{tripId}/checklist with CRUD + PATCH toggle endpoint, AddChecklistItems migration applied to Supabase |
| 2026-06-26 | feature/accommodations | Accommodations CRUD: Accommodation domain entity (Name, Address, City, CheckIn, CheckOut, Observations), DTOs, IAccommodationService, AccommodationService ordered by CheckIn, AccommodationsController under api/trips/{tripId}/accommodations with full CRUD (JWT required), AddAccommodations migration applied to Supabase |
| 2026-06-27 | feature/cities | Cities and PlacesToVisit CRUD: City domain entity (Name, Order), PlaceToVisit domain entity (Name, PlaceId for Google Places, MapsLink, Notes, Visited), DTOs, ICityService/IPlaceToVisitService, CityService (cities ordered by Order+Name, response includes nested Places list), PlaceToVisitService with ToggleVisitedAsync, CitiesController under api/trips/{tripId}/cities, PlacesToVisitController under api/trips/{tripId}/cities/{cityId}/places with full CRUD + PATCH /visited toggle (JWT required), AddCitiesAndPlacesToVisit migration applied to Supabase |
| 2026-06-28 | feature/sim-options | SimOptions CRUD: SimOption domain entity (Company, Type, Coverage, Notes, Decided), DTOs, ISimOptionService, SimOptionService with ToggleDecidedAsync and trip ownership validation, SimOptionsController under api/trips/{tripId}/sim-options with full CRUD + PATCH /decided toggle (JWT required), AddSimOptions migration applied to Supabase |
| 2026-06-28 | feature/excel-export | Excel export: ClosedXML 0.105.0 installed, IExcelExportService interface, ExcelExportService with one method per entity (expenses, itinerary, checklist, accommodations, cities+places, sim-options) plus ExportTripAsync global that combines all sheets in one workbook. ExportController under api/trips/{tripId}/export/* with GET endpoints per entity + GET / for full trip export. Headers styled with primary color #FF6B35. SIM sheet only included for international trips. |
| 2026-06-28 | feature/frontend-setup | Phase 2 frontend foundation: Tailwind CSS v4 with @theme tokens (primary, secondary, accent, background, foreground, success, error + dark variants), React Router v7 with routes for /, /login, /register, /dashboard. Google Fonts (Nunito + Inter). LandingPage with hero, 6-feature grid, CTA banner, footer. LoginPage and RegisterPage with form validation and JWT storage. DashboardPage with trip list grid, TripCard (dates, badge, delete with confirm), NewTripModal (name, description, dates, international toggle), empty state, FAB on mobile. authService and tripService as axios wrappers. CORS enabled on backend for localhost:5173. |
| 2026-06-28 | feature/trip-detail | Trip detail page with sticky header and horizontal scrollable tab bar. Tabs implemented: ChecklistTab (progress bar, toggle, delete), ExpensesTab (category/currency/payment method selects, running total), AccommodationsTab (check-in/check-out dates, city, address), CitiesTab (nested PlaceToVisit list with visited toggle and Maps link, inline add-place form per city), SimTab (SIM/eSIM type, coverage, decided toggle — shown only on international trips). Each tab has its own service module in src/services/ and component in src/tabs/. Also fixed Npgsql 500 error: added AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true) in Program.cs so DateTime fields from HTML date inputs (Kind=Unspecified) are accepted by PostgreSQL. |
| 2026-06-29 | feature/itinerary-tab | ItineraryTab: itineraryService.ts with getItinerary/createItineraryItem/deleteItineraryItem connected to /api/trips/{id}/itinerary. ItineraryTab.tsx displays days sorted by dayNumber as cards with a colored primary badge (day number), formatted date, city, and optional detail rows for accommodation, activities, transport, flight, observations, and a clickable link. Form to add new days with all fields. Replaced ComingSoon placeholder in TripDetailPage. All trip detail tabs are now complete. |
| 2026-06-29 | feature/lookup-management | Lookup management: lookupService.ts with full CRUD for expense categories, payment methods, and currencies. SettingsPage.tsx at /settings with three sections (LookupSection reusable component for name-only lookups, CurrencySection with code/symbol/name fields). Link to /settings added to dashboard header. ExpensesTab shows a warning with link to /settings when any lookup list is empty. |
| 2026-06-30 | feature/excel-export-ui | Excel export UI: exportService.ts calls GET /api/trips/{id}/export and downloads the response as a blob. TripDetailPage header has an "Export Excel" button with a loading state while the file is generated. Removed the unused ComingSoon component left over from earlier tabs (was breaking the TypeScript build). |
| 2026-06-30 | feature/trip-editing | Trip editing: updateTrip() added to tripService.ts calling PUT /api/trips/{id}. TripDetailPage header has a pencil button that opens EditTripModal, prefilled with the trip's current data and reusing the same form structure as DashboardPage's NewTripModal. |
| 2026-06-30 | feature/trip-menu-navigation | Trip detail navigation redesign: replaced the horizontal tab bar with a menu screen of square cards (one per section: Checklist, Gastos, Itinerario, Alojamientos, Ciudades, SIM/eSIM). Selecting a card shows that section's content with a "Volver al menu" button in place of the tab bar. |
| 2026-06-30 | feature/pwa | PWA offline support: vite-plugin-pwa configured in vite.config.ts with autoUpdate registration, a manifest (name, colors, icons — currently reusing favicon.svg), and Workbox runtime caching (StaleWhileRevalidate for /api/*, CacheFirst for Google Fonts). Added OfflineBanner (shown when the browser goes offline) and InstallPrompt (mobile install banner via beforeinstallprompt), both mounted globally in App.tsx. Phase 2 (React frontend) is now complete. |
| 2026-07-02 | feature/deploy-config, feature/railpack-fix, feature/railpack-fix-2, feature/docker-deploy, feature/fix-timestamp-migration-drift | First production deploy: backend on Railway (https://bitacora-production-839a.up.railway.app), frontend on Vercel (https://bitacora-travel.vercel.app). Program.cs now binds Kestrel to the Railway PORT env var, skips UseHttpsRedirection behind Railway's proxy, and runs Database.Migrate() automatically on startup. Backend builds via backend/Dockerfile (multi-stage) after Railway's Railpack builder couldn't handle the multi-project layout. Fixed a pre-existing EF Core migration drift (timestamp with/without time zone mismatch caused by Npgsql.EnableLegacyTimestampBehavior) that only surfaced once automatic migrations started validating the model. Production DB connection uses Supabase's connection pooler host instead of the direct host (which is IPv6-only and unreachable from Railway). Confirmed working end to end: registration and login tested successfully in production. |
| 2026-07-02 | feature/fix-pwa-install-prompt | Fixed the "install app" banner never appearing on mobile. Root cause was two-fold: (1) the manifest only referenced a non-square SVG logo, and Chrome requires real 192x192/512x512 icons to consider the app installable, so `beforeinstallprompt` never fired — replaced with proper PNG icons (192, 512, and a maskable 512 variant) under `frontend/public/icons/`, wired into `vite.config.ts`; (2) iOS Safari never supports `beforeinstallprompt` at all — `InstallPrompt.tsx` now detects iOS and shows manual "Share > Add to Home Screen" instructions instead, using a new `apple-touch-icon` referenced from `index.html`. The banner also now skips itself when the app is already running in standalone (installed) mode. |
| 2026-07-02 | feature/fix-spa-routing-vercel | Fixed a 404 when launching the installed PWA from the iOS home screen icon. Root cause: iOS opens the manifest's `start_url` (`/dashboard`) as a fresh top-level server request, unlike in-browser navigation which reaches it via client-side React Router — Vercel had no rewrite rule and 404'd on any path without a matching static file. Added `frontend/vercel.json` with a catch-all rewrite (`/(.*) → /index.html`) so all client-side routes resolve correctly regardless of entry point. |
| 2026-07-02 | feature/password-visibility-toggle | Added a show/hide eye icon to all password fields. New reusable `PasswordInput` component (`frontend/src/components/ui/PasswordInput.tsx`) toggles the input between `type="password"` and `type="text"`, used on LoginPage and RegisterPage (both the password and repeat-password fields). |
| 2026-07-03 | feature/date-picker-same-month | Paired date pickers now land on the same month/year: new `alignEndDate()` util (`frontend/src/utils/dates.ts`) copies the start date onto the end date whenever the end date is empty or now invalid. Applied to trip start/end date (NewTripModal and EditTripModal in DashboardPage.tsx/TripDetailPage.tsx) and accommodation check-in/check-out (AccommodationsTab.tsx), so opening the second date picker no longer jumps to today's month. |
| 2026-07-20 | feature/pwa-icons | Registered the app icon set in `frontend/public/icons/`: new `android-chrome-192x192.png`, `android-chrome-512x512.png`, `favicon-16x16.png`, `favicon-32x32.png`, and an updated `apple-touch-icon.png`. `frontend/index.html` now links `favicon-32x32.png`/`favicon-16x16.png` as the browser tab icon; the `favicon.svg` `<link>` was removed so the new PNG actually renders (browsers prefer SVG over PNG whenever both are declared). The `vite-plugin-pwa` install manifest (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`) was left untouched to avoid a duplicate/competing manifest. |
| 2026-07-20 | feature/fix-icon-padding | Fixed a white border visible around the apple-touch-icon on iOS home screens: the source icon files had a white margin baked in around the icon graphic (5-8% of the canvas). Cropped the padding and rescaled the content to fill the full canvas edge to edge in `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `favicon-32x32.png`, and `favicon-16x16.png`. |
| 2026-07-20 | feature/title-icon | Added the app icon next to the "Bitácora ✈️" title wherever it's used as a styled logo. New shared `AppTitle` component (`frontend/src/components/ui/AppTitle.tsx`, `size` prop for the two font sizes in use) renders `favicon-32x32.png` inline with the text. Replaces the duplicated title `<span>` in `LandingPage.tsx` (nav), `LoginPage.tsx`/`RegisterPage.tsx` (logo above the form), and `DashboardPage.tsx` (header). Plain-text mentions of "Bitácora" elsewhere (footer, install prompt, landing copy) were left unchanged since they aren't the styled title. |
