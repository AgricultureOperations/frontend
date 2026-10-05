import type { Page, Route } from '@playwright/test';

// In-browser stand-in for auth-service's RBAC endpoints (see auth-service/docs/rbac-handoff.md):
// GET /auth/me, /user (paginated + filters), /roles, /permissions and their mutations, with the
// same guardrails (409 last admin, system roles, roles with users, admin can't lose permissions).
// State lives per test, so create → edit → delete flows behave like the real backend.

export interface MockRoleRef {
  id: string;
  key: string;
  name: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface MockRole extends MockRoleRef {
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissionIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Fixed clock so screenshots and ordering are deterministic.
const BASE_TIME = Date.parse('2026-09-01T12:00:00.000Z');
const at = (n: number) => new Date(BASE_TIME + n * 60_000).toISOString();
const uuid = (prefix: number, n: number) => `${String(prefix).padStart(8, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const ACTIONS = [
  { id: uuid(1, 1), key: 'view', name: 'View' },
  { id: uuid(1, 2), key: 'create', name: 'Create' },
  { id: uuid(1, 3), key: 'edit', name: 'Edit' },
  { id: uuid(1, 4), key: 'delete', name: 'Delete' },
];

const RESOURCES = [
  { key: 'products', name: 'Products', description: 'Product catalog (product-service)' },
  { key: 'orders', name: 'Orders', description: 'Orders (order-service)' },
  { key: 'users', name: 'Users', description: 'Platform users' },
  { key: 'roles', name: 'Roles & permissions', description: 'Roles and their permissions' },
].map((r, i) => ({
  id: uuid(2, i + 1),
  ...r,
  sortOrder: (i + 1) * 10,
  permissions: ACTIONS.map((a, j) => ({ id: uuid(3, i * 10 + j + 1), code: `${r.key}:${a.key}`, actionId: a.id, actionKey: a.key })),
}));

export const PERMISSION_MATRIX = { actions: ACTIONS, resources: RESOURCES };
const ALL_PERMISSIONS = RESOURCES.flatMap((r) => r.permissions);
const idsOf = (...codes: string[]) => ALL_PERMISSIONS.filter((p) => codes.includes(p.code)).map((p) => p.id);
export const ALL_PERMISSION_CODES = ALL_PERMISSIONS.map((p) => p.code);

export const ROLE_IDS = { admin: uuid(4, 1), operator: uuid(4, 2), viewer: uuid(4, 3), supervisor: uuid(4, 4) };

const seedRoles = (): MockRole[] => [
  { id: ROLE_IDS.admin, key: 'admin', name: 'Administrator', description: 'Full access, including users and roles', isSystem: true, isActive: true, permissionIds: ALL_PERMISSIONS.map((p) => p.id), createdAt: at(0), updatedAt: at(0) },
  { id: ROLE_IDS.operator, key: 'operator', name: 'Operator', description: 'Manages products and orders', isSystem: true, isActive: true, permissionIds: idsOf('products:view', 'products:create', 'products:edit', 'orders:view', 'orders:create', 'orders:edit'), createdAt: at(0), updatedAt: at(0) },
  { id: ROLE_IDS.viewer, key: 'viewer', name: 'Viewer', description: 'Read-only access to products and orders', isSystem: true, isActive: true, permissionIds: idsOf('products:view', 'orders:view'), createdAt: at(0), updatedAt: at(0) },
  { id: ROLE_IDS.supervisor, key: 'field_supervisor', name: 'Field supervisor', description: 'Custom role without users', isSystem: false, isActive: true, permissionIds: idsOf('products:view'), createdAt: at(1), updatedAt: at(1) },
];

// The signed-in user (FAKE_EMAIL in fixtures/auth.ts) is the first admin.
export const CURRENT_USER_ID = uuid(5, 1);

const SEED_USERS: [string, string, keyof typeof ROLE_IDS, boolean][] = [
  ['Edward Cruz', 'edward.cruz@agriops.io', 'admin', true],
  ['Ana Alcívar', 'ana.alcivar@agriops.io', 'operator', true],
  ['Bruno Sierra', 'bruno.sierra@agriops.io', 'viewer', true],
  ['Carla Montaño', 'carla.montano@agriops.io', 'operator', true],
  ['Diego Ricaurte', 'diego.ricaurte@agriops.io', 'viewer', false],
  ['Elena Yépez', 'elena.yepez@agriops.io', 'viewer', true],
  ['Fabián López', 'fabian.lopez@agriops.io', 'operator', true],
  ['Gabriela Cerezo', 'gabriela.cerezo@agriops.io', 'viewer', true],
  ['Hugo Ávila', 'hugo.avila@agriops.io', 'viewer', true],
  ['Irene Navarro', 'irene.navarro@agriops.io', 'operator', false],
  ['Jorge Tomalá', 'jorge.tomala@agriops.io', 'viewer', true],
  ['Karina Gonzalez', 'karina.gonzalez@agriops.io', 'viewer', true],
];

const seedUsers = (): MockUser[] =>
  SEED_USERS.map(([name, email, role, isActive], i) => ({
    id: uuid(5, i + 1),
    name,
    email,
    isActive,
    roleId: ROLE_IDS[role],
    createdAt: at(i + 2),
    updatedAt: at(i + 2),
    lastLoginAt: null,
  }));

export interface AuthServiceMock {
  users: MockUser[];
  roles: MockRole[];
  requests: { method: string; path: string; body: unknown }[];
  // The next request matching method + path pattern answers with this status and message (e.g. 403).
  failNext: (method: string, path: RegExp, status: number, message: string) => void;
}

export interface AuthServiceOptions {
  // Role of the signed-in user (default admin). A viewer sees the permission-gated UI.
  currentRole?: keyof typeof ROLE_IDS;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

// Every auth-service route this app calls with a token. /api/v1/auth/login and /register are left alone.
export const isAuthServiceUrl = (url: URL) => /^\/api\/v1\/(auth\/me|user|roles|permissions)(\/|$)/.test(url.pathname);

export async function mockAuthService(page: Page, { currentRole = 'admin' }: AuthServiceOptions = {}): Promise<AuthServiceMock> {
  let counter = 100;
  let failure: { method: string; path: RegExp; status: number; message: string } | null = null;
  const mock: AuthServiceMock = {
    users: seedUsers(),
    roles: seedRoles(),
    requests: [],
    failNext: (method, path, status, message) => {
      failure = { method, path, status, message };
    },
  };
  mock.users[0].roleId = ROLE_IDS[currentRole];

  const json = (route: Route, status: number, body?: unknown) =>
    route.fulfill({ status, headers: CORS, contentType: 'application/json', body: body === undefined ? '' : JSON.stringify(body) });
  const error = (route: Route, status: number, message: string) => json(route, status, { status: 'error', message });

  const roleOf = (user: MockUser) => mock.roles.find((r) => r.id === user.roleId)!;
  // Same shape as auth-service's toUserDto: role as { id, key, name }, no roleId.
  const userDto = (user: MockUser) => {
    const role = roleOf(user);
    const { id, name, email, isActive, createdAt, updatedAt, lastLoginAt } = user;
    return { id, name, email, isActive, role: { id: role.id, key: role.key, name: role.name }, createdAt, updatedAt, lastLoginAt };
  };
  const roleDto = (role: MockRole) => ({ ...role, userCount: mock.users.filter((u) => u.roleId === role.id).length });
  const activeAdmins = () => mock.users.filter((u) => u.isActive && roleOf(u).key === 'admin');
  const isLastAdmin = (user: MockUser) => user.isActive && roleOf(user).key === 'admin' && activeAdmins().length === 1;

  await page.route(isAuthServiceUrl, async (route) => {
    const request = route.request();
    const method = request.method();
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });

    const url = new URL(request.url());
    const path = url.pathname;
    const body = request.postData() ? request.postDataJSON() : undefined;
    mock.requests.push({ method, path: path + url.search, body });

    if (failure && failure.method === method && failure.path.test(path)) {
      const { status, message } = failure;
      failure = null;
      return error(route, status, message);
    }

    // GET /auth/me
    if (path === '/api/v1/auth/me') {
      const me = mock.users[0];
      const role = roleOf(me);
      const permissions = ALL_PERMISSIONS.filter((p) => role.permissionIds.includes(p.id)).map((p) => p.code);
      return json(route, 200, { ...userDto(me), permissions });
    }

    // GET /permissions
    if (path === '/api/v1/permissions') return json(route, 200, PERMISSION_MATRIX);

    // /user
    const userMatch = path.match(/^\/api\/v1\/user(?:\/([^/]+))?(?:\/(role|status))?$/);
    if (userMatch) {
      const [, id, sub] = userMatch;
      if (!id && method === 'GET') {
        const search = (url.searchParams.get('search') ?? '').toLowerCase();
        const roleId = url.searchParams.get('roleId');
        const isActive = url.searchParams.get('isActive');
        const pageNo = Number(url.searchParams.get('page') ?? 1);
        const pageSize = Number(url.searchParams.get('pageSize') ?? 10);
        const rows = mock.users
          .filter((u) => !search || u.name.toLowerCase().includes(search) || u.email.includes(search))
          .filter((u) => !roleId || u.roleId === roleId)
          .filter((u) => isActive === null || String(u.isActive) === isActive)
          .sort((a, b) => a.name.localeCompare(b.name));
        return json(route, 200, {
          data: rows.slice((pageNo - 1) * pageSize, pageNo * pageSize).map(userDto),
          meta: { page: pageNo, pageSize, total: rows.length, totalPages: Math.ceil(rows.length / pageSize) },
        });
      }
      if (!id && method === 'POST') {
        if (mock.users.some((u) => u.email === body.email)) return error(route, 409, 'A user with this email already exists');
        const created: MockUser = { id: uuid(5, ++counter), name: body.name, email: body.email, isActive: true, roleId: body.roleId, createdAt: at(counter), updatedAt: at(counter), lastLoginAt: null };
        mock.users.push(created);
        return json(route, 201, userDto(created));
      }
      const user = mock.users.find((u) => u.id === id);
      if (!user) return error(route, 404, 'User not found');
      if (method === 'PATCH' && sub === 'role') {
        const role = mock.roles.find((r) => r.id === body.roleId);
        if (!role) return error(route, 404, 'Role not found');
        if (role.key !== 'admin' && isLastAdmin(user)) return error(route, 409, 'Cannot demote the last active admin');
        user.roleId = role.id;
        return json(route, 200, userDto(user));
      }
      if (method === 'PATCH' && sub === 'status') {
        if (!body.isActive && isLastAdmin(user)) return error(route, 409, 'Cannot deactivate the last active admin');
        user.isActive = body.isActive;
        return json(route, 200, userDto(user));
      }
      if (method === 'PATCH') {
        user.name = body.name;
        return json(route, 200, userDto(user));
      }
      if (method === 'DELETE') {
        if (isLastAdmin(user)) return error(route, 409, 'Cannot delete the last active admin');
        mock.users = mock.users.filter((u) => u.id !== id);
        return route.fulfill({ status: 204, headers: CORS });
      }
      if (method === 'GET') return json(route, 200, userDto(user));
    }

    // /roles
    const roleMatch = path.match(/^\/api\/v1\/roles(?:\/([^/]+))?(\/permissions)?$/);
    if (roleMatch) {
      const [, id, permissions] = roleMatch;
      if (!id && method === 'GET') return json(route, 200, mock.roles.map(roleDto));
      if (!id && method === 'POST') {
        if (mock.roles.some((r) => r.key === body.key)) return error(route, 409, `A role with key "${body.key}" already exists`);
        const created: MockRole = { id: uuid(4, ++counter), key: body.key, name: body.name, description: body.description ?? null, isSystem: false, isActive: true, permissionIds: [], createdAt: at(counter), updatedAt: at(counter) };
        mock.roles.push(created);
        return json(route, 201, roleDto(created));
      }
      const role = mock.roles.find((r) => r.id === id);
      if (!role) return error(route, 404, 'Role not found');
      if (method === 'PUT' && permissions) {
        if (role.key === 'admin' && body.permissionIds.length < ALL_PERMISSIONS.length) {
          return error(route, 409, "The admin role's permissions can't be reduced");
        }
        role.permissionIds = body.permissionIds;
        return json(route, 200, roleDto(role));
      }
      if (method === 'PATCH') {
        if (body.isActive === false && role.isActive && role.isSystem) return error(route, 409, "System roles can't be deactivated");
        Object.assign(role, body);
        return json(route, 200, roleDto(role));
      }
      if (method === 'DELETE') {
        if (role.isSystem) return error(route, 409, "System roles can't be deleted");
        if (roleDto(role).userCount > 0) return error(route, 409, "Reassign this role's users before deleting it");
        mock.roles = mock.roles.filter((r) => r.id !== id);
        return route.fulfill({ status: 204, headers: CORS });
      }
      if (method === 'GET') return json(route, 200, roleDto(role));
    }

    return error(route, 405, 'Method not allowed');
  });

  return mock;
}
