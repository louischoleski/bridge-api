import { ProductEntity } from '~domain/product/entities/product.entity';
import { IProductRepository } from '~domain/product/repositories/product.repository.interface';
import { ProductCategory } from '~domain/product/value-objects/product-category.vo';
import { Money } from '~domain/shared/value-objects/money.vo';

export interface CreateProductUseCaseInput {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  category: string;
  stockQuantity?: number;
  imageUrls?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateProductUseCaseOutput {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  category: string;
  stockQuantity: number;
  isActive: boolean;
  imageUrls: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Product Use Case
 */
export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    input: CreateProductUseCaseInput
  ): Promise<CreateProductUseCaseOutput> {
    // Check if SKU already exists
    const existingProduct = await this.productRepository.findBySku(input.sku);
    if (existingProduct) {
      throw new Error(`Product with SKU ${input.sku} already exists`);
    }

    // Create product entity
    const product = ProductEntity.create(
      input.name,
      input.description,
      input.sku,
      Money.create(input.price, input.currency),
      ProductCategory.create(input.category),
      input.stockQuantity || 0
    );

    // Add images if provided
    if (input.imageUrls && input.imageUrls.length > 0) {
      input.imageUrls.forEach((imageUrl) => product.addImage(imageUrl));
    }

    // Set metadata if provided
    if (input.metadata) {
      Object.entries(input.metadata).forEach(([key, value]) => {
        product.setMetadata(key, value);
      });
    }

    // Save to repository
    await this.productRepository.save(product);

    // Return product data
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku.value,
      price: product.price.amount,
      currency: product.price.currency,
      category: product.category.name,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      imageUrls: [...product.imageUrls],
      metadata: { ...product.metadata },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
