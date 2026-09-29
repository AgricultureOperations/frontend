import { expect, test } from './fixtures/auth';
import { mockProductService } from './fixtures/product-service';

// Visual regression for the two real protected routes behind AppLayout, in light and
// dark mode. Baselines live in tests/__screenshots__/. See tests/README.md to run and
// update them.
//
// The task that requested this file named the second route "/dashboard/solicitudes/",
// mirroring the reference site's (dev-admisiones-online.ecotec.edu.ec) URL scheme. This
// app has no such route: "Solicitudes" was renamed to "Orders" at /orders early on (see
// app-layout.spec.ts's "not Solicitudes" test), and routes are flat, not nested under
// /dashboard. This file screenshots the routes that actually exist: /dashboard and
// /orders, naming files accordingly (orders-* instead of solicitudes-*).
const routes = [
  { path: '/dashboard', slug: 'dashboard', readyHeading: /Hola,/ },
  { path: '/orders', slug: 'orders', readyHeading: /Orders/ },
  { path: '/maintainers', slug: 'maintainers', readyHeading: /Maintainers/ },
  // Empty list (fixtures/auth.ts stubs product-service with an empty page). The seeded table and
  // the create modal are covered by products-maintainer.spec.ts.
  { path: '/products', slug: 'products', readyHeading: /^Products$/ },
  { path: '/users', slug: 'users', readyHeading: /Users/ },
];

const viewports = [
  { name: 'desktop', size: { width: 1440, height: 900 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];

for (const { name, size } of viewports) {
  test.describe(`dashboard visual regression (${name} ${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    for (const { path, slug, readyHeading } of routes) {
      test(`${slug}: matches the light baseline, then the dark baseline after the theme toggle`, async ({
        page,
      }) => {
        await page.goto(path);
        await expect(page.getByRole('heading', { name: readyHeading })).toBeVisible();
        await page.evaluate(() => document.fonts.ready);

        await expect(page.locator('[data-theme="light"]')).toBeVisible();
        await expect(page).toHaveScreenshot(`${slug}-light-${name}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.02,
        });

        await page.getByRole('button', { name: 'Switch to dark mode' }).click();
        await expect(page.locator('[data-theme="dark"]')).toBeVisible();
        // Park the pointer so the toggle's :hover style is not part of the snapshot.
        await page.mouse.move(0, 0);
        await expect(page).toHaveScreenshot(`${slug}-dark-${name}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.02,
        });
      });
    }
  });
}

// The sidebar with the top-level "Products" item active, reached by clicking it, over the seeded table.
test.describe('sidebar: Products active', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('matches the light baseline, then the dark baseline after the theme toggle', async ({ page }) => {
    await mockProductService(page);
    await page.goto('/dashboard');
    await page.getByRole('complementary').getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole('row')).toHaveCount(11);
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);

    await expect(page.locator('[data-theme="light"]')).toBeVisible();
    await expect(page).toHaveScreenshot('sidebar-products-active.png');

    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('[data-theme="dark"]')).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot('sidebar-products-active-dark.png');
  });
});
