import { ProductDTO } from '~application/dtos/product.dto';
import { ProductEntity } from '~domain/product/entities/product.entity';

/**
 * Product Mapper
 * Maps between domain objects and DTOs
 */
export class ProductMapper {
  /**
   * Map Product Entity to DTO
   */
  public static toDTO(product: ProductEntity): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku.value,
      price: product.price.amount,
      currency: product.price.currency,
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      imageUrls: [...product.imageUrls],
      metadata: { ...product.metadata },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Map multiple Product Entities to DTOs
   */
  public static toDTOs(products: ProductEntity[]): ProductDTO[] {
    return products.map((product) => this.toDTO(product));
  }
}
