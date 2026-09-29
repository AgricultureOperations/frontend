// Mirror of product-service's ProductResponseDto (src/application/dtos/product-response.dto.ts).
// Update both in the same change set.
export type ProductType = "harvest" | "input" | "equipment";
export type ProductStatus = "active" | "inactive" | "discontinued";
// product-service UNITS_OF_MEASURE. "bag" is a saco, "t" a tonelada, "qq" a quintal.
export type UnitOfMeasure = "kg" | "g" | "lb" | "qq" | "t" | "l" | "ml" | "gal" | "unit" | "box" | "bag";

export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    productType: ProductType;
    scientificName: string | null;
    activeIngredient: string | null;
    safetyPeriodDays: number | null;
    isHazardous: boolean;
    unitOfMeasure: UnitOfMeasure;
    presentationSize: number | null;
    presentationUnit: UnitOfMeasure | null;
    costPrice: number;
    sellingPrice: number;
    taxRate: number;
    minStockLevel: number;
    maxStockLevel: number | null;
    reorderPoint: number;
    requiresBatchTracking: boolean;
    requiresExpiration: boolean;
    storageConditions: string | null;
    status: ProductStatus;
    createdAt: string;
    updatedAt: string;
}
