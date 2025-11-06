import { BaseEntity } from '~domain/shared/entities/base.entity';
import { Money } from '~domain/shared/value-objects/money.vo';
import { Quantity } from '../../cart/value-objects/quantity.vo';
import { ValidationException } from '~domain/shared/exceptions/domain.exception';

interface OrderLineProps {
  productId: string;
  productName: string;
  quantity: Quantity;
  unitPrice: Money;
  discount: Money;
}

/**
 * Order Line Entity
 * Represents a line item in an order
 */
export class OrderLineEntity extends BaseEntity<OrderLineProps> {
  private constructor(props: OrderLineProps, id?: string) {
    super(props, id);
  }

  public static create(
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: Money,
    discount?: Money,
    id?: string
  ): OrderLineEntity {
    if (!productId) {
      throw new ValidationException('Product ID is required');
    }

    if (!productName) {
      throw new ValidationException('Product name is required');
    }

    return new OrderLineEntity(
      {
        productId,
        productName,
        quantity: Quantity.create(quantity),
        unitPrice,
        discount: discount || Money.create(0, unitPrice.currency),
      },
      id
    );
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get discount(): Money {
    return this.props.discount;
  }

  /**
   * Get subtotal (quantity * unit price)
   */
  public getSubtotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity.value);
  }

  /**
   * Get total (subtotal - discount)
   */
  public getTotal(): Money {
    return this.getSubtotal().subtract(this.props.discount);
  }
}
