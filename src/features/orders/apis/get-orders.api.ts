import { orderApi } from "../../../api/order.api";
import { Order } from "../interfaces/order.interface";

export const getOrdersApi = async (): Promise<Order[]> => {
    const response = await orderApi.get<Order[]>('/api/v1/orders');
    return response.data;
};