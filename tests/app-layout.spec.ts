import { expect, test } from './fixtures/auth';

// Covers the shared app shell (Header + Sidebar) that wraps every protected route.
// Screenshot/visual-regression coverage for these routes lives in
// visual-regression-dashboard.spec.ts; this file only asserts behavior.

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
