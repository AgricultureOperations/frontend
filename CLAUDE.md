# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Pattern

AgriOps Web is a React 18 + TypeScript (strict) + Vite client for the AgriOps platform. It follows a **domain-driven, feature-first architecture with clean separation between UI, business logic, and API layers**, using **Redux Toolkit** for global state management.

Dependencies between layers go in one direction only: **UI (pages/components) → hooks (business logic) → Redux slices/thunks (state) → API functions → axios instances**.
- Components and pages only present data. They never call APIs or axios directly.
- Hooks handle form state, Yup validation, dispatching, and navigation.
- Slices hold state (`{ data, loading, error }`) and async thunks. They never navigate.
- API functions are thin, typed wrappers that return `response.data`.

## Commands

```bash
npm ci                 # install (CI and Docker use this; package-lock.json is authoritative)
npm run dev            # Vite dev server
npm run build          # tsc type-check + vite build → dist/
npm run preview        # serve the built dist/
npm run lint           # ESLint, --max-warnings 0 (any warning fails)
npm test               # Vitest (watch locally; single run in CI)
npm run test:only      # Vitest single run
npm run test:e2e       # Playwright visual regression (tests/), see tests/README.md
npm run test:e2e:update # regenerate the screenshot baselines after an intended design change
npm run test:ui        # Vitest UI
npm run coverage       # coverage report → coverage/
npx vitest run test/api/bitacora.api.spec.ts   # single file
npx vitest run -t "should be configured"        # single test by name
docker build -t agriops-web . && docker run -p 5173:8080 agriops-web
```

`tsconfig` has `noUnusedLocals`/`noUnusedParameters`, so unused code breaks `npm run build`. Vitest runs with `jsdom` and globals (see `vite.config.ts`).

## Folder Responsibilities

| Path | Responsibility |
|---|---|
| `src/api/` | `createAxiosApi` factory plus one instance per backend (`bitacoraApi`, `orderApi`). Interceptors add `Bearer <token>` from `localStorage`. On a 401 (except login) they clear the token and redirect to `/login`. |
| `src/features/<domain>/apis/` | Endpoint calls using an instance (paths include `/api/v1/...`). |
| `src/features/<domain>/states/` | RTK slices and `createAsyncThunk`s. Axios errors map to `rejectWithValue(response.data.message \|\| "Something went wrong")`. |
| `src/features/<domain>/hooks/` | Business logic consumed by pages (`useLogin`, `useOrdersTable`, …). |
| `src/features/<domain>/components/`, `pages/` | Presentational UI. `pages/index.ts` re-exports default pages as named exports, and the feature's `index.ts` exposes only pages. |
| `src/features/<domain>/interfaces/`, `validations/` | Request/response types and Yup schemas. |
| `src/store/` | `store.ts` registers every slice (`auth`, `register`, `orders`). Always use the typed `useAppDispatch`/`useAppSelector` from `hooks.ts`. |
| `src/routes/` | `ProtectedRoute` checks `localStorage.token` (not Redux). Routes are declared in `App.tsx`. |
| `src/shared/components/` | Reusable UI (Spinner, SharedError, CustomInput, Menu, …). |
| `src/styles/` | SCSS tokens (`_variables.scss`, colors named by role + intensity, e.g. `$error-500`), `_mixins.scss`, globals. CSS modules go in `src/styles/features/<domain>/...`, mirroring the feature path, not next to the component. |
| `test/` | Vitest specs, mirroring `src/` paths (e.g. `test/api/`). |

New domains should copy this shape and register their slice in `src/store/store.ts`.

## UI & Layout Guidelines

The authenticated app shell follows the Admisiones Online back-office pattern. Every protected route renders inside `AppLayout` (`src/shared/components/AppLayout.tsx`). Don't give a page its own header or nav. New protected pages go under that layout route in `App.tsx`.

### Layout hierarchy
```
.layout      fixed, inset 0, flex ROW, overflow hidden, data-theme="light|dark"
├─ <aside> Sidebar     80px wide, height 100% (top of the window to the bottom), border-right
│   ├─ .top
│   │   ├─ .brand      64px tall (same as Header), leaf icon, border-bottom
│   │   └─ <nav>       Inicio, Orders, Users
│   └─ <nav> .bottom   Maintainers, pinned to the bottom
└─ .column             flex 1, flex COLUMN, overflow hidden
    ├─ <header> Header 64px tall, border-bottom, 24px side padding
    └─ <main>          flex 1, overflow-y auto, 40px padding, <Outlet />
```
- The sidebar is a sibling of the header, not a child of a row below it. Its right border therefore reaches the top edge of the window, and the header's left edge touches it. Don't move the sidebar back under the header.
- `Sidebar.brand` and `Header` must stay the same height (64px, `box-sizing: border-box`) so their bottom borders form one line.
- `tests/app-layout.spec.ts` asserts this geometry (sidebar `x=0, y=0, height=viewport`, header `x = sidebar width`), so a change here fails a test on purpose.

### Header (`Header.tsx`)
- **Left:** the app title `AgriOPS` only (`font-medium`, 20px). The logo lives at the top of the Sidebar, not here.
- **Right, in this order:** theme toggle (Dark/Light), notifications bell, user badge (initials avatar + uppercase name), logout button.
- The user name is **derived from `auth.email`** by `getDisplayNameFromEmail` (for example `edward.cruz@…` → `EDWARD CRUZ`). Never hardcode it. auth-service issues no name field, and the JWT must not be decoded for UI info (see `architecture.md`).
- Icon-only buttons need an `aria-label`. The labels are `Switch to dark mode` / `Switch to light mode`, `Notifications` and `Log out`. The Playwright specs find the toggle and logout buttons by these names, so renaming one breaks the tests.
- The notifications bell is visual only, with no backend or handler yet.

### Sidebar (`Sidebar.tsx`)
- The brand icon (`assets/plant-icon.png`, cropped square) sits in the 64px `.brand` cell above the first item. The favicon is `public/favicon.png`.
- Vertical icon + label list built from the `navItems` array with `NavLink`. The active item is a tinted primary pill (`navItemActive`), not a solid fill.
- Route mapping:

  | Label | Route | Position | Notes |
  |---|---|---|---|
  | `Inicio` | `/dashboard` | top | KPIs |
  | `Orders` | `/orders` | top | replaces the reference design's "Solicitudes"; there is no `/solicitudes` route |
  | `Users` | `/users` | top | |
  | `Maintainers` | `/maintainers` | pinned to the bottom | master data and system settings. The page is a placeholder `EmptyState` for now |

- Nav labels use English resource names. The exception is `Inicio`.
- A new maintained entity goes into the `Maintainers` page, not into a new top-level sidebar item.

### Pages
- **Dashboard:** greeting header `Hola, {USER_NAME}` (display name, uppercased) with the subtitle `Panel de control AgriOPS`, followed by a row of `StatCard`s.
- **List pages** (such as `Orders`): title + Spanish subtitle, then a table.
- **Tables:** headers are uppercase, small and muted (`text-transform: uppercase`, `var(--header-text)`). Status columns render a badge component (`OrderStatusBadge`), not plain text. Only terminal states take semantic colors (Pending → warning, Delivered → good, Cancelled → critical). In-progress states stay neutral. An empty list renders `EmptyState`, not an empty table.
- **Filter bar (planned, not built):** a horizontal filter bar above list tables with a `FILTROS APLICADOS:` indicator showing the active filters. Filter state belongs in the page's hook, not in Redux (see `architecture.md` → State management). The older `SearchBar.tsx` (used only by `UsersPage`) uses a global class name instead of a CSS module and has no dark-mode styles. Don't build the filter bar on it.

### Theming and design tokens
- `useTheme` (`src/shared/hooks/useTheme.ts`) holds the theme in component state and `AppLayout` puts `data-theme="light|dark"` on its root. The theme is **not persisted**, because `localStorage` is reserved for the token.
- Colors come from `src/styles/_variables.scss` (role + intensity, e.g. `$primary-700`, `$neutral-400`). The app shell's dark palette uses `$dark-shell-*`, kept separate from the login page's `$dark-page-*`.
- Each component module declares CSS custom properties for light mode and overrides them under `[data-theme='dark'] & { … }`. Rules then use only `var(--…)`. Follow this pattern for every new component so both themes work without duplicate rules.

### Testing
- `app-layout.spec.ts` covers the shell's geometry (full-height sidebar, header against it), the brand placement, sidebar links and routing (`/orders`, `/maintainers`), and the `data-theme` toggle.
- Playwright E2E tests live in `tests/`, separate from the Vitest specs in `test/`. Read `tests/README.md` before changing them.
- `visual-regression-*.spec.ts` screenshots `/login`, `/dashboard`, `/orders` and `/maintainers` in **both Light and Dark mode** (it clicks the toggle) at desktop and mobile widths. `app-layout.spec.ts` covers shell behavior: header content, sidebar routing and `data-theme`.
- A new shell route needs light and dark baselines in the visual spec plus a sidebar-routing assertion in `app-layout.spec.ts`.
- After an intended style or token change, check the diff report, then run `npm run test:e2e:update` and commit the PNGs with the change. Never update baselines to hide an unexplained diff.

## Environment

Vite inlines `VITE_*` variables **at build time** (see `.env.example`):
- `VITE_BITACORA_BASE_URL`: auth/users backend (host only, e.g. `http://localhost:3000`)
- `VITE_ORDERSERVICE_BASE_URL`: order service (e.g. `http://localhost:8080`)

`.env` and `.env.*` are gitignored (only `.env.example` is committed). `.dockerignore` does **not** exclude `.env`, so `docker build` copies the local `.env` in and bakes it into the bundle.

## Build & Deploy

- **Docker:** multi-stage build. `node:18-alpine` runs `npm ci` + `npm run build`, then `nginx:alpine` runs as its built-in `nginx` user on port 8080 and serves `dist/`. `nginx.conf` falls back to `index.html` for SPA routing.
- **CI/CD** (`.github/workflows/ci-cd.yml`, Node 18): on push to `main` it runs `npm ci` + `npm test`, then runs `npm run build` and deploys `dist/` with `netlify-cli`. The `VITE_*` secrets are set only on the deploy step, not the build step, so they are not inlined into the bundle.
