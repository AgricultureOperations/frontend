import { Product, ProductStatus, ProductType } from "./product.interface";

// GET /api/v1/products query and response (product-service ListProductsQueryDto / PaginatedProductsResponseDto).
export interface ProductListQuery {
    page: number;
    limit: number;
    category?: string;
    productType?: ProductType;
    status?: ProductStatus;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ProductListResponse {
    data: Product[];
    meta: PaginationMeta;
}
