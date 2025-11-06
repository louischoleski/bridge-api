import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

export interface RemoveItemFromCartInput {
  customerId: string;
  productId: string;
}

/**
 * Remove Item from Cart Use Case
 */
export class RemoveItemFromCartUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(input: RemoveItemFromCartInput): Promise<void> {
    // Get cart
    const cart = await this.cartRepository.findActiveByCustomerId(
      input.customerId
    );

    if (!cart) {
      throw new NotFoundException('Cart', input.customerId);
    }

    // Remove item
    cart.removeItem(input.productId);

    // Persist cart
    await this.cartRepository.save(cart);
  }
}
