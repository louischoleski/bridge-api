import { Quantity } from '~domain/cart/value-objects/quantity.vo';
import { BaseEntity } from '~domain/shared/entities/base.entity';
import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { Money } from '~domain/shared/value-objects/money.vo';

interface CartItemProps {
  productId: string;
  productName: string;
  quantity: Quantity;
  unitPrice: Money;
  discount?: Money;
}

/**
 * Cart Item Entity
 */
export class CartItemEntity extends BaseEntity<CartItemProps> {
  private constructor(props: CartItemProps, id?: string) {
    super(props, id);
  }

  public static create(
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: Money,
    id?: string
  ): CartItemEntity {
    if (!productId) {
      throw new ValidationException('Product ID is required');
    }

    if (!productName) {
      throw new ValidationException('Product name is required');
    }

    return new CartItemEntity(
      {
        productId,
        productName,
        quantity: Quantity.create(quantity),
        unitPrice,
        discount: Money.create(0, unitPrice.currency),
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
    return (
      this.props.discount || Money.create(0, this.props.unitPrice.currency)
    );
  }

  /**
   * Increase item quantity
   */
  public increaseQuantity(amount: number): void {
    this.props.quantity = this.props.quantity.increase(amount);
    this.markAsUpdated();
  }

  /**
   * Decrease item quantity
   */
  public decreaseQuantity(amount: number): void {
    this.props.quantity = this.props.quantity.decrease(amount);
    this.markAsUpdated();
  }

  /**
   * Update quantity
   */
  public updateQuantity(newQuantity: number): void {
    this.props.quantity = Quantity.create(newQuantity);
    this.markAsUpdated();
  }

  /**
   * Apply discount to item
   */
  public applyDiscount(discount: Money): void {
    if (discount.greaterThan(this.getSubtotal())) {
      throw new ValidationException('Discount cannot exceed subtotal');
    }
    this.props.discount = discount;
    this.markAsUpdated();
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
    return this.getSubtotal().subtract(this.discount);
  }
}
