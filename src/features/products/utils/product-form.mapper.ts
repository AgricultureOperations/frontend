import { Product } from "../interfaces/product.interface";
import { ProductFormValues } from "../interfaces/product-form.interface";
import { CreateProductRequest } from "../interfaces/product.request";

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
    name: "",
    sku: "",
    category: "",
    productType: "input",
    status: "active",
    scientificName: "",
    activeIngredient: "",
    safetyPeriodDays: "",
    isHazardous: false,
    unitOfMeasure: "kg",
    presentationSize: "",
    presentationUnit: "",
    costPrice: "",
    sellingPrice: "",
    taxRate: "0",
    minStockLevel: "0",
    maxStockLevel: "",
    reorderPoint: "0",
    requiresBatchTracking: false,
    requiresExpiration: false,
};

const toText = (value: number | null): string => (value === null ? "" : String(value));

export const productToFormValues = (product: Product): ProductFormValues => ({
    name: product.name,
    sku: product.sku,
    category: product.category,
    productType: product.productType,
    status: product.status,
    scientificName: product.scientificName ?? "",
    activeIngredient: product.activeIngredient ?? "",
    safetyPeriodDays: toText(product.safetyPeriodDays),
    isHazardous: product.isHazardous,
    unitOfMeasure: product.unitOfMeasure,
    presentationSize: toText(product.presentationSize),
    presentationUnit: product.presentationUnit ?? "",
    costPrice: String(product.costPrice),
    sellingPrice: String(product.sellingPrice),
    taxRate: String(product.taxRate),
    minStockLevel: String(product.minStockLevel),
    maxStockLevel: toText(product.maxStockLevel),
    reorderPoint: String(product.reorderPoint),
    requiresBatchTracking: product.requiresBatchTracking,
    requiresExpiration: product.requiresExpiration,
});

const textOrNull = (value: string): string | null => (value.trim() === "" ? null : value.trim());
const numberOrNull = (value: string): number | null => (value.trim() === "" ? null : Number(value));

/**
 * Builds the request body. Fields the modal doesn't show (description, storageConditions) are left
 * out, so a PATCH keeps their stored values.
 */
export const formValuesToRequest = (
    values: ProductFormValues,
): CreateProductRequest => ({
    name: values.name.trim(),
    sku: values.sku.trim(),
    category: values.category.trim(),
    productType: values.productType,
    status: values.status,
    scientificName: textOrNull(values.scientificName),
    activeIngredient: textOrNull(values.activeIngredient),
    safetyPeriodDays: numberOrNull(values.safetyPeriodDays),
    isHazardous: values.isHazardous,
    unitOfMeasure: values.unitOfMeasure,
    presentationSize: numberOrNull(values.presentationSize),
    presentationUnit: values.presentationUnit === "" ? null : values.presentationUnit,
    costPrice: Number(values.costPrice),
    sellingPrice: Number(values.sellingPrice),
    taxRate: Number(values.taxRate),
    minStockLevel: Number(values.minStockLevel),
    maxStockLevel: numberOrNull(values.maxStockLevel),
    reorderPoint: Number(values.reorderPoint),
    requiresBatchTracking: values.requiresBatchTracking,
    requiresExpiration: values.requiresExpiration,
});
