import { IProductRepository } from '~domain/product/repositories/product.repository.interface';

export interface DeleteProductUseCaseInput {
  productId: string;
}

export interface DeleteProductUseCaseOutput {
  id: string;
  deleted: boolean;
}

/**
 * Delete Product Use Case
 */
export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    input: DeleteProductUseCaseInput
  ): Promise<DeleteProductUseCaseOutput> {
    // Check if product exists
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new Error(`Product with ID ${input.productId} not found`);
    }

    // Delete from repository
    await this.productRepository.delete(input.productId);

    return {
      id: input.productId,
      deleted: true,
    };
  }
}
