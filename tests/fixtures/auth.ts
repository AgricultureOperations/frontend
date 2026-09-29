import { test as base } from '@playwright/test';
import { isProductServiceUrl } from './product-service';

// ProtectedRoute only checks that localStorage.token is a non-empty string (see
// architecture.md: "navigation UX, not security"), so specs fake a session instead of
// exercising the real login flow - no auth-service backend needs to run for these tests.
export const FAKE_TOKEN = 'e2e-fake-token';
export const FAKE_EMAIL = 'edward.cruz@agriops.io';

export const test = base.extend<{ fakeSession: void }>({
  fakeSession: [
    async ({ page }, use) => {
      await page.addInitScript(
        ([token, email]) => {
          window.localStorage.setItem('token', token);
          window.localStorage.setItem('email', email);
        },
        [FAKE_TOKEN, FAKE_EMAIL],
      );

      // Whatever real backend frontend/.env points to would 401 this fake token and
      // trigger the app's redirect-to-login interceptor. Neutralize every backend call
      // so the shell renders deterministically regardless of which env is configured.
      await page.route('**/api/v1/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
      );
      // product-service lists are paginated ({ data, meta }), not bare arrays. Registered after the
      // catch-all so it wins; products-maintainer.spec.ts overrides it with a stateful mock.
      await page.route(isProductServiceUrl, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
        }),
      );

      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
