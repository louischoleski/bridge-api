import { ProductDTO } from '~application/dtos/product.dto';
import { ProductMapper } from '~application/mappers/product.mapper';
import { IProductRepository } from '~domain/product/repositories/product.repository.interface';

export interface SearchProductsInput {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * Search Products Use Case
 */
export class SearchProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: SearchProductsInput): Promise<ProductDTO[]> {
    let products;

    if (input.query) {
      products = await this.productRepository.search(input.query);
    } else if (input.category) {
      products = await this.productRepository.findByCategory(input.category);
    } else {
      products = await this.productRepository.findAll(
        input.limit,
        input.offset
      );
    }

    return ProductMapper.toDTOs(products);
  }
}
