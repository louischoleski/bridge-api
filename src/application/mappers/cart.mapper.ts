import { CartDTO, CartItemDTO } from '~application/dtos/cart.dto';
import { CartAggregate } from '~domain/cart/aggregates/cart.aggregate';
import { CartItemEntity } from '~domain/cart/entities/cart-item.entity';

/**
 * Cart Mapper
 * Maps between domain objects and DTOs
 */
export class CartMapper {
  /**
   * Map Cart Aggregate to DTO
   */
  public static toDTO(cart: CartAggregate): CartDTO {
    return {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.items.map((item) => this.cartItemToDTO(item)),
      status: cart.status,
      currency: cart.currency,
      subtotal: cart.getSubtotal().amount,
      totalDiscount: cart.getTotalDiscount().amount,
      totalAmount: cart.getTotalAmount().amount,
      totalItemCount: cart.getTotalItemCount(),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Map Cart Item Entity to DTO
   */
  private static cartItemToDTO(item: CartItemEntity): CartItemDTO {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity.value,
      unitPrice: item.unitPrice.amount,
      discount: item.discount.amount,
      subtotal: item.getSubtotal().amount,
      total: item.getTotal().amount,
    };
  }
}
