# Visual regression tests (Playwright)

`visual-regression-login.spec.ts` screenshots `/login` in light mode, clicks the theme toggle, then screenshots dark mode. It does this at desktop (1440x900) and mobile (375x812), and compares each shot with a committed baseline in `tests/__screenshots__/`:

| Baseline | State |
|---|---|
| `login-light-desktop.png`, `login-light-mobile.png` | default (light) |
| `login-dark-desktop.png`, `login-dark-mobile.png` | after clicking "Switch to dark mode" |

These run separately from the Vitest unit tests (`npm test`), which ignore `tests/`.

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
