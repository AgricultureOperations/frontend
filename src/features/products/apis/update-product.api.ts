import { productApi } from "../../../api/product.api";
import { Product } from "../interfaces/product.interface";
import { UpdateProductRequest } from "../interfaces/product.request";

export const updateProductApi = async (id: string, changes: UpdateProductRequest): Promise<Product> => {
    const response = await productApi.patch<Product>(`/api/v1/products/${id}`, changes);
    return response.data;
};
