import { OrderDTO, OrderLineDTO } from '~application/dtos/order.dto';
import { OrderAggregate } from '~domain/order/aggregates/order.aggregate';
import { OrderLineEntity } from '~domain/order/entities/order-line.entity';

/**
 * Order Mapper
 * Maps between domain objects and DTOs
 */
export class OrderMapper {
  /**
   * Map Order Aggregate to DTO
   */
  public static toDTO(order: OrderAggregate): OrderDTO {
    return {
      id: order.id,
      customerId: order.customerId,
      orderLines: order.orderLines.map((line) => this.orderLineToDTO(line)),
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country,
      },
      status: order.status.value,
      currency: order.currency,
      subtotal: order.getSubtotal().amount,
      totalDiscount: order.getTotalDiscount().amount,
      totalAmount: order.getTotalAmount().amount,
      totalItemCount: order.getTotalItemCount(),
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Map Order Line Entity to DTO
   */
  private static orderLineToDTO(line: OrderLineEntity): OrderLineDTO {
    return {
      id: line.id,
      productId: line.productId,
      productName: line.productName,
      quantity: line.quantity.value,
      unitPrice: line.unitPrice.amount,
      discount: line.discount.amount,
      subtotal: line.getSubtotal().amount,
      total: line.getTotal().amount,
    };
  }
}
