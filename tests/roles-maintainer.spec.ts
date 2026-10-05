import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth';
import { mockAuthService, PERMISSION_MATRIX, ROLE_IDS, type AuthServiceMock } from './fixtures/auth-service';

// Roles & Permissions (/roles, Admisiones "Permisos del panel" design) against the in-browser auth-service
// mock: the role × permission matrix (row toggles, bulk buttons, search, unsaved-changes guard, admin lock,
// save) and the "Administrar roles" tab (create with auto identifier, edit, delete guards), plus screenshots.

const openRoles = async (page: Page) => {
  await page.goto('/roles');
  await expect(page.getByRole('heading', { name: 'Roles & Permissions', level: 1 })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
};

const settle = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(0, 0);
};

const permissionId = (code: string) =>
  PERMISSION_MATRIX.resources.flatMap((r) => r.permissions).find((p) => p.code === code)!.id;

const cell = (page: Page, label: string) => page.getByRole('checkbox', { name: label, exact: true });
const roleSelect = (page: Page) => page.getByLabel('Rol', { exact: true });

test.describe('roles & permissions', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  let api: AuthServiceMock;

  test.beforeEach(async ({ page }) => {
    api = await mockAuthService(page);
  });

  test('matrix: opens an editable role and shows its permissions', async ({ page }) => {
    await openRoles(page);

    await expect(page.getByRole('tab', { name: 'Roles y permisos' })).toHaveAttribute('aria-selected', 'true');
    // The first non-admin role, not the locked admin.
    await expect(roleSelect(page)).toHaveValue(ROLE_IDS.operator);
    await expect(page.getByRole('columnheader')).toHaveText(['Recurso', 'Ver', 'Crear', 'Editar', 'Eliminar']);
    await expect(page.locator('tbody tr')).toHaveCount(4);

    await expect(cell(page, 'Editar Products')).toBeChecked();
    await expect(cell(page, 'Eliminar Products')).not.toBeChecked();
    await expect(cell(page, 'Ver Users')).not.toBeChecked();
    // Products has 3 of 4 → the row checkbox is indeterminate.
    await expect(page.getByRole('checkbox', { name: 'Todos los permisos de Products' })).toHaveAttribute('aria-checked', 'mixed');
    await expect(page.getByText('6 de 16 permisos seleccionados')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  test('matrix: toggling cells and rows marks the draft dirty, and "Guardar cambios" PUTs the whole set', async ({ page }) => {
    await openRoles(page);

    await cell(page, 'Eliminar Products').check();
    await expect(page.getByRole('checkbox', { name: 'Todos los permisos de Products' })).toBeChecked();
    await page.getByRole('checkbox', { name: 'Todos los permisos de Users' }).check();
    await expect(cell(page, 'Eliminar Users')).toBeChecked();
    // Orders is partial (3 of 4): the first click completes the row, the second clears it.
    const ordersRow = page.getByRole('checkbox', { name: 'Todos los permisos de Orders' });
    await ordersRow.click();
    await expect(cell(page, 'Eliminar Orders')).toBeChecked();
    await ordersRow.click();
    await expect(cell(page, 'Ver Orders')).not.toBeChecked();
    await expect(page.getByText('8 de 16 permisos seleccionados · cambios sin guardar')).toBeVisible();

    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Permisos de Operator guardados')).toBeVisible();
    await expect(page.getByText('cambios sin guardar')).toHaveCount(0);

    const put = api.requests.find((r) => r.method === 'PUT');
    expect(put?.path).toBe(`/api/v1/roles/${ROLE_IDS.operator}/permissions`);
    const expected = ['products:view', 'products:create', 'products:edit', 'products:delete', 'users:view', 'users:create', 'users:edit', 'users:delete'].map(permissionId);
    expect([...(put?.body as { permissionIds: string[] }).permissionIds].sort()).toEqual(expected.sort());
  });

  test('matrix: search narrows the rows, and the bulk buttons only touch visible rows', async ({ page }) => {
    await openRoles(page);

    await page.getByLabel('Buscar permiso').fill('users:');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await page.getByRole('button', { name: 'Marcar todos', exact: true }).click();
    await expect(page.getByText('10 de 16 permisos seleccionados')).toBeVisible();

    await page.getByLabel('Buscar permiso').fill('zzz');
    await expect(page.getByText('Ningún permiso coincide con «zzz».')).toBeVisible();

    await page.getByLabel('Buscar permiso').fill('');
    await page.getByRole('button', { name: 'Desmarcar todos' }).click();
    await expect(page.getByText('0 de 16 permisos seleccionados')).toBeVisible();
  });

  test('matrix: switching roles with unsaved changes asks before discarding them', async ({ page }) => {
    await openRoles(page);
    await cell(page, 'Ver Users').check();

    await roleSelect(page).selectOption(ROLE_IDS.viewer);
    const dialog = page.getByRole('alertdialog', { name: '¿Descartar los cambios sin guardar?' });
    await expect(dialog).toContainText('Operator');
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(roleSelect(page)).toHaveValue(ROLE_IDS.operator);
    await expect(cell(page, 'Ver Users')).toBeChecked();

    await roleSelect(page).selectOption(ROLE_IDS.viewer);
    await dialog.getByRole('button', { name: 'Descartar' }).click();
    await expect(roleSelect(page)).toHaveValue(ROLE_IDS.viewer);
    await expect(page.getByText('2 de 16 permisos seleccionados')).toBeVisible();

    // Back to Operator: the discarded draft is gone.
    await roleSelect(page).selectOption(ROLE_IDS.operator);
    await expect(cell(page, 'Ver Users')).not.toBeChecked();
    expect(api.requests.filter((r) => r.method === 'PUT')).toHaveLength(0);
  });

  test('matrix: the admin role is fully checked and locked', async ({ page }) => {
    await openRoles(page);
    await roleSelect(page).selectOption(ROLE_IDS.admin);

    await expect(page.getByText('El rol Administrador siempre tiene todos los permisos').first()).toBeVisible();
    await expect(page.getByText('16 de 16 permisos seleccionados')).toBeVisible();
    await expect(cell(page, 'Eliminar Roles & permissions')).toBeChecked();
    await expect(cell(page, 'Eliminar Roles & permissions')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Marcar todos', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Guardar cambios' })).toHaveCount(0);
  });

  test('manage: creates a role with an auto-generated identifier', async ({ page }) => {
    await openRoles(page);
    await page.getByRole('tab', { name: 'Administrar roles' }).click();

    const name = page.getByLabel('Nombre visible', { exact: true });
    const key = page.getByLabel('Identificador', { exact: true });
    await name.fill('Supervisor de Riego');
    await expect(key).toHaveValue('supervisor_de_riego');

    // A hand-edited identifier stops following the name.
    await key.fill('riego');
    await name.fill('Supervisor de riego y drenaje');
    await expect(key).toHaveValue('riego');

    await key.fill('Bad-Key');
    await page.getByRole('button', { name: 'Crear rol' }).click();
    await expect(page.getByText('2–50 caracteres: minúsculas, números y _, empezando por una letra')).toBeVisible();
    expect(api.requests.filter((r) => r.method === 'POST')).toHaveLength(0);

    await key.fill('riego');
    await page.getByRole('button', { name: 'Crear rol' }).click();
    await expect(page.getByText('Rol Supervisor de riego y drenaje creado')).toBeVisible();
    expect(api.requests.find((r) => r.method === 'POST')?.body).toEqual({ name: 'Supervisor de riego y drenaje', key: 'riego' });
    await expect(page.getByRole('article', { name: 'Supervisor de riego y drenaje' })).toContainText('0 usuarios');
    await expect(name).toHaveValue('');
  });

  test('manage: delete is disabled for system roles and roles with users; a free custom role can be deleted', async ({ page }) => {
    await openRoles(page);
    await page.getByRole('tab', { name: 'Administrar roles' }).click();

    const operator = page.getByRole('article', { name: 'Operator' });
    await expect(operator.getByText('Sistema')).toBeVisible();
    await expect(operator.getByRole('button', { name: 'Eliminar rol Operator' })).toBeDisabled();
    await expect(operator.getByRole('button', { name: 'Eliminar rol Operator' })).toHaveAttribute('title', 'Los roles del sistema no se pueden eliminar');

    const custom = page.getByRole('article', { name: 'Field supervisor' });
    await custom.getByRole('button', { name: 'Eliminar rol Field supervisor' }).click();
    await page.getByRole('alertdialog', { name: '¿Está seguro de eliminar este rol?' }).getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Rol Field supervisor eliminado')).toBeVisible();
    await expect(custom).toHaveCount(0);
    expect(api.roles.some((r) => r.key === 'field_supervisor')).toBe(false);
  });

  test('manage: edits a role name and description; the identifier stays read-only', async ({ page }) => {
    await openRoles(page);
    await page.getByRole('tab', { name: 'Administrar roles' }).click();
    await page.getByRole('button', { name: 'Editar rol Field supervisor' }).click();

    const modal = page.getByRole('dialog', { name: 'Editar rol' });
    await expect(modal.getByLabel('Identificador', { exact: true })).toHaveAttribute('readonly', '');
    await modal.getByLabel('Nombre visible', { exact: true }).fill('Supervisor de campo');
    await modal.getByLabel('Descripción', { exact: true }).fill('Revisa lotes y cosechas');
    await modal.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(modal).toBeHidden();
    await expect(page.getByRole('article', { name: 'Supervisor de campo' })).toContainText('Revisa lotes y cosechas');
    expect(api.requests.find((r) => r.method === 'PATCH')?.body).toEqual({ name: 'Supervisor de campo', description: 'Revisa lotes y cosechas' });
  });

  test('visual: matrix (light and dark) and the manage tab match the baselines', async ({ page }) => {
    await openRoles(page);
    await settle(page);
    await expect(page).toHaveScreenshot('roles-matrix.png');

    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await settle(page);
    await expect(page).toHaveScreenshot('roles-matrix-dark.png');

    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await page.getByRole('tab', { name: 'Administrar roles' }).click();
    await settle(page);
    await expect(page).toHaveScreenshot('roles-manage.png');
  });
});
