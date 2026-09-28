import { expect, test } from './fixtures/auth';

// Covers the shared app shell (Header + Sidebar) that wraps every protected route.
// Screenshot/visual-regression coverage for these routes lives in
// visual-regression-dashboard.spec.ts; this file only asserts behavior.

test.describe('app layout: structure', () => {
  test('sidebar spans the full viewport height and the header sits against its right edge', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');

    const sidebar = await page.getByRole('complementary').boundingBox();
    const header = await page.getByRole('banner').boundingBox();
    if (!sidebar || !header) throw new Error('sidebar or header not rendered');

    expect(sidebar.x).toBe(0);
    expect(sidebar.y).toBe(0);
    expect(sidebar.height).toBe(900);
    expect(header.y).toBe(0);
    expect(header.height).toBe(64);
    expect(header.x).toBe(sidebar.x + sidebar.width);
  });

  test('puts the brand icon in the sidebar and the "AgriOPS" title in the header', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('complementary').getByRole('img', { name: 'AgriOPS' })).toBeVisible();
    await expect(page.getByRole('banner').getByText('AgriOPS', { exact: true })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('img')).toHaveCount(0);
  });
});

test.describe('app layout: header', () => {
  test('shows the signed-in user name and a logout button', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('banner').getByText('EDWARD CRUZ')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('logout clears the session and redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => window.localStorage.getItem('token'))).toBeNull();
  });
});

test.describe('app layout: sidebar navigation', () => {
  test('routes to /orders via the "Orders" item, not "Solicitudes"', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('link', { name: 'Solicitudes' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Orders' }).click();

    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  });

  test('lists Inicio, Orders and Users on top and pins Maintainers to the bottom', async ({ page }) => {
    await page.goto('/dashboard');

    const links = page.getByRole('complementary').getByRole('link');
    await expect(links).toHaveText(['Inicio', 'Orders', 'Users', 'Maintainers']);

    const sidebar = await page.getByRole('complementary').boundingBox();
    const maintainers = await page.getByRole('link', { name: 'Maintainers' }).boundingBox();
    if (!sidebar || !maintainers) throw new Error('sidebar or Maintainers link not rendered');
    expect(maintainers.y + maintainers.height).toBeGreaterThan(sidebar.height - 32);
  });

  test('routes to /maintainers via the bottom "Maintainers" item', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: 'Maintainers' }).click();
    await expect(page).toHaveURL(/\/maintainers$/);
    await expect(page.getByRole('heading', { name: 'Maintainers' })).toBeVisible();
  });

  test('highlights the active route', async ({ page }) => {
    await page.goto('/orders');

    const ordersLink = page.getByRole('link', { name: 'Orders' });
    await expect(ordersLink).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('app layout: theme toggle', () => {
  test('switches the data-theme attribute on the layout root', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('[data-theme="light"]')).toBeVisible();

    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('[data-theme="dark"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  });
});

test.describe('orders page', () => {
  test('shows the empty state when there are no orders', async ({ page }) => {
    await page.goto('/orders');

    // No order-service backend runs in this E2E setup, so the table always renders empty.
    await expect(page.getByText('No orders found')).toBeVisible();
  });
});
