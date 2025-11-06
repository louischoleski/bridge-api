import { OrderDTO } from '~application/dtos/order.dto';
import { OrderMapper } from '~application/mappers/order.mapper';
import { IOrderRepository } from '~domain/order/repositories/order.repository.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

/**
 * Get Order Use Case
 */
export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<OrderDTO> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order', orderId);
    }

    return OrderMapper.toDTO(order);
  }
}
