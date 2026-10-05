import { expect, test } from './fixtures/auth';
import { mockAuthService } from './fixtures/auth-service';
import { mockProductService } from './fixtures/product-service';

// Permission-gated UI: GET /auth/me decides which sidebar items, routes and actions a user sees.
// Hiding is UX only; the backend still answers 403 (see users-maintainer.spec.ts for that path).

test.describe('rbac: viewer (products:view, orders:view)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await mockAuthService(page, { currentRole: 'viewer' });
    await mockProductService(page);
  });

  test('the sidebar hides Users and Roles, and the header shows the role', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('complementary').getByRole('link')).toHaveText(['Inicio', 'Orders', 'Products', 'Maintainers']);
    await expect(page.getByRole('banner').getByText('Viewer')).toBeVisible();
  });

  test('/users and /roles show "No access" inside the shell and keep the session', async ({ page }) => {
    for (const path of ['/users', '/roles']) {
      await page.goto(path);
      await expect(page.getByText('No access')).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole('banner')).toBeVisible();
    }
    expect(await page.evaluate(() => window.localStorage.getItem('token'))).not.toBeNull();

    await page.getByRole('button', { name: 'Ir al inicio' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('Products is read-only: no "Nuevo Producto", no edit or delete buttons', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('row')).toHaveCount(11);

    await expect(page.getByRole('button', { name: 'Nuevo Producto' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Editar / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Eliminar / })).toHaveCount(0);
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toHaveCount(0);
  });
});

test.describe('rbac: operator (products and orders: view, create, edit)', () => {
  test('Products allows create and edit but hides delete', async ({ page }) => {
    await mockAuthService(page, { currentRole: 'operator' });
    await mockProductService(page);
    await page.goto('/products');
    await expect(page.getByRole('row')).toHaveCount(11);

    await expect(page.getByRole('button', { name: 'Nuevo Producto' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Editar / })).toHaveCount(10);
    await expect(page.getByRole('button', { name: /^Eliminar / })).toHaveCount(0);
  });
});
