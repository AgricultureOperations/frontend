import { describe, expect, test } from "vitest";
import {
    createProductThunk,
    deleteProductThunk,
    fetchProductsThunk,
    initialProductState,
    productReducer,
    updateProductThunk,
} from "../../../src/features/products/states/product.slice";
import { Product } from "../../../src/features/products/interfaces/product.interface";

const product = (id: string, name = id) => ({ id, name, sku: id.toUpperCase() }) as Product;
const meta = { page: 1, limit: 10, total: 2, totalPages: 1 };

describe("productReducer", () => {
    test("stores the fetched page and clears loading", () => {
        let state = productReducer(initialProductState, { type: fetchProductsThunk.pending.type });
        expect(state.loading).toBe(true);
        state = productReducer(state, {
            type: fetchProductsThunk.fulfilled.type,
            payload: { data: [product("a"), product("b")], meta },
        });
        expect(state).toMatchObject({ loading: false, error: null, meta });
        expect(state.products.map((p) => p.id)).toEqual(["a", "b"]);
    });

    test("keeps the rejection message", () => {
        const state = productReducer(initialProductState, {
            type: fetchProductsThunk.rejected.type,
            payload: "product-service unavailable",
        });
        expect(state).toMatchObject({ loading: false, error: "product-service unavailable" });
    });

    test("tracks saving for create, update and delete", () => {
        for (const thunk of [createProductThunk, updateProductThunk, deleteProductThunk]) {
            const pending = productReducer(initialProductState, { type: thunk.pending.type });
            expect(pending.saving).toBe(true);
            expect(productReducer(pending, { type: thunk.rejected.type, payload: "x" }).saving).toBe(false);
        }
    });

    test("replaces an updated product and removes a deleted one", () => {
        const loaded = { ...initialProductState, products: [product("a"), product("b")] };
        const updated = productReducer(loaded, { type: updateProductThunk.fulfilled.type, payload: product("b", "renamed") });
        expect(updated.products[1].name).toBe("renamed");
        const deleted = productReducer(updated, { type: deleteProductThunk.fulfilled.type, payload: "a" });
        expect(deleted.products.map((p) => p.id)).toEqual(["b"]);
    });
});
