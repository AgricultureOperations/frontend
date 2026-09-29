import { ProductStatus, ProductType, UnitOfMeasure } from "./product.interface";

// Form state: numeric inputs are kept as strings so an empty field stays empty.
export interface ProductFormValues {
    name: string;
    sku: string;
    category: string;
    productType: ProductType;
    status: ProductStatus;
    scientificName: string;
    activeIngredient: string;
    safetyPeriodDays: string;
    isHazardous: boolean;
    unitOfMeasure: UnitOfMeasure;
    presentationSize: string;
    presentationUnit: UnitOfMeasure | "";
    costPrice: string;
    sellingPrice: string;
    taxRate: string;
    minStockLevel: string;
    maxStockLevel: string;
    reorderPoint: string;
    requiresBatchTracking: boolean;
    requiresExpiration: boolean;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;
