import { defineConfig, devices } from '@playwright/test';

// Whatever answers on this port is what gets tested (reuseExistingServer), so use a free port
// if another stack, e.g. the docker-compose frontend, already publishes 5173.
const PORT = Number(process.env.E2E_PORT ?? 5173);

export default defineConfig({
  testDir: './tests',
  // One flat folder, no OS suffix: file names already carry theme + viewport (login-dark-desktop.png).
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      // Tolerates sub-pixel text antialiasing; a token change (color, radius, spacing) exceeds it.
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    colorScheme: 'light',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
  },
});
