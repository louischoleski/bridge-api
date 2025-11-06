import { IProductRepository } from '~domain/product/repositories/product.repository.interface';
import { ProductCategory } from '~domain/product/value-objects/product-category.vo';
import { Money } from '~domain/shared/value-objects/money.vo';

export interface UpdateProductUseCaseInput {
  productId: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  stockQuantity?: number;
  isActive?: boolean;
  imageUrls?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateProductUseCaseOutput {
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
 * Update Product Use Case
 */
export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    input: UpdateProductUseCaseInput
  ): Promise<UpdateProductUseCaseOutput> {
    // Find existing product
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new Error(`Product with ID ${input.productId} not found`);
    }

    // Update name
    if (input.name !== undefined) {
      product.updateName(input.name);
    }

    // Update description
    if (input.description !== undefined) {
      product.updateDescription(input.description);
    }

    // Update price
    if (input.price !== undefined && input.currency !== undefined) {
      const newPrice = Money.create(input.price, input.currency);
      product.updatePrice(newPrice);
    } else if (input.price !== undefined) {
      const newPrice = Money.create(input.price, product.price.currency);
      product.updatePrice(newPrice);
    }

    // Update category
    if (input.category !== undefined) {
      product.updateCategory(ProductCategory.create(input.category));
    }

    // Update stock quantity (using increase/decrease methods)
    if (input.stockQuantity !== undefined) {
      const difference = input.stockQuantity - product.stockQuantity;
      if (difference > 0) {
        product.increaseStock(difference);
      } else if (difference < 0) {
        product.decreaseStock(Math.abs(difference));
      }
    }

    // Update active status
    if (input.isActive !== undefined) {
      if (input.isActive) {
        product.activate();
      } else {
        product.deactivate();
      }
    }

    // Update images (replace all)
    if (input.imageUrls !== undefined) {
      // Remove all existing images
      [...product.imageUrls].forEach((url) => product.removeImage(url));
      // Add new images
      input.imageUrls.forEach((url) => product.addImage(url));
    }

    // Update metadata
    if (input.metadata !== undefined) {
      Object.entries(input.metadata).forEach(([key, value]) => {
        product.setMetadata(key, value);
      });
    }

    // Save to repository
    await this.productRepository.save(product);

    // Return updated product data
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
