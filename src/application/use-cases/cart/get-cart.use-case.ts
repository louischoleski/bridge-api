import { CartDTO } from '~application/dtos/cart.dto';
import { CartMapper } from '~application/mappers/cart.mapper';
import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';

/**
 * Get Cart Use Case
 */
export class GetCartUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(customerId: string): Promise<CartDTO | null> {
    const cart = await this.cartRepository.findActiveByCustomerId(customerId);

    if (!cart) {
      return null;
    }

    return CartMapper.toDTO(cart);
  }
}
