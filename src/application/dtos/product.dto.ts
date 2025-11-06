/**
 * Product DTOs (Data Transfer Objects)
 */

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  category: {
    name: string;
    slug: string;
  };
  stockQuantity: number;
  isActive: boolean;
  imageUrls: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  categoryName: string;
  stockQuantity?: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
}

export interface SearchProductsDTO {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}
