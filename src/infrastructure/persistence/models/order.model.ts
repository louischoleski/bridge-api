/**
 * Order Database Model (Example using a generic structure)
 * In production, this would use your chosen ORM
 */

export interface OrderModel {
  id: string;
  customerId: string;
  status: string;
  currency: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  orderLines: OrderLineModel[];
}

export interface OrderLineModel {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
