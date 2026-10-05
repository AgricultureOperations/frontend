import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth';
import { mockAuthService, ROLE_IDS, type AuthServiceMock } from './fixtures/auth-service';

// Users maintainer (/users, Admisiones "Asesores" design) against the in-browser auth-service mock
// (tests/fixtures/auth-service.ts): list, search/filters/paging in the URL, the create/edit drawer,
// inline role change (optimistic + revert on 409), deactivate/delete confirmations, 403 handling and screenshots.

const openUsers = async (page: Page, query = '') => {
  await page.goto(`/users${query}`);
  await expect(page.getByRole('heading', { name: 'Users', level: 1 })).toBeVisible();
};

const settle = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(0, 0);
};

// Data rows only (the header row is in <thead>).
const bodyRows = (page: Page) => page.locator('tbody tr');
const row = (page: Page, email: string) => bodyRows(page).filter({ hasText: email });

test.describe('users maintainer', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  let api: AuthServiceMock;

  test.beforeEach(async ({ page }) => {
    api = await mockAuthService(page);
  });

  test('list: columns, first page sorted by name, pagination and the own-row guard', async ({ page }) => {
    await openUsers(page);

    await expect(page.getByRole('columnheader')).toHaveText(['Usuario', 'Correo', 'Estado', 'Rol', 'Acciones']);
    await expect(bodyRows(page)).toHaveCount(10);
    await expect(bodyRows(page).first()).toContainText('Ana Alcívar');
    await expect(page.getByText('1–10 de 12')).toBeVisible();
    expect(api.requests.find((r) => r.path.startsWith('/api/v1/user'))?.path).toBe('/api/v1/user?page=1&pageSize=10');

    const inactive = row(page, 'diego.ricaurte@agriops.io');
    await expect(inactive.getByText('Inactivo')).toBeVisible();
    await expect(inactive.getByRole('button', { name: /^Habilitar/ })).toBeVisible();

    // The signed-in admin can edit their name but not change their own role, status or delete themselves.
    const self = row(page, 'edward.cruz@agriops.io');
    await expect(self.getByText('Tú')).toBeVisible();
    await expect(self.getByRole('button', { name: 'Editar edward.cruz@agriops.io' })).toBeVisible();
    await expect(self.getByRole('combobox')).toHaveCount(0);
    await expect(self.getByRole('button', { name: /Inhabilitar|Eliminar/ })).toHaveCount(0);
  });

  test('search is debounced into the URL, and an empty result offers "Limpiar filtros"', async ({ page }) => {
    await openUsers(page);

    await page.getByLabel('Buscar usuario').fill('bruno');
    await expect(page).toHaveURL(/\?q=bruno$/);
    await expect(bodyRows(page)).toHaveCount(1);
    await expect(bodyRows(page).first()).toContainText('bruno.sierra@agriops.io');

    await page.getByLabel('Buscar usuario').fill('zzz');
    await expect(page.getByText('No hay usuarios para este filtro')).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar filtros' }).click();
    await expect(page).toHaveURL(/\/users$/);
    await expect(bodyRows(page)).toHaveCount(10);
    await expect(page.getByLabel('Buscar usuario')).toHaveValue('');
  });

  test('status and role filters, page size and page number live in the URL', async ({ page }) => {
    await openUsers(page);

    await page.getByLabel('Filtrar por estado').selectOption('inactive');
    await expect(page).toHaveURL(/status=inactive/);
    await expect(bodyRows(page)).toHaveCount(2);
    expect(api.requests.at(-1)?.path).toContain('isActive=false');

    await page.getByLabel('Filtrar por estado').selectOption('all');
    await page.getByLabel('Filtrar por rol').selectOption(ROLE_IDS.operator);
    await expect(page).toHaveURL(new RegExp(`role=${ROLE_IDS.operator}`));
    await expect(bodyRows(page)).toHaveCount(4);

    await page.getByLabel('Filtrar por rol').selectOption('');
    await page.getByLabel('Filas por página').selectOption('5');
    await expect(page).toHaveURL(/size=5/);
    await expect(page.getByText('1–5 de 12')).toBeVisible();
    await page.getByRole('button', { name: 'Página 3' }).click();
    await expect(page).toHaveURL(/page=3/);
    await expect(bodyRows(page)).toHaveCount(2);

    // A reload (or a shared link) shows the same list.
    await page.reload();
    await expect(page.getByText('11–12 de 12')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Página 3' })).toHaveAttribute('aria-current', 'page');
  });

  test('create drawer: fields, validation and a disabled submit until valid', async ({ page }) => {
    await openUsers(page);
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();

    const drawer = page.getByRole('dialog', { name: 'Nuevo usuario' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByLabel('Rol', { exact: true })).toHaveValue(ROLE_IDS.viewer);
    const submit = drawer.getByRole('button', { name: 'Crear usuario' });
    await expect(submit).toBeDisabled();

    await drawer.getByLabel('Correo', { exact: true }).fill('not-an-email');
    await drawer.getByLabel('Correo', { exact: true }).blur();
    await expect(drawer.getByText('Ingrese un correo válido')).toBeVisible();
    await drawer.getByLabel('Contraseña', { exact: true }).fill('short');
    await drawer.getByLabel('Contraseña', { exact: true }).blur();
    await expect(drawer.getByText('Mínimo 8 caracteres', { exact: true })).toBeVisible();
    await expect(submit).toBeDisabled();

    await drawer.getByRole('button', { name: 'Mostrar contraseña' }).click();
    await expect(drawer.getByLabel('Contraseña', { exact: true })).toHaveAttribute('type', 'text');

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    expect(api.requests.filter((r) => r.method === 'POST')).toHaveLength(0);
  });

  test('create → edit → inline role change → deactivate → delete, with toasts and request bodies', async ({ page }) => {
    await openUsers(page);

    // create
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    const create = page.getByRole('dialog', { name: 'Nuevo usuario' });
    await create.getByLabel('Nombre', { exact: true }).fill('Aaron Zambrano');
    await create.getByLabel('Correo', { exact: true }).fill('Aaron.Zambrano@agriops.io');
    await create.getByLabel('Contraseña', { exact: true }).fill('secret123');
    await create.getByLabel('Rol', { exact: true }).selectOption(ROLE_IDS.operator);
    await create.getByRole('button', { name: 'Crear usuario' }).click();
    await expect(create).toBeHidden();
    await expect(page.getByRole('status').filter({ hasText: 'Usuario aaron.zambrano@agriops.io creado' })).toBeVisible();
    expect(api.requests.find((r) => r.method === 'POST')?.body).toEqual({
      name: 'Aaron Zambrano',
      email: 'aaron.zambrano@agriops.io',
      password: 'secret123',
      roleId: ROLE_IDS.operator,
    });
    await expect(bodyRows(page).first()).toContainText('aaron.zambrano@agriops.io');

    // edit: the email is read-only
    await page.getByRole('button', { name: 'Editar aaron.zambrano@agriops.io' }).click();
    const edit = page.getByRole('dialog', { name: 'Editar usuario' });
    await expect(edit.getByLabel('Correo', { exact: true })).toHaveAttribute('readonly', '');
    await expect(edit.getByText('El correo no puede ser editado')).toBeVisible();
    await edit.getByLabel('Nombre', { exact: true }).fill('Aarón Zambrano');
    await edit.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(edit).toBeHidden();
    await expect(bodyRows(page).first()).toContainText('Aarón Zambrano');
    const patch = api.requests.find((r) => r.method === 'PATCH');
    expect(patch?.body).toEqual({ name: 'Aarón Zambrano' });

    // inline role change
    const newRow = row(page, 'aaron.zambrano@agriops.io');
    await newRow.getByRole('combobox', { name: 'Rol de Aarón Zambrano' }).selectOption(ROLE_IDS.viewer);
    await expect(page.getByText('Rol de Aarón Zambrano actualizado a Viewer')).toBeVisible();
    expect(api.requests.find((r) => r.path.endsWith('/role'))?.body).toEqual({ roleId: ROLE_IDS.viewer });

    // deactivate asks first; Cancelar keeps the user active
    await newRow.getByRole('button', { name: 'Inhabilitar aaron.zambrano@agriops.io' }).click();
    const confirmStatus = page.getByRole('alertdialog', { name: '¿Inhabilitar este usuario?' });
    await confirmStatus.getByRole('button', { name: 'Cancelar' }).click();
    await expect(newRow.getByText('Activo')).toBeVisible();
    await newRow.getByRole('button', { name: 'Inhabilitar aaron.zambrano@agriops.io' }).click();
    await confirmStatus.getByRole('button', { name: 'Inhabilitar' }).click();
    await expect(newRow.getByText('Inactivo')).toBeVisible();
    expect(api.requests.find((r) => r.path.endsWith('/status'))?.body).toEqual({ isActive: false });

    // delete
    await newRow.getByRole('button', { name: 'Eliminar aaron.zambrano@agriops.io' }).click();
    await page.getByRole('alertdialog', { name: '¿Está seguro de eliminar este usuario?' }).getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Usuario aaron.zambrano@agriops.io eliminado')).toBeVisible();
    await expect(row(page, 'aaron.zambrano@agriops.io')).toHaveCount(0);
    expect(api.users.some((u) => u.email === 'aaron.zambrano@agriops.io')).toBe(false);
  });

  test('a refused inline role change (409) shows the message and reverts the select', async ({ page }) => {
    await openUsers(page);
    api.failNext('PATCH', /\/role$/, 409, 'Cannot demote the last active admin');

    const select = row(page, 'ana.alcivar@agriops.io').getByRole('combobox', { name: 'Rol de Ana Alcívar' });
    await expect(select).toHaveValue(ROLE_IDS.operator);
    await select.selectOption(ROLE_IDS.viewer);

    await expect(page.getByRole('alert').filter({ hasText: 'Cannot demote the last active admin' })).toBeVisible();
    await expect(select).toHaveValue(ROLE_IDS.operator);
  });

  test('a 403 shows a toast and keeps the session (no redirect to /login)', async ({ page }) => {
    await openUsers(page);
    api.failNext('PATCH', /\/status$/, 403, "You don't have permission to do this");

    await row(page, 'bruno.sierra@agriops.io').getByRole('button', { name: 'Inhabilitar bruno.sierra@agriops.io' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Inhabilitar' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'No tienes permiso para realizar esta acción' })).toBeVisible();
    await expect(page).toHaveURL(/\/users$/);
    expect(await page.evaluate(() => window.localStorage.getItem('token'))).not.toBeNull();
  });

  test('visual: list and create drawer match the light and dark baselines', async ({ page }) => {
    await openUsers(page);
    await expect(bodyRows(page)).toHaveCount(10);
    await settle(page);
    await expect(page).toHaveScreenshot('users-maintainer-list.png');

    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await expect(page.getByRole('dialog', { name: 'Nuevo usuario' })).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('create-user-drawer.png');

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await settle(page);
    await expect(page).toHaveScreenshot('create-user-drawer-dark.png');
  });
});
