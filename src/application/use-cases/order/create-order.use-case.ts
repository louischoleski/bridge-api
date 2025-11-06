import { OrderDTO } from '~application/dtos/order.dto';
import { OrderMapper } from '~application/mappers/order.mapper';
import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { OrderAggregate } from '~domain/order/aggregates/order.aggregate';
import { OrderLineEntity } from '~domain/order/entities/order-line.entity';
import { IOrderRepository } from '~domain/order/repositories/order.repository.interface';
import { ShippingAddress } from '~domain/order/value-objects/shipping-address.vo';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

export interface CreateOrderInput {
  customerId: string;
  cartId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * Create Order Use Case
 */
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(input: CreateOrderInput): Promise<OrderDTO> {
    // Get cart
    const cart = await this.cartRepository.findById(input.cartId);

    if (!cart) {
      throw new NotFoundException('Cart', input.cartId);
    }

    if (cart.customerId !== input.customerId) {
      throw new Error('Cart does not belong to customer');
    }

    // Create order lines from cart items
    const orderLines = cart.items.map((item) =>
      OrderLineEntity.create(
        item.productId,
        item.productName,
        item.quantity.value,
        item.unitPrice,
        item.discount
      )
    );

    // Create shipping address
    const shippingAddress = ShippingAddress.create(
      input.shippingAddress.street,
      input.shippingAddress.city,
      input.shippingAddress.state,
      input.shippingAddress.zipCode,
      input.shippingAddress.country
    );

    // Create order
    const order = OrderAggregate.create(
      input.customerId,
      orderLines,
      shippingAddress,
      cart.currency
    );

    // Checkout cart
    cart.checkout();

    // Persist order and cart
    await this.orderRepository.save(order);
    await this.cartRepository.save(cart);

    return OrderMapper.toDTO(order);
  }
}
