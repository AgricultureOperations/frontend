import { describe, expect, test } from "vitest";
import { ValidationError } from "yup";
import { productSchema } from "../../../src/features/products/validations/product.validation";
import { EMPTY_PRODUCT_FORM, formValuesToRequest, productToFormValues } from "../../../src/features/products/utils/product-form.mapper";
import { ProductFormValues } from "../../../src/features/products/interfaces/product-form.interface";
import { Product } from "../../../src/features/products/interfaces/product.interface";

const valid: ProductFormValues = {
    ...EMPTY_PRODUCT_FORM,
    name: "Urea 46% N",
    sku: "fert-urea-50kg",
    category: "Fertilizante",
    costPrice: "28.5",
    sellingPrice: "34.9",
    taxRate: "15",
    minStockLevel: "10",
    maxStockLevel: "200",
    reorderPoint: "25",
    presentationSize: "50",
    presentationUnit: "kg",
};

const errorsOf = async (values: ProductFormValues): Promise<Record<string, string>> => {
    try {
        await productSchema.validate(values, { abortEarly: false });
        return {};
    } catch (error) {
        const errors: Record<string, string> = {};
        (error as ValidationError).inner.forEach((e) => {
            if (e.path && !errors[e.path]) errors[e.path] = e.message;
        });
        return errors;
    }
};

describe("productSchema", () => {
    test("accepts a valid product", async () => {
        expect(await errorsOf(valid)).toEqual({});
    });

    test("requires name, sku, category and prices", async () => {
        const errors = await errorsOf(EMPTY_PRODUCT_FORM);
        expect(Object.keys(errors)).toEqual(expect.arrayContaining(["name", "sku", "category", "costPrice", "sellingPrice"]));
    });

    test("accepts prices like 12.40 despite float rounding", async () => {
        expect(await errorsOf({ ...valid, costPrice: "12.40", sellingPrice: "16.90", taxRate: "12.5" })).toEqual({});
    });

    test.each([
        ["a price with 3 decimals", { sellingPrice: "10.555" }, "sellingPrice"],
        ["a negative cost", { costPrice: "-1" }, "costPrice"],
        ["a tax rate above 100", { taxRate: "101" }, "taxRate"],
        ["a SKU with spaces", { sku: "bad sku" }, "sku"],
        ["max stock below min stock", { minStockLevel: "50", maxStockLevel: "10" }, "maxStockLevel"],
        ["reorder point below min stock", { reorderPoint: "5" }, "reorderPoint"],
        ["reorder point above max stock", { reorderPoint: "300" }, "reorderPoint"],
        ["a fractional safety period", { safetyPeriodDays: "1.5" }, "safetyPeriodDays"],
        ["a presentation size without unit", { presentationUnit: "" as const }, "presentationUnit"],
        ["a presentation unit without size", { presentationSize: "" }, "presentationSize"],
    ])("rejects %s", async (_label, overrides, field) => {
        expect(await errorsOf({ ...valid, ...overrides })).toHaveProperty(field);
    });
});

describe("product form mapper", () => {
    test("converts strings to numbers and blanks to null", () => {
        const body = formValuesToRequest({ ...valid, scientificName: "  ", maxStockLevel: "", safetyPeriodDays: "7" });
        expect(body).toMatchObject({
            sku: "fert-urea-50kg",
            costPrice: 28.5,
            taxRate: 15,
            scientificName: null,
            maxStockLevel: null,
            safetyPeriodDays: 7,
            presentationSize: 50,
            presentationUnit: "kg",
        });
        expect(body).not.toHaveProperty("description");
    });

    test("round-trips a product through the form", () => {
        const product: Product = {
            id: "1", sku: "HARV-COCOA", name: "Cacao", description: null, category: "cacao", productType: "harvest",
            scientificName: "Theobroma cacao", activeIngredient: null, safetyPeriodDays: null, isHazardous: false,
            unitOfMeasure: "qq", presentationSize: null, presentationUnit: null, costPrice: 90, sellingPrice: 120,
            taxRate: 0, minStockLevel: 0, maxStockLevel: null, reorderPoint: 0, requiresBatchTracking: false,
            requiresExpiration: true, storageConditions: "Seco", status: "inactive",
            createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
        };
        const expected: Partial<Product> = { ...product };
        for (const key of ["id", "createdAt", "updatedAt", "description", "storageConditions"] as const) delete expected[key];
        expect(formValuesToRequest(productToFormValues(product))).toEqual(expected);
    });
});
