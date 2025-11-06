/**
 * Product Database Model (Example using a generic structure)
 * In production, this would use your chosen ORM
 */

export interface ProductModel {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  categoryName: string;
  categorySlug: string;
  stockQuantity: number;
  isActive: boolean;
  imageUrls: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
