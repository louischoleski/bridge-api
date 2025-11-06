import { CartAggregate } from '~domain/cart/aggregates/cart.aggregate';
import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { IProductRepository } from '~domain/product/repositories/product.repository.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

export interface AddItemToCartInput {
  customerId: string;
  productId: string;
  quantity: number;
}

/**
 * Add Item to Cart Use Case
 */
export class AddItemToCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: AddItemToCartInput): Promise<void> {
    // Validate product exists and is available
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundException('Product', input.productId);
    }

    if (!product.isAvailable()) {
      throw new Error('Product is not available');
    }

    // Get or create cart
    let cart = await this.cartRepository.findActiveByCustomerId(
      input.customerId
    );

    if (!cart) {
      cart = CartAggregate.create(input.customerId, product.price.currency);
    }

    // Add item to cart
    cart.addItem(input.productId, product.name, input.quantity, product.price);

    // Persist cart
    await this.cartRepository.save(cart);
  }
}
