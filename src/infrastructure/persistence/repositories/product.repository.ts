import { ProductEntity } from '~domain/product/entities/product.entity';
import { IProductRepository } from '~domain/product/repositories/product.repository.interface';
import { ProductCategory } from '~domain/product/value-objects/product-category.vo';
import { Money } from '~domain/shared/value-objects/money.vo';
import { ProductModel } from '~infrastructure/persistence/models/product.model';

/**
 * Product Repository Implementation
 * This is a mock implementation. In production, integrate with your database
 */
export class ProductRepository implements IProductRepository {
  private products: Map<string, ProductModel> = new Map();

  async save(product: ProductEntity): Promise<void> {
    const productModel = this.toModel(product);
    this.products.set(product.id, productModel);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const productModel = this.products.get(id);

    if (!productModel) {
      return null;
    }

    return this.toDomain(productModel);
  }

  async findBySku(sku: string): Promise<ProductEntity | null> {
    const productModel = Array.from(this.products.values()).find(
      (p) => p.sku === sku
    );

    if (!productModel) {
      return null;
    }

    return this.toDomain(productModel);
  }

  async findAll(
    limit: number = 50,
    offset: number = 0
  ): Promise<ProductEntity[]> {
    const productModels = Array.from(this.products.values()).slice(
      offset,
      offset + limit
    );

    return productModels.map((model) => this.toDomain(model));
  }

  async findByCategory(categorySlug: string): Promise<ProductEntity[]> {
    const productModels = Array.from(this.products.values()).filter(
      (p) => p.categorySlug === categorySlug
    );

    return productModels.map((model) => this.toDomain(model));
  }

  async search(query: string): Promise<ProductEntity[]> {
    const lowerQuery = query.toLowerCase();
    const productModels = Array.from(this.products.values()).filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery)
    );

    return productModels.map((model) => this.toDomain(model));
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }

  /**
   * Convert domain entity to database model
   */
  private toModel(product: ProductEntity): ProductModel {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku.value,
      price: product.price.amount,
      currency: product.price.currency,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      imageUrls: [...product.imageUrls],
      metadata: { ...product.metadata },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Convert database model to domain entity
   */
  private toDomain(model: ProductModel): ProductEntity {
    const product = ProductEntity.create(
      model.name,
      model.description,
      model.sku,
      Money.create(model.price, model.currency),
      ProductCategory.create(model.categoryName, model.categorySlug),
      model.stockQuantity,
      model.id
    );

    // Restore additional properties
    if (!model.isActive) {
      product.deactivate();
    }

    model.imageUrls.forEach((url) => product.addImage(url));

    Object.entries(model.metadata).forEach(([key, value]) => {
      product.setMetadata(key, value);
    });

    return product;
  }
}
