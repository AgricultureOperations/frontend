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

The authenticated app shell follows the Admisiones Online back-office pattern. Every protected route renders inside `AppLayout` (`src/shared/components/AppLayout.tsx`): `Header` on top, `Sidebar` on the left, and the page in `<main>` through `<Outlet />`. New protected pages go under that layout route in `App.tsx`. Don't give a page its own header or nav.

### Header (`Header.tsx`)
- **Left:** logo (`assets/plant-logo.png`) and the app title `AgriOPS`.
- **Right, in this order:** theme toggle (Dark/Light), notifications bell, user badge (initials avatar + uppercase name), logout button.
- The user name is **derived from `auth.email`** by `getDisplayNameFromEmail` (for example `edward.cruz@…` → `EDWARD CRUZ`). Never hardcode it. auth-service issues no name field, and the JWT must not be decoded for UI info (see `architecture.md`).
- Icon-only buttons need an `aria-label`. The labels are `Switch to dark mode` / `Switch to light mode`, `Notifications` and `Log out`. The Playwright specs find the toggle and logout buttons by these names, so renaming one breaks the tests.
- The notifications bell is visual only, with no backend or handler yet.

### Sidebar (`Sidebar.tsx`)
- Vertical icon + label list built from the `navItems` array with `NavLink`. The active item is a tinted primary pill (`navItemActive`), not a solid fill.
- Current routes: `Inicio` → `/dashboard`, `Orders` → `/orders` (replaces the reference design's "Solicitudes"; there is no `/solicitudes` route), `Users` → `/users`.
- Pinned to the bottom: a disabled `Settings (coming soon)` button. This is the slot for **`Maintainers` → `/maintainers`** (master data and system settings). That route and page **do not exist yet**. When you build it, replace the disabled button with a `NavLink` to `/maintainers`, keep it at the bottom, and add the route under `AppLayout`.
- Nav labels use English resource names (`Orders`, `Maintainers`, `Users`). The exception is `Inicio`.

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
- Playwright E2E tests live in `tests/`, separate from the Vitest specs in `test/`. Read `tests/README.md` before changing them.
- `visual-regression-*.spec.ts` screenshots `/login`, `/dashboard` and `/orders` in **both Light and Dark mode** (it clicks the toggle) at desktop and mobile widths. `app-layout.spec.ts` covers shell behavior: header content, sidebar routing and `data-theme`.
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
