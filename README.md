# 🌱 AgriOps Web
🌐 **Live Demo:** https://agricultureops.netlify.app

AgriOps Web is the back-office single-page app of the **AgricultureOperations (AgriOps)** platform. It is the single UI for every AgriOps backend. It handles login and registration against **auth-service** and shows orders from **order-service**, all inside one authenticated app shell with light and dark themes.

It is built with **React 18**, **TypeScript** (strict) and **Vite**, uses **Redux Toolkit** for server state, and follows a **feature-first, domain-driven architecture** with a clean split between UI, business logic and API layers.

---

## 🌐 Place in the AgriOps Platform

AgriOps is made of three independent services, each in its own repository with its own CI/CD:

| Service | Stack | Role |
|---|---|---|
| [auth-service](https://github.com/AgricultureOperations/auth-service) | Express 5 + TypeScript + SQLite | Users, login, JWT issuance |
| [order-service](https://github.com/AgricultureOperations/order-service) | ASP.NET Core (.NET 9) + PostgreSQL | JWT-protected order CRUD |
| **agriops-web** (this repo) | React 18 + Vite | Back-office SPA for both backends |

```
frontend ──(login/register, users)──▶ auth-service   ──issues JWT──┐
    │                                                              │ shared secret/issuer/audience
    └──(Bearer JWT, orders)──────────▶ order-service ◀─validates───┘
```

- The browser calls each backend directly over REST. The backends never call each other, and there is no API gateway.
- Each backend has its **own axios instance**: `bitacoraApi` → auth-service and `orderApi` → order-service. Base URLs are host only. Endpoint paths include `/api/v1/...`.
- The JWT from auth-service is sent as `Authorization: Bearer <token>` to both backends. No cookies are used.

---

## 🚀 Features

- Login and registration with Yup-validated forms
- JWT session kept in `localStorage`, attached to every request by an axios interceptor
- Automatic logout and redirect to `/login` on any 401 (except the login call itself)
- Protected routes rendered inside one shared app shell (`AppLayout`: sidebar + header)
- Dashboard with order KPIs (total, pending, delivered, cancelled) from order-service
- Orders table (TanStack Table) with status badges and an empty state
- Users list with client-side search
- Maintainers page (placeholder for master data and system settings)
- Light / dark theme toggle
- Vitest unit tests and Playwright visual regression tests (light + dark, desktop + mobile)

---

## 🛠 Tech Stack

- React 18, TypeScript (strict), Vite 4
- Redux Toolkit + React Redux
- React Router 7
- Axios
- Yup
- TanStack Table
- SCSS modules (`sass`), `react-icons`, self-hosted Poppins (`@fontsource/poppins`)
- Vitest + jsdom, Playwright
- ESLint
- Netlify (hosting), GitHub Actions (CI/CD), Docker + nginx (local container)

---

## 🧱 Architecture

Dependencies go in one direction only:

```
UI (pages/components) → hooks (business logic) → Redux slices/thunks (state) → API functions → axios instances
```

| Layer | Rules |
|---|---|
| Pages / components | Present data only. Never call APIs or axios. |
| Hooks | Form state, Yup validation, dispatching and navigation. |
| Slices / thunks | State shaped `{ <data>, loading, error: string \| null }`, filled by `createAsyncThunk`. Axios errors map to `rejectWithValue(response.data.message \|\| "Something went wrong")`. Slices never navigate. |
| API functions | Thin typed wrappers around an axios instance that return `response.data`. |

### State management

- Server data lives in Redux slices registered in `src/store/store.ts` (`auth`, `register`, `orders`). Components use the typed `useAppDispatch` / `useAppSelector` only. Don't add React Query, Context stores or component-level fetching next to Redux.
- `localStorage.token` is the source of truth for the session. The axios interceptor and `ProtectedRoute` read it, and `auth.token` in Redux mirrors it. Login stores the token and the email. Logout clears both.
- Form and filter state stays local in hooks, never in Redux.
- The theme lives in component state (`useTheme`) and is **not persisted**, because `localStorage` is reserved for the session.

### Boundaries with the backends

- `ProtectedRoute` only checks that a token string exists. It is navigation UX, not security. Every protected resource is protected by its backend.
- The JWT is never decoded client-side. The user's display name is derived from `auth.email` by `getDisplayNameFromEmail`.
- `VITE_*` values are public and end up in the JS bundle. Only put public base URLs there, never secrets.
- Backend response types are hand-written mirrors in `src/features/<domain>/interfaces/`. When a backend DTO or response shape changes, update the mirror in the same change set.

---

## 📁 Project Structure

```bash
src/
 ├── api/                     # createAxiosApi factory + bitacoraApi (auth-service), orderApi (order-service)
 ├── features/
 │    ├── auth/               # Login & Register: apis, hooks, interfaces, pages, states (auth + register slices), validations
 │    ├── dashboard/          # DashboardPage + StatCard (KPIs built from the orders slice)
 │    ├── orders/             # get-orders API, order slice, useOrdersTable, OrdersTable, OrderStatusBadge, OrdersPage
 │    ├── users/              # fetch-users API, useUser/useApp hooks, UserList, UsersPage
 │    └── maintainers/        # MaintainersPage (placeholder)
 ├── routes/ProtectedRoute.tsx
 ├── shared/
 │    ├── components/         # AppLayout, Header, Sidebar, EmptyState, Spinner, SharedError, CustomInput, SearchBar
 │    ├── hooks/useTheme.ts
 │    └── utils/formatUserDisplay.ts
 ├── store/                   # store.ts (registers every slice), hooks.ts (typed hooks)
 ├── styles/                  # _variables.scss (tokens), _mixins.scss, globals,
 │                            # features/<domain>/... and shared/... CSS modules mirroring the component paths
 ├── App.tsx                  # Route table
 └── main.tsx

test/                         # Vitest specs, mirroring src/ (e.g. test/api/)
tests/                        # Playwright specs, fixtures and screenshot baselines (see tests/README.md)
```

Each feature exposes only its pages from `index.ts`. A new domain copies this shape, gets its own API instance if it talks to a new backend, and registers its slice in `src/store/store.ts`. CSS modules live in `src/styles/features/<domain>/...`, not next to the component.

---

## 🗺 Routes & App Shell

| Route | Page | Access | Sidebar |
|---|---|---|---|
| `/` | redirects to `/login` | public | — |
| `/login` | LoginPage (redirects to `/orders` after login) | public | — |
| `/register` | RegisterPage (redirects to `/login` on success) | public | — |
| `/dashboard` | DashboardPage: `Hola, {NAME}` + KPI cards | protected | `Inicio` (top) |
| `/orders` | OrdersPage: orders table | protected | `Orders` (top) |
| `/users` | UsersPage: user list + search | protected | `Users` (top) |
| `/maintainers` | MaintainersPage: placeholder `EmptyState` | protected | `Maintainers` (pinned to the bottom) |

Every protected route renders inside `AppLayout`:

```
.layout (flex row, data-theme="light|dark")
├─ Sidebar   80px, full height: brand icon (64px cell), Inicio / Orders / Users, Maintainers at the bottom
└─ column
   ├─ Header 64px: "AgriOPS" on the left; theme toggle, notifications, user badge, logout on the right
   └─ main   scrollable content outlet
```

UI conventions:
- New protected pages go under the `AppLayout` route in `App.tsx`. Pages never render their own header or nav.
- Routes are named after the backend resource, lowercase and plural (`/orders` ↔ `/api/v1/orders`). Sidebar labels use English resource names (the exception is `Inicio`). New maintained entities go into the Maintainers page, not into new sidebar items.
- Table headers are uppercase, small and muted. Status columns use a badge (`OrderStatusBadge`). Only terminal states get semantic colors (Pending → warning, Delivered → good, Cancelled → critical). An empty list renders `EmptyState`.
- Theming: each component module declares CSS custom properties for light mode and overrides them under `[data-theme='dark']`. Rules use only `var(--…)`. Colors come from the role + intensity tokens in `_variables.scss` (e.g. `$primary-700`).
- Icon-only buttons have an `aria-label` (`Switch to dark mode` / `Switch to light mode`, `Notifications`, `Log out`). The Playwright tests find buttons by these names.

---

## 🌐 Environment Configuration

Copy `.env.example` to `.env`:

```bash
VITE_BITACORA_BASE_URL=http://localhost:3000      # auth-service (host only, no /api/v1)
VITE_ORDERSERVICE_BASE_URL=http://localhost:8080  # order-service (host only)
```

- Vite inlines `VITE_*` values **at build time**. Changing them requires a rebuild.
- In development you can leave `VITE_BITACORA_BASE_URL` empty. Auth requests then go through the Vite dev proxy (`vite.config.ts`) to `http://localhost:3000`.
- Both backends allow only one CORS origin: `FRONTEND_URL` on auth-service and `ConnectionStrings:FrontendHost` on order-service. Locally that's `http://localhost:5173`; in production, `https://agricultureops.netlify.app`. If the frontend runs on another origin, change both backend settings.
- `.env` and `.env.*` are gitignored. Only `.env.example` is committed.

---

## ⚙️ Getting Started

```bash
git clone https://github.com/AgricultureOperations/frontend
cd agriops-web
npm ci
cp .env.example .env
npm run dev          # http://localhost:5173
```

Run auth-service (port 3000) and order-service (port 8080) locally too, or start the whole stack with docker compose (see below).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc` type-check + `vite build` → `dist/` (unused locals or parameters fail the build) |
| `npm run preview` | Serve the built `dist/` |
| `npm run lint` | ESLint with `--max-warnings 0` |
| `npm test` | Vitest (watch mode locally) |
| `npm run test:only` | Vitest single run |
| `npm run test:ui` | Vitest UI |
| `npm run coverage` | Coverage report → `coverage/` |
| `npm run test:e2e` | Playwright visual regression and layout tests |
| `npm run test:e2e:update` | Regenerate the screenshot baselines after an intended design change |

---

## 🔐 Authentication Flow

1. The user submits the login form. `useLogin` validates it with the Yup schema.
2. The hook dispatches `loginThunk`, which calls `postLogin` → `POST /api/v1/auth/login` on auth-service.
3. On success, the `auth` slice stores the token and email in Redux and `localStorage`, and the hook navigates to `/orders`.
4. `ProtectedRoute` lets the user through while `localStorage.token` exists.
5. The axios request interceptor adds `Authorization: Bearer <token>` to every call on both instances.
6. If any backend returns **401** (except for `/api/v1/auth/login`), the response interceptor clears the token and does a full-page redirect to `/login`.
7. Logout (header button) clears the token and email from Redux and `localStorage`. There is no refresh token and no server-side logout.

Registration dispatches `registerThunk` → `POST /api/v1/auth/register` and returns to `/login` on success. It does not log the user in.

---

## 🧪 Testing

### Unit tests (Vitest)

```bash
npm run test:only
npx vitest run test/api/bitacora.api.spec.ts   # a single file
npx vitest run -t "should be configured"        # a single test by name
```

Vitest runs with `jsdom` and globals, and ignores `tests/`.

### Visual regression & layout (Playwright)

```bash
npx playwright install chromium   # once
npm run test:e2e                  # starts `npm run dev`, or reuses a server already on the port
E2E_PORT=5174 npm run test:e2e    # if 5173 is taken (e.g. by the compose frontend)
npx playwright show-report
```

- `visual-regression-*.spec.ts` screenshots `/login`, `/dashboard`, `/orders`, `/users` and `/maintainers` in **light and dark** mode at desktop and mobile widths. Baselines are in `tests/__screenshots__/`.
- `app-layout.spec.ts` checks shell geometry and behavior: a full-height sidebar, the header against it, sidebar routing and the `data-theme` toggle.
- Tests fake a session (`tests/fixtures/auth.ts`) and stub every `/api/v1/**` call, so no backend is needed.
- A new shell route needs light and dark baselines plus a sidebar-routing assertion. After an intended style change, review the diff report, then run `npm run test:e2e:update` and commit the PNGs with the change. Never update baselines to hide an unexplained diff.

See `tests/README.md` for details.

---

## 🐳 Docker

```bash
docker build -t agriops-web .
docker run -p 5173:8080 agriops-web
```

- Multi-stage build: `node:18-alpine` runs `npm ci` + `npm run build`, then `nginx:alpine` serves `dist/` as the non-root `nginx` user on **port 8080**. `nginx.conf` falls back to `index.html` for SPA routing and doesn't proxy `/api`.
- The build copies `frontend/.env` into the image so Vite can inline the `VITE_*` URLs. Those URLs are browser-facing, so they must point to host-published ports (e.g. `http://localhost:3000`), not compose service names.

### Full stack with docker compose

The workspace root's `docker-compose.yml` runs postgres, auth-service, order-service and this frontend (published on `FRONTEND_PORT`, default 5173). Because the URLs are baked in at build time, rebuild after changing `frontend/.env` or any source:

```bash
# from the workspace root
docker compose up -d --build frontend
```

---

## 🚀 CI/CD

`.github/workflows/ci-cd.yml` (Node 18) runs on pushes to `main` that touch source, tests, package or config files, or workflows:

1. **build-test:** `npm ci` + `npm test` (Vitest).
2. **deploy:** `npm run build`, then `netlify-cli deploy --prod --dir=dist`.

Playwright tests don't run in CI yet (the baselines are generated on macOS, and CI runs on Linux).

---

## ⚠️ Known Issues

These are contract drifts between the frontend and auth-service. Fix them when you touch these files:

- **The Users page calls the wrong path.** `fetch-users.action.ts` requests `/user` instead of `/api/v1/user`, so the request 404s.
- The `User` interface declares `password`, because `GET /api/v1/user` currently returns hashes. Fix both sides together.
- `RegisterResponse` is typed `{ token }`, but auth-service returns `{ id, email }`.
- `UsersApiResponse` (`{ success, message, data }`) matches no endpoint. Neither backend wraps responses.
- The Users feature fetches in a local hook instead of a Redux slice, unlike the other features.
- auth-service returns **403** (not 401) for an expired token on `/api/v1/user`, so the interceptor doesn't log the user out there.
- The notifications bell is visual only, and the filter bar above list tables is planned but not built.

---

## 🔮 Future Improvements

- Order create / edit / delete screens (order-service already exposes the endpoints)
- Filter bar for list tables
- Maintainer screens for master data
- Role-based authorization (Admin / Operator), backed by the backends
- Token refresh
- Playwright in CI on Linux baselines

---

## 📌 Author

**Edward Cruz**
Full Stack Developer | React | TypeScript | REST APIs
