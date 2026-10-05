import { describe, expect, test } from "vitest";
import { MatrixResource, PermissionMatrix } from "../../../src/features/roles/interfaces/permission.interface";
import {
    actionLabel,
    allPermissionIds,
    filterResources,
    findCell,
    getRowState,
    isDirty,
    setRows,
    sortResources,
    toggleCell,
    toggleRow,
} from "../../../src/features/roles/utils/permission-matrix";

const ACTIONS = ["view", "create", "edit", "delete"].map((key) => ({ id: `a-${key}`, key, name: key }));

const resource = (key: string, sortOrder: number, description: string | null = null): MatrixResource => ({
    id: `r-${key}`,
    key,
    name: key[0].toUpperCase() + key.slice(1),
    description,
    sortOrder,
    permissions: ACTIONS.map((a) => ({ id: `${key}:${a.key}`, code: `${key}:${a.key}`, actionId: a.id, actionKey: a.key })),
});

const products = resource("products", 10, "Product catalog");
const orders = resource("orders", 20);
const matrix: PermissionMatrix = { actions: ACTIONS, resources: [orders, products] };

describe("permission matrix selection", () => {
    test("lists every permission id and sorts resources by sortOrder", () => {
        expect(allPermissionIds(matrix)).toHaveLength(8);
        expect(sortResources(matrix.resources).map((r) => r.key)).toEqual(["products", "orders"]);
    });

    test("finds a cell by action and labels columns in Spanish", () => {
        expect(findCell(products, "a-edit")?.code).toBe("products:edit");
        expect(findCell(products, "a-missing")).toBeUndefined();
        expect(ACTIONS.map(actionLabel)).toEqual(["Ver", "Crear", "Editar", "Eliminar"]);
        expect(actionLabel({ key: "export", name: "Export" })).toBe("Export");
    });

    test("row state is none / some (indeterminate) / all", () => {
        expect(getRowState(products, new Set())).toBe("none");
        expect(getRowState(products, new Set(["products:view"]))).toBe("some");
        expect(getRowState(products, new Set(products.permissions.map((p) => p.id)))).toBe("all");
    });

    test("toggleCell adds and removes one permission without mutating the input", () => {
        const start = new Set(["products:view"]);
        const added = toggleCell(start, "products:edit");
        expect([...added].sort()).toEqual(["products:edit", "products:view"]);
        expect(toggleCell(added, "products:view")).toEqual(new Set(["products:edit"]));
        expect(start).toEqual(new Set(["products:view"]));
    });

    test("toggleRow selects a partial row fully, and clears a full row", () => {
        const partial = new Set(["products:view", "orders:view"]);
        const full = toggleRow(partial, products);
        expect(getRowState(products, full)).toBe("all");
        expect(full.has("orders:view")).toBe(true);
        const cleared = toggleRow(full, products);
        expect(getRowState(products, cleared)).toBe("none");
        expect(cleared).toEqual(new Set(["orders:view"]));
    });

    test("select all / clear all only touch the given (visible) rows", () => {
        const all = setRows(new Set(["orders:view"]), [products], true);
        expect(getRowState(products, all)).toBe("all");
        expect(getRowState(orders, all)).toBe("some");
        expect(setRows(all, [products], false)).toEqual(new Set(["orders:view"]));
    });

    test("dirty tracking compares against the saved ids, order-independent", () => {
        const saved = ["products:view", "orders:view"];
        expect(isDirty(new Set(["orders:view", "products:view"]), saved)).toBe(false);
        expect(isDirty(new Set(["orders:view"]), saved)).toBe(true);
        expect(isDirty(new Set(["orders:view", "products:edit"]), saved)).toBe(true);
    });

    test("search matches name, key, description or a permission code", () => {
        expect(filterResources(matrix.resources, "")).toHaveLength(2);
        expect(filterResources(matrix.resources, "catalog").map((r) => r.key)).toEqual(["products"]);
        expect(filterResources(matrix.resources, "ORDERS:DEL").map((r) => r.key)).toEqual(["orders"]);
        expect(filterResources(matrix.resources, "zzz")).toEqual([]);
    });
});
