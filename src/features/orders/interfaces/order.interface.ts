import { OrderStatus } from "./orderStatus.interface";

/*import { OrderItem } from "./orderItem.interface";

export interface Order{
    id: string;
    date: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    currency: string;
    customer: {
        name: string;
        email: string;
    };
    items: OrderItem[];
    shippingAddress: string;
    paymentMethod: 'credit_card' | 'debit_card';
}*/
export interface Order{
    id: string;
    customerId: string;
    total:number;
    createdAt: string;
    statusId: number;
    status: OrderStatus;
}