import { afterEach, describe, expect, test, vi } from "vitest";
import { productApi } from "../../../src/api/product.api";
import { getProductsApi } from "../../../src/features/products/apis/get-products.api";

const query = { page: 1, limit: 10 };

describe("getProductsApi", () => {
    afterEach(() => vi.restoreAllMocks());

    test("returns the paginated list", async () => {
        const body = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
        vi.spyOn(productApi, "get").mockResolvedValue({ data: body });
        await expect(getProductsApi(query)).resolves.toEqual(body);
    });

    // Without VITE_PRODUCTSERVICE_BASE_URL the request hits the SPA host, which returns index.html with a 200.
    test.each([
        ["an HTML page", "<!doctype html><html></html>"],
        ["an empty body", ""],
        ["a body without data", { items: [], meta: { total: 0 } }],
    ])("rejects %s instead of passing undefined to the page", async (_, data) => {
        vi.spyOn(productApi, "get").mockResolvedValue({ data });
        await expect(getProductsApi(query)).rejects.toThrow("VITE_PRODUCTSERVICE_BASE_URL");
    });
});
