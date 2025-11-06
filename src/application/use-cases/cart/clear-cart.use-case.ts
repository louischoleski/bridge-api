import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

/**
 * Clear Cart Use Case
 */
export class ClearCartUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(customerId: string): Promise<void> {
    // Get cart
    const cart = await this.cartRepository.findActiveByCustomerId(customerId);

    if (!cart) {
      throw new NotFoundException('Cart', customerId);
    }

    // Clear cart
    cart.clear();

    // Persist cart
    await this.cartRepository.save(cart);
  }
}
