import { OrderItem } from "./orderItem.interface";

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
}