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
E2E_PORT=5174 npx playwright test tests/products-maintainer.spec.ts   # Products maintainer only (use a free port if 5173 is taken)
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
| `src/api/` | `createAxiosApi` factory plus one instance per backend (`bitacoraApi`, `orderApi`, `productApi`). Interceptors add `Bearer <token>` from `localStorage`. On a 401 (except login) they clear the token and redirect to `/login`. |
| `src/features/<domain>/apis/` | Endpoint calls using an instance (paths include `/api/v1/...`). |
| `src/features/<domain>/states/` | RTK slices and `createAsyncThunk`s. Axios errors map to `rejectWithValue(response.data.message \|\| "Something went wrong")`. |
| `src/features/<domain>/hooks/` | Business logic consumed by pages (`useLogin`, `useOrdersTable`, …). |
| `src/features/<domain>/components/`, `pages/` | Presentational UI. `pages/index.ts` re-exports default pages as named exports, and the feature's `index.ts` exposes only pages. |
| `src/features/<domain>/interfaces/`, `validations/` | Request/response types and Yup schemas. |
| `src/store/` | `store.ts` registers every slice (`auth`, `register`, `orders`, `products`, `toasts`). Always use the typed `useAppDispatch`/`useAppSelector` from `hooks.ts`. |
| `src/routes/` | `ProtectedRoute` checks `localStorage.token` (not Redux). Routes are declared in `App.tsx`. |
| `src/shared/components/` | Reusable UI: `Modal`, `ConfirmDialog`, `Button`, `ToastViewport`, `EmptyState` (optional `action`), `form/` (`FormSection`, `FormField` + `fieldA11y`, `SegmentedControl`, `Switch`), Spinner, SharedError, CustomInput, … |
| `src/shared/states/` | UI-only slices. `toast.slice.ts`: `showToast(type, message)` / `dismissToast(id)`. |
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
│   │   └─ <nav>       Inicio, Orders, Products, Users
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
  | `Products` | `/products` | top, right below Orders | Products maintainer (`FiBox`; `FiPackage` is taken by Orders). `/maintainers/products` redirects here |
  | `Users` | `/users` | top | |
  | `Maintainers` | `/maintainers` | pinned to the bottom | hub for general configuration and secondary master data: one card per entry in its `sections` array. Empty today, so it shows the `No maintainers yet` placeholder |

- Nav labels use English resource names. The exception is `Inicio`.
- Core, frequently used master data (currently Products) gets a top-level sidebar item and a flat route named after the backend resource (`/products` ↔ `/api/v1/products`). Secondary or rarely edited master data goes into the `Maintainers` hub as a card linking to `/maintainers/<resource>`, so the sidebar doesn't keep growing. Ask before adding another top-level item.

### Pages
- **Dashboard:** greeting header `Hola, {USER_NAME}` (display name, uppercased) with the subtitle `Panel de control AgriOPS`, followed by a row of `StatCard`s.
- **List pages** (such as `Orders`): title + Spanish subtitle, then a table.
- **Tables:** headers are uppercase, small and muted (`text-transform: uppercase`, `var(--header-text)`). Status columns render a badge component (`OrderStatusBadge`), not plain text. Only terminal states take semantic colors (Pending → warning, Delivered → good, Cancelled → critical). In-progress states stay neutral. An empty list renders `EmptyState`, not an empty table.
- **Filter bar (planned, not built):** a horizontal filter bar above list tables with a `FILTROS APLICADOS:` indicator showing the active filters. Filter state belongs in the page's hook, not in Redux (see `architecture.md` → State management). The older `SearchBar.tsx` (used only by `UsersPage`) uses a global class name instead of a CSS module and has no dark-mode styles. Don't build the filter bar on it.

### Maintainers and the Products maintainer
- `/maintainers` (`features/maintainers`) is a hub. Its typed `sections` array renders one card per entry, each linking to `/maintainers/<resource>`. It renders the `EmptyState` placeholder while the array is empty. Add an entry there and a route in `App.tsx` for a new secondary maintainer.
- `/products` (`features/products`, top-level sidebar item) is the Products maintainer. It is a flat list page like `/orders`, with title and subtitle and no breadcrumb. It talks only to product-service, through `productApi`. The old `/maintainers/products` URL is a `<Navigate replace>` to `/products`.

  | Layer | Files |
  |---|---|
  | apis | `get-products`, `create-product`, `update-product` (PATCH), `delete-product` |
  | states | `product.slice.ts`: `{ products, meta, loading, saving, error }`. `saving` covers every mutation (set with `addMatcher`, since RTK allows only one `addCase` per action type) |
  | hooks | `useProductsMaintainer`: page number, modal target, delete target, re-fetch after each mutation, toasts. `useProductForm`: form values as strings, Yup validation, returns the server message on failure |
  | components | `ProductsTable` (TanStack, `th scope="col"`), `ProductStatusBadge`, `ProductsPagination`, `ProductFormModal`, `DeleteProductDialog` |
  | interfaces / utils / validations | `product.interface.ts` mirrors product-service's `ProductResponseDto`. `product-options.ts` holds labels and units (`bag` = saco, `t` = ton, `qq`). `product-form.mapper.ts` converts form ↔ request. `product.validation.ts` mirrors the backend rules for UX only |
- Table columns: SKU, Name, Category, Type, Unit, Selling Price, Min Stock, Status, then the Edit/Delete icon buttons (`aria-label` `Editar <SKU>` / `Eliminar <SKU>`). The list is paginated 10 per page, newest first. Loading, empty (`No products yet`) and error (`Reintentar`) states use `EmptyState` or the loading row, never an empty table.

### Modal pattern (reference: Admisiones "Nueva solicitud en borrador")
- Use `shared/components/Modal`, never a bespoke overlay. The backdrop is `rgba(0,0,0,.5)` + `blur(4px)` (Tailwind `bg-black/50 backdrop-blur-sm`). The header has a small uppercase eyebrow (`Alta manual`, or `Edición · <SKU>`), the title, a subtitle and an X button (`aria-label="Cerrar"`). The body scrolls. The footer holds an outline `Cancelar` and a primary action.
- **Render modals in place, not in a portal**, so they stay inside `AppLayout`'s `[data-theme]` and get the dark tokens. Escape, the X and a backdrop click close them, except while `busy`.
- Group form fields into `FormSection` cards (title, one-line description, optional right-aligned pill badge) on a 2-column grid that collapses to 1 column below `$bp-tablet`. The product modal has four sections: Información básica, Agronomía / Especificaciones, Empaque y precios, Control de stock.
- Use `SegmentedControl` (a radiogroup) for short enumerations, `Switch` (`role="switch"`) for flags and `FormField` + `fieldA11y(id, error, required)` for inputs and selects. The required `*` sits **outside** `<label>`, so it's not part of the accessible name (tests use `getByLabel('Nombre', { exact: true })`). Controls set `aria-required`/`aria-invalid`.
- Destructive actions go through `ConfirmDialog` (`role="alertdialog"`). The product one asks `¿Está seguro de eliminar este producto?` and suggests `Descontinuado` as the non-destructive alternative.
- Report the outcome with a toast: `dispatch(showToast("success" | "error", message))` from the hook. A save error also stays inside the modal as a `role="alert"` banner, and the modal stays open.

### Theming and design tokens
- `useTheme` (`src/shared/hooks/useTheme.ts`) holds the theme in component state and `AppLayout` puts `data-theme="light|dark"` on its root. The theme is **not persisted**, because `localStorage` is reserved for the token.
- Colors come from `src/styles/_variables.scss` (role + intensity, e.g. `$primary-700`, `$neutral-400`). The app shell's dark palette uses `$dark-shell-*`, kept separate from the login page's `$dark-page-*`.
- Each component module declares CSS custom properties for light mode and overrides them under `[data-theme='dark'] & { … }`. Rules then use only `var(--…)`. Follow this pattern for every new component so both themes work without duplicate rules.

### Testing
- `app-layout.spec.ts` covers the shell's geometry (full-height sidebar, header against it), the brand placement, the sidebar item order (`Inicio, Orders, Products, Users` + `Maintainers`), routing (`/orders`, `/products` with its table and `aria-current`, `/maintainers`, and the `/maintainers/products` → `/products` redirect), and the `data-theme` toggle.
- Playwright E2E tests live in `tests/`, separate from the Vitest specs in `test/`. Read `tests/README.md` before changing them.
- `visual-regression-*.spec.ts` screenshots `/login`, `/dashboard`, `/orders`, `/users`, `/maintainers` and `/products` (empty state) in **both Light and Dark mode** (it clicks the toggle) at desktop and mobile widths. It also has `sidebar-products-active{,-dark}.png`: it clicks the sidebar `Products` item, then shoots the seeded table with that item active (1440×900). `app-layout.spec.ts` covers shell behavior: header content, sidebar routing and `data-theme`.
- A new shell route needs light and dark baselines in the visual spec plus a sidebar-routing assertion in `app-layout.spec.ts`.
- `products-maintainer.spec.ts` drives the Products maintainer against `tests/fixtures/product-service.ts`, a stateful in-browser mock of `/api/v1/products` (12 seeded products, fixed timestamps, newest-first pagination, 409 on duplicate SKU, and `failLists(status)` for error states). It covers: navigation through the sidebar `Products` item to `/products`; every modal input and section; client validation; create → edit → delete, including checks on the request bodies; the duplicate-SKU error; empty and error states. Screenshots: `products-maintainer-list.png`, `create-product-modal.png` and `create-product-modal-dark.png` (1440×900).
- `fixtures/auth.ts` stubs product-service with an empty page (`{ data: [], meta }`), because the catch-all `[]` is not a valid paginated response. Match product-service URLs with `isProductServiceUrl`, not a glob: `**/api/v1/products**` does not cross `/`, so `/products/<id>` would silently fall through to the catch-all.
- Playwright only rewrites a baseline that fails comparison. When a page is redesigned but the diff stays under `maxDiffPixelRatio` (0.02 for full-page shots), delete the old PNG and regenerate it, so the baseline shows the current design.
- After an intended style or token change, check the diff report, then run `npm run test:e2e:update` and commit the PNGs with the change. Never update baselines to hide an unexplained diff.

## Environment

Vite inlines `VITE_*` variables **at build time** (see `.env.example`):
- `VITE_BITACORA_BASE_URL`: auth/users backend (host only, e.g. `http://localhost:3000`)
- `VITE_ORDERSERVICE_BASE_URL`: order service (e.g. `http://localhost:8080`)
- `VITE_PRODUCTSERVICE_BASE_URL`: product service (e.g. `http://localhost:3001`). Also a GitHub secret on the build step. If it is missing, the list request hits the SPA host and gets `index.html`; `get-products.api.ts` rejects that so the page shows its error state

`.env` and `.env.*` are gitignored (only `.env.example` is committed). `.dockerignore` does **not** exclude `.env`, so `docker build` copies the local `.env` in and bakes it into the bundle.

## Build & Deploy

- **Docker:** multi-stage build. `node:18-alpine` runs `npm ci` + `npm run build`, then `nginx:alpine` runs as its built-in `nginx` user on port 8080 and serves `dist/`. `nginx.conf` falls back to `index.html` for SPA routing.
- **CI/CD** (`.github/workflows/ci-cd.yml`, Node 18): on push to `main` it runs `npm ci` + `npm test`, then runs `npm run build` and deploys `dist/` with `netlify-cli`. The `VITE_*` secrets are set on the build step, because Vite inlines them at build time; the deploy step only needs the Netlify token and site ID.
