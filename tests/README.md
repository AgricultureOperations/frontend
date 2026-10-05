# Visual regression tests (Playwright)

`visual-regression-login.spec.ts` screenshots `/login` in light mode, clicks the theme toggle, then screenshots dark mode. It does this at desktop (1440x900) and mobile (375x812), and compares each shot with a committed baseline in `tests/__screenshots__/`:

| Baseline | State |
|---|---|
| `login-light-desktop.png`, `login-light-mobile.png` | default (light) |
| `login-dark-desktop.png`, `login-dark-mobile.png` | after clicking "Switch to dark mode" |

`visual-regression-dashboard.spec.ts` does the same for the real routes behind the authenticated app shell (`AppLayout` + `Header` + `Sidebar`): `/dashboard`, `/orders`, `/products`, `/users`, `/roles` and `/maintainers` (`Orders` is the sidebar item that replaced "Solicitudes" - there is no `/dashboard/solicitudes` route in this app). It uses `fullPage: true` and `maxDiffPixelRatio: 0.02` (looser than the login spec's default, since these pages have more surface area). Baselines: `dashboard-{light,dark}-{desktop,mobile}.png`, `orders-…`, `products-…`, `users-…`, `roles-…` and `maintainers-…` likewise. A separate test clicks the sidebar `Products` item over seeded data (`fixtures/product-service.ts`) and saves `sidebar-products-active.png` / `sidebar-products-active-dark.png` (1440x900, viewport).

Both specs fake a signed-in session instead of exercising the real login form: `tests/fixtures/auth.ts` seeds `localStorage.token`/`localStorage.email` before each test and stubs every `/api/v1/**` call to `200 []`, so a real backend can't 401 the fake token and bounce the test to `/login` via the app's 401 interceptor. On top of that it registers `fixtures/auth-service.ts` (see below) signed in as the seeded **admin**, because `/auth/me` decides which sidebar items and permission-guarded routes render.

`app-layout.spec.ts` covers the same shell's *behavior* (header content, sidebar routing, the theme toggle's `data-theme` attribute, the orders empty state) rather than pixels - keep new pixel assertions in the `visual-regression-*` files and new behavioral assertions there.

## Products maintainer (`products-maintainer.spec.ts`)

Drives `/products` (top-level sidebar item) against `fixtures/product-service.ts`, a **stateful in-browser mock** of product-service's `/api/v1/products`. It seeds 12 products with fixed timestamps, returns pages newest first, answers POST/PATCH/DELETE like the real service (201, 200, 204, 404, and 409 on a duplicate SKU) and records every request in `api.requests`, so tests can check the bodies the UI sends. `api.failLists(500)` makes list calls fail until `api.failLists(null)`. (React StrictMode fetches twice in dev, so a one-shot failure would be masked.)

| Test | Checks |
|---|---|
| navigation | sidebar `Products` (from `/orders`) → `/products`, the table renders, and the item becomes `aria-current` |
| list | column headers, 10 rows per page, first row, pagination text and buttons |
| modal render | every section and input of "Nuevo Producto", the toggles, the switches, unit options (kg, Saco, Tonelada, Quintal first), and the hazardous pill |
| modal validation | required and cross-field errors (max ≥ min, size needs a unit) with no API call; Cancelar, X and Escape close it |
| CRUD | create (POST body), row appears first; edit (PATCH body), row updates; delete: Cancelar keeps the row, Eliminar removes it; a toast for each step |
| duplicate SKU | the server's 409 message shows inside the modal and as a toast, and the modal stays open |
| empty / error | `No products yet`; `No se pudieron cargar los productos` + `Reintentar` |

Screenshots at 1440x900 (viewport, not full page): `products-maintainer-list.png` (seeded table), `create-product-modal.png` and `create-product-modal-dark.png`. The empty `/products` page is also in `visual-regression-dashboard.spec.ts` (`products-{light,dark}-{desktop,mobile}.png`).

```bash
E2E_PORT=5174 npx playwright test tests/products-maintainer.spec.ts
E2E_PORT=5174 npx playwright test tests/products-maintainer.spec.ts -g "visual" --update-snapshots   # after an intended modal/table change
```

- `fixtures/auth.ts` stubs product-service with an empty page (`{ data: [], meta }`) for every spec, and this spec's mock overrides it (Playwright tries routes in reverse registration order).
- Match product-service URLs with `isProductServiceUrl`. The glob `**/api/v1/products**` does **not** match `/api/v1/products/<id>`, so a PATCH or DELETE would fall through to the catch-all `[]` and appear to succeed.

These run separately from the Vitest unit tests (`npm test`), which ignore `tests/`.

## auth-service mock and the RBAC specs

`fixtures/auth-service.ts` is a **stateful in-browser mock** of auth-service's `GET /api/v1/auth/me`, `/user` (search, `roleId`, `isActive`, `page`, `pageSize`), `/roles`, `/permissions` and their mutations. It seeds 12 users (sorted by name; `Edward Cruz` = the signed-in user = `FAKE_EMAIL`), the system roles `admin`/`operator`/`viewer` plus a custom `field_supervisor` with no users, and a 4 × 4 permission matrix. It applies auth-service's guardrails (409 for the last active admin, system roles, roles with users, and reducing admin's permissions), records every request in `api.requests`, and `api.failNext(method, pathRegex, status, message)` makes the next matching call fail (403/409 paths).

- `mockAuthService(page, { currentRole: 'viewer' | 'operator' })` signs in with another role. It overrides the default admin mock, since Playwright tries routes in reverse registration order.
- Match its URLs with `isAuthServiceUrl`. `/api/v1/auth/login` and `/register` are deliberately not matched.

| Spec | Checks |
|---|---|
| `users-maintainer.spec.ts` | columns, name-sorted first page, pagination, own-row guard; debounced search in `?q=` and "Limpiar filtros"; status/role filters, page size and page in the URL (survive a reload); create drawer fields, validation and disabled submit; create → edit → inline role change → deactivate (with confirmation) → delete with request bodies; a 409 reverts the inline role select; a 403 shows a toast and keeps the session. Screenshots `users-maintainer-list.png`, `create-user-drawer{,-dark}.png` |
| `roles-maintainer.spec.ts` | matrix opens the first non-admin role, checked cells, indeterminate row, counter; cell/row toggles and the `PUT` body; search + bulk buttons on visible rows; unsaved-changes dialog on role switch; admin locked; create role with auto identifier (and manual override, invalid key); delete guards and deleting a free custom role; edit modal. Screenshots `roles-matrix{,-dark}.png`, `roles-manage.png` |
| `rbac-gating.spec.ts` | viewer: sidebar without Users/Roles, role in the header, `/users` and `/roles` show "No access" without logging out, Products read-only; operator: Products create/edit but no delete |

```bash
E2E_PORT=5174 npx playwright test tests/users-maintainer.spec.ts tests/roles-maintainer.spec.ts tests/rbac-gating.spec.ts
```

## First-time setup

```bash
npm ci
npx playwright install chromium     # downloads the browser once
```

## Run

```bash
npm run test:e2e                    # starts `npm run dev` itself, or reuses a server already on the port
npx playwright test -g "mobile"     # one viewport
npx playwright show-report          # HTML report; failures include expected / actual / diff images
```

Playwright serves the app on port **5173** by default. Whatever is listening there is what gets tested, so if another stack already publishes 5173 (e.g. the docker-compose `frontend`, which may be an old image), use a free port:

```bash
E2E_PORT=5174 npm run test:e2e
```

## Update snapshots when design tokens change

Playwright rewrites only baselines that fail comparison. If a page was redesigned but the diff stays under `maxDiffPixelRatio`, delete its PNGs first so they are regenerated.

A failing run after editing `src/styles/_variables.scss` or a `*.module.scss` file is expected. Do it in this order:

1. Run `npm run test:e2e` and open the report (`npx playwright show-report`). Check the diff images show only the change you intended.
2. Regenerate the baselines:
   ```bash
   npm run test:e2e:update          # add E2E_PORT=... if 5173 is taken
   ```
3. Look at the changed PNGs in `tests/__screenshots__/`, then commit them in the same commit as the token change.

Never update baselines to make an unexplained failure pass.

## Notes

- **Baselines depend on the OS.** Font rasterization differs between macOS and Linux. Generate baselines on the platform that runs the tests (CI is Linux; a local macOS run will differ slightly). `maxDiffPixelRatio: 0.01` in `playwright.config.ts` absorbs small antialiasing noise but not color, spacing or radius changes.
- **Fonts are self-hosted** (`@fontsource/poppins`, imported in `src/main.tsx`), so snapshots don't depend on the network.
- **The theme is not persisted**, so every test starts in light mode.
- The toggle is found by its accessible name (`Switch to dark mode` / `Switch to light mode`), not by icon.
- CI (`.github/workflows/ci-cd.yml`) only runs Vitest. Add `npx playwright install --with-deps chromium && npm run test:e2e` there once baselines are generated on Linux.
