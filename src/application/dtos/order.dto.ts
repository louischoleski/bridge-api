/**
 * Order DTOs (Data Transfer Objects)
 */

export interface OrderLineDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  total: number;
}

export interface OrderDTO {
  id: string;
  customerId: string;
  orderLines: OrderLineDTO[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: string;
  currency: string;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  totalItemCount: number;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  customerId: string;
  cartId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface CancelOrderDTO {
  orderId: string;
  reason: string;
}

export interface ShipOrderDTO {
  orderId: string;
  trackingNumber?: string;
}
