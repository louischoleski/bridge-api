import { ProductEntity } from '~domain/product/entities/product.entity';

/**
 * Product Repository Interface
 * Defines operations for persisting and retrieving products
 */
export interface IProductRepository {
  /**
   * Save a product
   */
  save(product: ProductEntity): Promise<void>;

  /**
   * Find product by ID
   */
  findById(id: string): Promise<ProductEntity | null>;

  /**
   * Find product by SKU
   */
  findBySku(sku: string): Promise<ProductEntity | null>;

  /**
   * Find all products
   */
  findAll(limit?: number, offset?: number): Promise<ProductEntity[]>;

  /**
   * Find products by category
   */
  findByCategory(categorySlug: string): Promise<ProductEntity[]>;

  /**
   * Search products by name
   */
  search(query: string): Promise<ProductEntity[]>;

  /**
   * Delete a product
   */
  delete(id: string): Promise<void>;
}
