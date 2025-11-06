/**
 * Cart DTOs (Data Transfer Objects)
 */

export interface AddItemToCartDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  productId: string;
  quantity: number;
}

export interface CartItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  total: number;
}

export interface CartDTO {
  id: string;
  customerId: string;
  items: CartItemDTO[];
  status: string;
  currency: string;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  totalItemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutCartDTO {
  cartId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
