import type { Page, Route } from '@playwright/test';

// In-browser stand-in for product-service's /api/v1/products (see product-service README → API).
// Keeps state per test, so a create → edit → delete flow behaves like the real backend,
// including newest-first ordering, pagination, 404s and the 409 on a duplicate SKU.

export interface MockProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  productType: 'harvest' | 'input' | 'equipment';
  scientificName: string | null;
  activeIngredient: string | null;
  safetyPeriodDays: number | null;
  isHazardous: boolean;
  unitOfMeasure: string;
  presentationSize: number | null;
  presentationUnit: string | null;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  minStockLevel: number;
  maxStockLevel: number | null;
  reorderPoint: number;
  requiresBatchTracking: boolean;
  requiresExpiration: boolean;
  storageConditions: string | null;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

// Fixed clock so screenshots and ordering are deterministic.
const BASE_TIME = Date.parse('2026-09-01T12:00:00.000Z');
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

type Seed = Partial<MockProduct> & Pick<MockProduct, 'sku' | 'name' | 'category' | 'productType' | 'unitOfMeasure' | 'costPrice' | 'sellingPrice'>;

const build = (seed: Seed, n: number): MockProduct => {
  const at = new Date(BASE_TIME + n * 60_000).toISOString();
  return {
    id: uuid(n),
    description: null,
    scientificName: null,
    activeIngredient: null,
    safetyPeriodDays: null,
    isHazardous: false,
    presentationSize: null,
    presentationUnit: null,
    taxRate: 0,
    minStockLevel: 0,
    maxStockLevel: null,
    reorderPoint: 0,
    requiresBatchTracking: false,
    requiresExpiration: false,
    storageConditions: null,
    status: 'active',
    createdAt: at,
    updatedAt: at,
    ...seed,
    sku: seed.sku.toUpperCase(),
    category: seed.category.toLowerCase(),
  };
};

// Oldest first; the list shows them newest first.
export const SEED_PRODUCTS: Seed[] = [
  { sku: 'FERT-UREA-50KG', name: 'Urea 46% N', category: 'fertilizante', productType: 'input', unitOfMeasure: 'bag', presentationSize: 50, presentationUnit: 'kg', costPrice: 28.5, sellingPrice: 34.9, taxRate: 15, minStockLevel: 10, maxStockLevel: 200, reorderPoint: 25, requiresBatchTracking: true },
  { sku: 'FERT-NPK-151515', name: 'NPK 15-15-15', category: 'fertilizante', productType: 'input', unitOfMeasure: 'bag', presentationSize: 50, presentationUnit: 'kg', costPrice: 31, sellingPrice: 38.5, taxRate: 15, minStockLevel: 8, maxStockLevel: 150, reorderPoint: 20 },
  { sku: 'PEST-GLIF-1L', name: 'Glifosato 480 SL', category: 'pesticida', productType: 'input', activeIngredient: 'Glifosato', safetyPeriodDays: 7, isHazardous: true, unitOfMeasure: 'l', costPrice: 6.2, sellingPrice: 8.9, taxRate: 15, minStockLevel: 20, reorderPoint: 40, requiresBatchTracking: true, requiresExpiration: true },
  { sku: 'PEST-MANC-1KG', name: 'Mancozeb 80 WP', category: 'pesticida', productType: 'input', activeIngredient: 'Mancozeb', safetyPeriodDays: 14, isHazardous: true, unitOfMeasure: 'kg', costPrice: 7.4, sellingPrice: 10.25, taxRate: 15, minStockLevel: 15, reorderPoint: 30, status: 'inactive' },
  { sku: 'SEED-MAIZ-INIAP', name: 'Semilla de maíz INIAP-176', category: 'semilla', productType: 'input', scientificName: 'Zea mays', unitOfMeasure: 'kg', costPrice: 3.1, sellingPrice: 4.5, minStockLevel: 100, reorderPoint: 250 },
  { sku: 'HARV-COCOA-CCN51', name: 'Cacao CCN-51 seco', category: 'cacao', productType: 'harvest', scientificName: 'Theobroma cacao', unitOfMeasure: 'qq', costPrice: 90, sellingPrice: 120, minStockLevel: 0 },
  { sku: 'HARV-COCOA-NAC', name: 'Cacao Nacional fino de aroma', category: 'cacao', productType: 'harvest', scientificName: 'Theobroma cacao', unitOfMeasure: 'qq', costPrice: 110, sellingPrice: 155, minStockLevel: 0 },
  { sku: 'HARV-BAN-22XU', name: 'Banano Cavendish caja 22XU', category: 'banano', productType: 'harvest', scientificName: 'Musa acuminata', unitOfMeasure: 'box', presentationSize: 18.14, presentationUnit: 'kg', costPrice: 5.2, sellingPrice: 7.5, minStockLevel: 0 },
  { sku: 'HARV-ARROZ-SACA', name: 'Arroz en cáscara', category: 'granos', productType: 'harvest', scientificName: 'Oryza sativa', unitOfMeasure: 't', costPrice: 380, sellingPrice: 430, minStockLevel: 0, status: 'discontinued' },
  { sku: 'EQ-BOMBA-20L', name: 'Bomba de mochila 20 L', category: 'herramientas', productType: 'equipment', unitOfMeasure: 'unit', costPrice: 45, sellingPrice: 64.99, taxRate: 15, minStockLevel: 2, maxStockLevel: 20, reorderPoint: 4 },
  { sku: 'EQ-MACHETE-22', name: 'Machete 22"', category: 'herramientas', productType: 'equipment', unitOfMeasure: 'unit', costPrice: 6.5, sellingPrice: 9.75, taxRate: 15, minStockLevel: 10, reorderPoint: 15 },
  { sku: 'EQ-GUADANA-43CC', name: 'Guadaña 43cc', category: 'maquinaria', productType: 'equipment', unitOfMeasure: 'unit', costPrice: 210, sellingPrice: 289, taxRate: 15, minStockLevel: 1, maxStockLevel: 5, reorderPoint: 2 },
];

export interface ProductServiceMock {
  products: MockProduct[];
  requests: { method: string; path: string; body: unknown }[];
  // Makes every list request fail with this status (e.g. 500) until called with null.
  // (React StrictMode fetches twice in dev, so a one-shot failure would be masked.)
  failLists: (status: number | null) => void;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

// A glob like '**/api/v1/products**' does not cross '/', so it misses /api/v1/products/<id>.
export const isProductServiceUrl = (url: URL) => /^\/api\/v1\/products(\/|$)/.test(url.pathname);

export async function mockProductService(page: Page, seed: Seed[] = SEED_PRODUCTS): Promise<ProductServiceMock> {
  let counter = 0;
  let failListWith: number | null = null;
  const mock: ProductServiceMock = {
    products: seed.map((s) => build(s, ++counter)),
    requests: [],
    failLists: (status) => {
      failListWith = status;
    },
  };

  const json = (route: Route, status: number, body?: unknown) =>
    route.fulfill({
      status,
      headers: CORS,
      contentType: 'application/json',
      body: body === undefined ? '' : JSON.stringify(body),
    });

  await page.route(isProductServiceUrl, async (route) => {
    const request = route.request();
    const method = request.method();
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });

    const url = new URL(request.url());
    const id = url.pathname.match(/\/api\/v1\/products\/([^/]+)$/)?.[1];
    const body = request.postData() ? request.postDataJSON() : undefined;
    mock.requests.push({ method, path: url.pathname + url.search, body });

    const find = () => mock.products.find((p) => p.id === id);
    const skuTaken = (sku: string, exceptId?: string) =>
      mock.products.some((p) => p.sku === sku.toUpperCase() && p.id !== exceptId);

    if (method === 'GET' && !id) {
      if (failListWith !== null) {
        return json(route, failListWith, { statusCode: failListWith, message: 'product-service unavailable' });
      }
      const pageNo = Number(url.searchParams.get('page') ?? 1);
      const limit = Number(url.searchParams.get('limit') ?? 20);
      const sorted = [...mock.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return json(route, 200, {
        data: sorted.slice((pageNo - 1) * limit, pageNo * limit),
        meta: { page: pageNo, limit, total: sorted.length, totalPages: Math.ceil(sorted.length / limit) },
      });
    }
    if (method === 'GET') {
      const product = find();
      return product ? json(route, 200, product) : json(route, 404, { statusCode: 404, message: `Product ${id} not found` });
    }
    if (method === 'POST') {
      if (skuTaken(body.sku)) {
        return json(route, 409, { statusCode: 409, message: `A product with SKU ${body.sku.toUpperCase()} already exists` });
      }
      const created = build(body, ++counter);
      mock.products.push(created);
      return json(route, 201, created);
    }
    if (method === 'PATCH') {
      const product = find();
      if (!product) return json(route, 404, { statusCode: 404, message: `Product ${id} not found` });
      if (body.sku && skuTaken(body.sku, product.id)) {
        return json(route, 409, { statusCode: 409, message: `A product with SKU ${body.sku.toUpperCase()} already exists` });
      }
      Object.assign(product, body, {
        sku: (body.sku ?? product.sku).toUpperCase(),
        category: (body.category ?? product.category).toLowerCase(),
        updatedAt: new Date(BASE_TIME + ++counter * 60_000).toISOString(),
      });
      return json(route, 200, product);
    }
    if (method === 'DELETE') {
      const before = mock.products.length;
      mock.products = mock.products.filter((p) => p.id !== id);
      return mock.products.length < before
        ? route.fulfill({ status: 204, headers: CORS })
        : json(route, 404, { statusCode: 404, message: `Product ${id} not found` });
    }
    return json(route, 405, { statusCode: 405, message: 'Method not allowed' });
  });

  return mock;
}
