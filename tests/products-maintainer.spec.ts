import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth';
import { mockProductService, type ProductServiceMock } from './fixtures/product-service';

// Products maintainer (/products, top-level sidebar item) against an in-browser product-service mock
// (tests/fixtures/product-service.ts). Covers navigation, the create/edit modal, the delete
// confirmation, toasts, empty/error states, and the list + modal screenshots.

const openProducts = async (page: Page) => {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
};

const productDialog = (page: Page, name: 'Nuevo Producto' | 'Editar Producto') =>
  page.getByRole('dialog', { name });

const settle = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  // Park the pointer so no :hover style ends up in a snapshot.
  await page.mouse.move(0, 0);
};

test.describe('products maintainer', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  let api: ProductServiceMock;

  test.beforeEach(async ({ page }) => {
    api = await mockProductService(page);
  });

  test('navigation: the sidebar "Products" item opens the maintainer at /products', async ({ page }) => {
    await page.goto('/orders');

    const productsLink = page.getByRole('complementary').getByRole('link', { name: 'Products' });
    await expect(productsLink).not.toHaveAttribute('aria-current', 'page');
    await productsLink.click();

    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(11);
    await expect(productsLink).toHaveAttribute('aria-current', 'page');
  });

  test('list: renders the columns, first page and pagination', async ({ page }) => {
    await openProducts(page);

    const headers = page.getByRole('columnheader');
    await expect(headers).toHaveText(['SKU', 'Name', 'Category', 'Type', 'Unit', 'Selling Price', 'Min Stock', 'Status', 'Actions']);

    // 12 seeded products, 10 per page, newest first.
    const rows = page.getByRole('row');
    await expect(rows).toHaveCount(11);
    const first = rows.nth(1);
    await expect(first).toContainText('EQ-GUADANA-43CC');
    await expect(first).toContainText('Equipment');
    await expect(first).toContainText('$289.00');
    await expect(page.getByText('Mostrando 1–10 de 12 productos')).toBeVisible();
    expect(api.requests[0].path).toBe('/api/v1/products?page=1&limit=10');

    await page.getByRole('button', { name: 'Página siguiente' }).click();
    await expect(page.getByText('Mostrando 11–12 de 12 productos')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(3);
    await expect(page.getByRole('row').nth(2)).toContainText('FERT-UREA-50KG');
    await expect(page.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  });

  test('visual: products maintainer table view', async ({ page }) => {
    await openProducts(page);
    await expect(page.getByRole('row')).toHaveCount(11);
    await settle(page);

    await expect(page).toHaveScreenshot('products-maintainer-list.png');
  });

  test('modal: "Nuevo Producto" renders every section and input', async ({ page }) => {
    await openProducts(page);
    await page.getByRole('button', { name: 'Nuevo Producto' }).click();

    const dialog = productDialog(page, 'Nuevo Producto');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Alta manual')).toBeVisible();
    await expect(dialog.getByText('Registra un insumo, cosecha o equipo en el catálogo de productos.')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cerrar' })).toBeVisible();

    for (const section of ['Información básica', 'Agronomía / Especificaciones', 'Empaque y precios', 'Control de stock']) {
      await expect(dialog.getByRole('region', { name: section })).toBeVisible();
    }

    for (const label of [
      'Nombre', 'SKU', 'Categoría',
      'Nombre científico', 'Ingrediente activo', 'Periodo de carencia (días)',
      'Unidad de medida', 'Presentación', 'Unidad presentación', 'Precio de costo', 'Precio de venta', 'Tasa de impuesto (%)',
      'Stock mínimo', 'Stock máximo', 'Punto de reorden',
    ]) {
      await expect(dialog.getByLabel(label, { exact: true })).toBeVisible();
    }
    await expect(dialog.getByLabel('Nombre', { exact: true })).toBeFocused();

    const type = dialog.getByRole('radiogroup', { name: 'Tipo de producto' });
    await expect(type.getByRole('radio')).toHaveText(['Insumo', 'Cosecha', 'Equipo']);
    await expect(type.getByRole('radio', { name: 'Insumo' })).toHaveAttribute('aria-checked', 'true');
    await expect(dialog.getByRole('radiogroup', { name: 'Estado' }).getByRole('radio', { name: 'Activo', exact: true })).toHaveAttribute('aria-checked', 'true');

    for (const name of [/Material peligroso/, /Rastreo por lote/, /Controla vencimiento/]) {
      await expect(dialog.getByRole('switch', { name })).not.toBeChecked();
    }

    // The field units (kg, saco, ton, qq) come first.
    const units = dialog.getByLabel('Unidad de medida', { exact: true }).locator('option');
    await expect(units.nth(0)).toHaveText('Kilogramo (kg)');
    await expect(units.nth(1)).toHaveText('Saco');
    await expect(units.nth(2)).toHaveText('Tonelada (ton)');
    await expect(units.nth(3)).toHaveText('Quintal (qq)');

    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Guardar Producto' })).toBeVisible();

    // The hazardous switch adds the section pill.
    await dialog.getByRole('switch', { name: /Material peligroso/ }).check({ force: true });
    await expect(dialog.getByText('Producto peligroso')).toBeVisible();
  });

  test('modal: validates before calling the API and closes with Cancelar, X and Escape', async ({ page }) => {
    await openProducts(page);
    const requestsBefore = api.requests.length;

    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    const dialog = productDialog(page, 'Nuevo Producto');
    await dialog.getByRole('button', { name: 'Guardar Producto' }).click();

    await expect(dialog.getByText('El nombre es obligatorio')).toBeVisible();
    await expect(dialog.getByText('El SKU es obligatorio')).toBeVisible();
    await expect(dialog.getByText('La categoría es obligatoria')).toBeVisible();
    await expect(dialog.getByText('El precio de costo es obligatorio')).toBeVisible();
    await expect(dialog.getByLabel('Nombre', { exact: true })).toHaveAttribute('aria-invalid', 'true');

    await dialog.getByLabel('Stock mínimo', { exact: true }).fill('50');
    await dialog.getByLabel('Stock máximo', { exact: true }).fill('10');
    await dialog.getByLabel('Presentación', { exact: true }).fill('25');
    await dialog.getByRole('button', { name: 'Guardar Producto' }).click();
    await expect(dialog.getByText('Debe ser mayor o igual al stock mínimo')).toBeVisible();
    await expect(dialog.getByText('Seleccione la unidad de la presentación')).toBeVisible();

    // Typing clears that field's error.
    await dialog.getByLabel('Nombre', { exact: true }).fill('Urea');
    await expect(dialog.getByText('El nombre es obligatorio')).toHaveCount(0);
    expect(api.requests.length).toBe(requestsBefore);

    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    await productDialog(page, 'Nuevo Producto').getByRole('button', { name: 'Cerrar' }).click();
    await expect(productDialog(page, 'Nuevo Producto')).toBeHidden();

    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    await page.keyboard.press('Escape');
    await expect(productDialog(page, 'Nuevo Producto')).toBeHidden();
  });

  test('visual: create product modal (light and dark)', async ({ page }) => {
    await openProducts(page);
    await expect(page.getByRole('row')).toHaveCount(11);
    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    await expect(productDialog(page, 'Nuevo Producto')).toBeVisible();
    // Blur the autofocused input so no caret/focus ring is captured.
    await page.getByLabel('Nombre', { exact: true }).blur();
    await settle(page);

    await expect(page).toHaveScreenshot('create-product-modal.png');

    // The theme toggle sits under the backdrop; switch themes with the dialog closed.
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('[data-theme="dark"]')).toBeVisible();
    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    await page.getByLabel('Nombre', { exact: true }).blur();
    await settle(page);

    await expect(page).toHaveScreenshot('create-product-modal-dark.png');
  });

  test('CRUD: creates, edits and deletes a product', async ({ page }) => {
    await openProducts(page);

    // --- create
    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    const create = productDialog(page, 'Nuevo Producto');
    await create.getByLabel('Nombre', { exact: true }).fill('Fertilizante foliar E2E');
    await create.getByLabel('SKU', { exact: true }).fill('e2e-foliar-1l');
    await create.getByLabel('Categoría', { exact: true }).fill('Fertilizante');
    await create.getByRole('radio', { name: 'Insumo' }).click();
    await create.getByLabel('Ingrediente activo', { exact: true }).fill('Nitrógeno, Boro');
    await create.getByLabel('Periodo de carencia (días)', { exact: true }).fill('3');
    await create.getByLabel('Unidad de medida', { exact: true }).selectOption({ label: 'Saco' });
    await create.getByLabel('Presentación', { exact: true }).fill('25');
    await create.getByLabel('Unidad presentación', { exact: true }).selectOption('kg');
    await create.getByLabel('Precio de costo', { exact: true }).fill('12.40');
    await create.getByLabel('Precio de venta', { exact: true }).fill('16.90');
    await create.getByLabel('Tasa de impuesto (%)', { exact: true }).fill('15');
    await create.getByLabel('Stock mínimo', { exact: true }).fill('5');
    await create.getByLabel('Stock máximo', { exact: true }).fill('60');
    await create.getByLabel('Punto de reorden', { exact: true }).fill('12');
    await create.getByRole('switch', { name: /Rastreo por lote/ }).check({ force: true });
    await create.getByRole('button', { name: 'Guardar Producto' }).click();

    await expect(create).toBeHidden();
    await expect(page.getByRole('status').filter({ hasText: 'Producto E2E-FOLIAR-1L creado' })).toBeVisible();

    const post = api.requests.find((r) => r.method === 'POST');
    expect(post?.body).toMatchObject({
      name: 'Fertilizante foliar E2E',
      sku: 'e2e-foliar-1l',
      category: 'Fertilizante',
      productType: 'input',
      activeIngredient: 'Nitrógeno, Boro',
      safetyPeriodDays: 3,
      unitOfMeasure: 'bag',
      presentationSize: 25,
      presentationUnit: 'kg',
      costPrice: 12.4,
      sellingPrice: 16.9,
      taxRate: 15,
      minStockLevel: 5,
      maxStockLevel: 60,
      reorderPoint: 12,
      requiresBatchTracking: true,
      isHazardous: false,
      scientificName: null,
      status: 'active',
    });

    // Newest first: the new product is the first row on page 1.
    const row = page.getByRole('row', { name: /E2E-FOLIAR-1L/ });
    await expect(page.getByRole('row').nth(1)).toContainText('E2E-FOLIAR-1L');
    await expect(row).toContainText('Fertilizante foliar E2E');
    await expect(row).toContainText('Input');
    await expect(row).toContainText('saco');
    await expect(row).toContainText('$16.90');
    await expect(row).toContainText('Active');
    await expect(page.getByText('Mostrando 1–10 de 13 productos')).toBeVisible();

    // --- edit
    await row.getByRole('button', { name: 'Editar E2E-FOLIAR-1L' }).click();
    const edit = productDialog(page, 'Editar Producto');
    await expect(edit).toBeVisible();
    await expect(edit.getByText('Edición · E2E-FOLIAR-1L')).toBeVisible();
    await expect(edit.getByLabel('Nombre', { exact: true })).toHaveValue('Fertilizante foliar E2E');
    await expect(edit.getByLabel('Precio de venta', { exact: true })).toHaveValue('16.9');
    await expect(edit.getByRole('switch', { name: /Rastreo por lote/ })).toBeChecked();

    await edit.getByLabel('Nombre', { exact: true }).fill('Fertilizante foliar E2E Plus');
    await edit.getByLabel('Precio de venta', { exact: true }).fill('18.25');
    await edit.getByRole('radiogroup', { name: 'Estado' }).getByRole('radio', { name: 'Inactivo', exact: true }).click();
    await edit.getByRole('button', { name: 'Guardar Producto' }).click();

    await expect(edit).toBeHidden();
    await expect(page.getByRole('status').filter({ hasText: 'Producto actualizado' })).toBeVisible();
    const patch = api.requests.find((r) => r.method === 'PATCH');
    expect(patch?.path).toMatch(/^\/api\/v1\/products\/[0-9a-f-]{36}$/);
    expect(patch?.body).toMatchObject({ name: 'Fertilizante foliar E2E Plus', sellingPrice: 18.25, status: 'inactive' });

    await expect(row).toContainText('Fertilizante foliar E2E Plus');
    await expect(row).toContainText('$18.25');
    await expect(row).toContainText('Inactive');

    // --- delete: cancel first, then confirm
    await row.getByRole('button', { name: 'Eliminar E2E-FOLIAR-1L' }).click();
    const confirm = page.getByRole('alertdialog', { name: '¿Está seguro de eliminar este producto?' });
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText('Fertilizante foliar E2E Plus');
    await confirm.getByRole('button', { name: 'Cancelar' }).click();
    await expect(confirm).toBeHidden();
    await expect(row).toBeVisible();
    expect(api.requests.some((r) => r.method === 'DELETE')).toBe(false);

    await row.getByRole('button', { name: 'Eliminar E2E-FOLIAR-1L' }).click();
    await confirm.getByRole('button', { name: 'Eliminar' }).click();

    await expect(confirm).toBeHidden();
    await expect(page.getByRole('status').filter({ hasText: 'Producto E2E-FOLIAR-1L eliminado' })).toBeVisible();
    await expect(page.getByRole('row', { name: /E2E-FOLIAR-1L/ })).toHaveCount(0);
    await expect(page.getByText('Mostrando 1–10 de 12 productos')).toBeVisible();
    expect(api.products.some((p) => p.sku === 'E2E-FOLIAR-1L')).toBe(false);
  });

  test('create: shows the server error for a duplicate SKU and keeps the modal open', async ({ page }) => {
    await openProducts(page);
    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    const dialog = productDialog(page, 'Nuevo Producto');

    await dialog.getByLabel('Nombre', { exact: true }).fill('Urea duplicada');
    await dialog.getByLabel('SKU', { exact: true }).fill('fert-urea-50kg');
    await dialog.getByLabel('Categoría', { exact: true }).fill('fertilizante');
    await dialog.getByLabel('Precio de costo', { exact: true }).fill('1');
    await dialog.getByLabel('Precio de venta', { exact: true }).fill('2');
    await dialog.getByRole('button', { name: 'Guardar Producto' }).click();

    const message = 'A product with SKU FERT-UREA-50KG already exists';
    await expect(dialog.getByRole('alert')).toHaveText(message);
    await expect(page.getByRole('alert').filter({ hasText: message }).last()).toBeVisible();
    await expect(dialog).toBeVisible();
  });
});

test.describe('products maintainer: empty and error states', () => {
  test('shows the empty state with a create action when there are no products', async ({ page }) => {
    await mockProductService(page, []);
    await openProducts(page);

    await expect(page.getByText('No products yet')).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    await expect(productDialog(page, 'Nuevo Producto')).toBeVisible();
  });

  test('shows an error state with a retry when the list fails', async ({ page }) => {
    const api = await mockProductService(page);
    api.failLists(500);
    await openProducts(page);

    await expect(page.getByText('No se pudieron cargar los productos')).toBeVisible();
    await expect(page.getByText('product-service unavailable')).toBeVisible();

    api.failLists(null);
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByRole('row')).toHaveCount(11);
  });

  // A build without VITE_PRODUCTSERVICE_BASE_URL gets the SPA's index.html (200, text/html) instead of JSON.
  test('shows the error state instead of crashing when the list response is HTML', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));
    await mockProductService(page);
    await page.route(
      (url) => url.pathname === '/api/v1/products',
      (route) =>
        route.request().method() === 'GET'
          ? route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html></html>' })
          : route.fallback(),
    );
    await openProducts(page);

    await expect(page.getByText('No se pudieron cargar los productos')).toBeVisible();
    await expect(page.getByText(/VITE_PRODUCTSERVICE_BASE_URL/)).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});
