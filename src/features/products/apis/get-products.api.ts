import { productApi } from "../../../api/product.api";
import { ProductListQuery, ProductListResponse } from "../interfaces/product-list.interface";

// A missing VITE_PRODUCTSERVICE_BASE_URL makes this a relative request, which the SPA host (nginx/Netlify)
// answers with index.html and a 200. Reject anything that isn't the list shape so the page shows its error state.
const isProductListResponse = (body: unknown): body is ProductListResponse => {
    const candidate = body as Partial<ProductListResponse> | null;
    return Array.isArray(candidate?.data) && typeof candidate?.meta?.total === "number";
};

export const getProductsApi = async (query: ProductListQuery): Promise<ProductListResponse> => {
    const response = await productApi.get<ProductListResponse>("/api/v1/products", { params: query });
    if (!isProductListResponse(response.data)) {
        throw new Error("Respuesta inesperada del servicio de productos. Revisa VITE_PRODUCTSERVICE_BASE_URL.");
    }
    return response.data;
};
