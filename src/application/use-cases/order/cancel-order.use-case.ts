import { IOrderRepository } from '~domain/order/repositories/order.repository.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

export interface CancelOrderInput {
  orderId: string;
  reason: string;
}

/**
 * Cancel Order Use Case
 */
export class CancelOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: CancelOrderInput): Promise<void> {
    const order = await this.orderRepository.findById(input.orderId);

    if (!order) {
      throw new NotFoundException('Order', input.orderId);
    }

    // Cancel order
    order.cancel(input.reason);

    // Persist order
    await this.orderRepository.save(order);
  }
}
