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
Define the palette in `tailwind.config.js` under `theme.extend.colors`:
```js
colors: {
  primary: '#FF6B35',
  secondary: '#1B4FD8',
  accent: '#FFD23F',
  background: '#FAFAF8',
  foreground: '#1A1A2E',
}
```

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

## Development roadmap

### Phase 1 — Complete backend (current priority)
All entities with full CRUD endpoints, auth with ASP.NET Core Identity
+ JWT, and Excel export with ClosedXML.

Suggested order:
1. Auth (register, login, JWT, refresh token)
2. Trips (CRUD, IsInternational flag)
3. Lookup tables (ExpenseCategory, PaymentMethod, Currency)
4. Expenses
5. ItineraryItems
6. ChecklistItems
7. Accommodations
8. Cities + PlacesToVisit
9. SimOptions
10. Excel export (one endpoint per entity + one global per trip)

### Phase 2 — React frontend
API consumption, module UI, Tailwind CSS with travel color palette,
PWA with vite-plugin-pwa, mobile-first responsive design,
landing page, auth screens, offline support with service workers.

### Phase 3 — Integrations
AI assistant with Anthropic API (server-side),
Google Maps/Places API, full offline sync.

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
