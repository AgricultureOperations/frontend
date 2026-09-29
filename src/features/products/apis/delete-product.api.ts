import { productApi } from "../../../api/product.api";

export const deleteProductApi = async (id: string): Promise<void> => {
    await productApi.delete(`/api/v1/products/${id}`);
};
