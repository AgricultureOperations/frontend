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

## Environment

Vite inlines `VITE_*` variables **at build time** (see `.env.example`):
- `VITE_BITACORA_BASE_URL`: auth/users backend (host only, e.g. `http://localhost:3000`)
- `VITE_ORDERSERVICE_BASE_URL`: order service (e.g. `http://localhost:8080`)

`.env` and `.env.*` are gitignored (only `.env.example` is committed). `.dockerignore` does **not** exclude `.env`, so `docker build` copies the local `.env` in and bakes it into the bundle.

## Build & Deploy

- **Docker:** multi-stage build. `node:18-alpine` runs `npm ci` + `npm run build`, then `nginx:alpine` runs as its built-in `nginx` user on port 8080 and serves `dist/`. `nginx.conf` falls back to `index.html` for SPA routing.
- **CI/CD** (`.github/workflows/ci-cd.yml`, Node 18): on push to `main` it runs `npm ci` + `npm test`, then runs `npm run build` and deploys `dist/` with `netlify-cli`. The `VITE_*` secrets are set only on the deploy step, not the build step, so they are not inlined into the bundle.
