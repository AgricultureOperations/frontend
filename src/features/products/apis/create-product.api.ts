import { productApi } from "../../../api/product.api";
import { Product } from "../interfaces/product.interface";
import { CreateProductRequest } from "../interfaces/product.request";

export const createProductApi = async (body: CreateProductRequest): Promise<Product> => {
    const response = await productApi.post<Product>("/api/v1/products", body);
    return response.data;
};
