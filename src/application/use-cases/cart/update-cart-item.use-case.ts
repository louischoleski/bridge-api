import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

export interface UpdateCartItemInput {
  customerId: string;
  productId: string;
  quantity: number;
}

/**
 * Update Cart Item Quantity Use Case
 */
export class UpdateCartItemUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(input: UpdateCartItemInput): Promise<void> {
    // Get cart
    const cart = await this.cartRepository.findActiveByCustomerId(
      input.customerId
    );

    if (!cart) {
      throw new NotFoundException('Cart', input.customerId);
    }

    // Update item quantity
    cart.updateItemQuantity(input.productId, input.quantity);

    // Persist cart
    await this.cartRepository.save(cart);
  }
}
