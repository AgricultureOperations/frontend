import { Product } from "./product.interface";

type Managed = "id" | "createdAt" | "updatedAt";
type OptionalText = "description" | "storageConditions";

// POST body (product-service CreateProductDto). Nullable fields accept null to leave them empty.
export type CreateProductRequest = Omit<Product, Managed | OptionalText> & Partial<Pick<Product, OptionalText>>;

// PATCH body: any subset. An absent field is unchanged; null clears a nullable field.
export type UpdateProductRequest = Partial<CreateProductRequest>;
