/**
 * Cart Database Model (Example using a generic structure)
 * In production, this would use your chosen ORM (TypeORM, Prisma, Sequelize, etc.)
 */

export interface CartModel {
  id: string;
  customerId: string;
  status: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemModel[];
}

export interface CartItemModel {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
