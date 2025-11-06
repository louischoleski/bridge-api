import { ProductDTO } from '~application/dtos/product.dto';
import { ProductMapper } from '~application/mappers/product.mapper';
import { IProductRepository } from '~domain/product/repositories/product.repository.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

/**
 * Get Product Use Case
 */
export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(productId: string): Promise<ProductDTO> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product', productId);
    }

    return ProductMapper.toDTO(product);
  }
}
