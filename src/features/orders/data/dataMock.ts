import { Order } from "../interfaces/order.interface";

export const mockOrders: Order[] = [
  {
    id: 'ORD-1001',
    date: '2026-03-20',
    status: 'pending',
    total: 120.5,
    currency: 'USD',
    customer: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
    },
    items: [
      {
        productId: 'P-01',
        name: 'Nitrogen Fertilizer 50kg',
        quantity: 2,
        price: 40.25,
      },
      {
        productId: 'P-02',
        name: 'Organic Pesticide 1L',
        quantity: 1,
        price: 40,
      },
    ],
    shippingAddress: 'Quito, Ecuador',
    paymentMethod: 'credit_card',
  },
  {
    id: 'ORD-1002',
    date: '2026-03-18',
    status: 'paid',
    total: 85.0,
    currency: 'USD',
    customer: {
      name: 'María López',
      email: 'maria@example.com',
    },
    items: [
      {
        productId: 'P-03',
        name: 'Herbicide Pro 2L',
        quantity: 1,
        price: 85,
      },
    ],
    shippingAddress: 'Latacunga, Ecuador',
    paymentMethod: 'debit_card',
  },
  {
    id: 'ORD-1003',
    date: '2026-03-15',
    status: 'shipped',
    total: 200,
    currency: 'USD',
    customer: {
      name: 'Carlos Mena',
      email: 'carlos@example.com',
    },
    items: [
      {
        productId: 'P-01',
        name: 'Nitrogen Fertilizer 50kg',
        quantity: 4,
        price: 50,
      },
    ],
    shippingAddress: 'Ambato, Ecuador',
    paymentMethod: 'credit_card',
  },
  {
    id: 'ORD-1004',
    date: '2026-03-10',
    status: 'delivered',
    total: 60,
    currency: 'USD',
    customer: {
      name: 'Ana Torres',
      email: 'ana@example.com',
    },
    items: [
      {
        productId: 'P-04',
        name: 'Soil Conditioner 25kg',
        quantity: 2,
        price: 30,
      },
    ],
    shippingAddress: 'Riobamba, Ecuador',
    paymentMethod: 'debit_card',
  },
  {
    id: 'ORD-1005',
    date: '2026-03-08',
    status: 'cancelled',
    total: 150,
    currency: 'USD',
    customer: {
      name: 'Luis Herrera',
      email: 'luis@example.com',
    },
    items: [
      {
        productId: 'P-05',
        name: 'Insecticide Max 500ml',
        quantity: 3,
        price: 50,
      },
    ],
    shippingAddress: 'Ibarra, Ecuador',
    paymentMethod: 'credit_card',
  },
];