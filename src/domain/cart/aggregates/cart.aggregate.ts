import { CartItemEntity } from '~domain/cart/entities/cart-item.entity';
import { CartCheckedOutEvent } from '~domain/cart/events/cart-checked-out.event';
import { CartCreatedEvent } from '~domain/cart/events/cart-created.event';
import { ItemAddedEvent } from '~domain/cart/events/item-added.event';
import { ItemRemovedEvent } from '~domain/cart/events/item-removed.event';
import { AggregateRoot } from '~domain/shared/aggregates/aggregate-root.base';
import {
  BusinessRuleViolationException,
  InvalidOperationException,
  ValidationException,
} from '~domain/shared/exceptions/domain.exception';
import { Money } from '~domain/shared/value-objects/money.vo';

export enum CartStatus {
  ACTIVE = 'active',
  CHECKED_OUT = 'checked-out',
  ABANDONED = 'abandoned',
}

interface CartProps {
  customerId: string;
  items: CartItemEntity[];
  status: CartStatus;
  currency: string;
}

/**
 * Cart Aggregate Root
 * Represents a shopping cart with business logic
 */
export class CartAggregate extends AggregateRoot<CartProps> {
  private static readonly MAX_ITEMS = 50;

  private constructor(props: CartProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new cart
   */
  public static create(customerId: string, currency = 'CAD'): CartAggregate {
    if (!customerId) {
      throw new ValidationException('Customer ID is required');
    }

    const cart = new CartAggregate({
      customerId,
      items: [],
      status: CartStatus.ACTIVE,
      currency,
    });

    cart.addDomainEvent(new CartCreatedEvent(cart.id, customerId));

    return cart;
  }

  /**
   * Reconstitute cart from persistence
   */
  public static reconstitute(
    id: string,
    customerId: string,
    items: CartItemEntity[],
    status: CartStatus,
    currency: string,
    createdAt: Date,
    updatedAt: Date
  ): CartAggregate {
    const cart = new CartAggregate({ customerId, items, status, currency }, id);
    cart._createdAt = createdAt;
    cart._updatedAt = updatedAt;
    return cart;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get items(): ReadonlyArray<CartItemEntity> {
    return this.props.items;
  }

  get status(): CartStatus {
    return this.props.status;
  }

  get currency(): string {
    return this.props.currency;
  }

  /**
   * Add item to cart
   */
  public addItem(
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: Money
  ): void {
    this.assertCartIsActive();

    if (unitPrice.currency !== this.currency) {
      throw new ValidationException(
        `Product currency ${unitPrice.currency} does not match cart currency ${this.currency}`
      );
    }

    // Check if item already exists
    const existingItem = this.findItemByProductId(productId);

    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      if (this.props.items.length >= CartAggregate.MAX_ITEMS) {
        throw new BusinessRuleViolationException(
          `Cart cannot contain more than ${CartAggregate.MAX_ITEMS} items`
        );
      }

      const newItem = CartItemEntity.create(
        productId,
        productName,
        quantity,
        unitPrice
      );
      this.props.items.push(newItem);
    }

    this.addDomainEvent(
      new ItemAddedEvent(
        this.id,
        productId,
        productName,
        quantity,
        unitPrice.amount
      )
    );
    this.markAsUpdated();
  }

  /**
   * Remove item from cart
   */
  public removeItem(productId: string): void {
    this.assertCartIsActive();

    const itemIndex = this.props.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      throw new ValidationException(
        `Item with product ID ${productId} not found in cart`
      );
    }

    this.props.items.splice(itemIndex, 1);
    this.addDomainEvent(new ItemRemovedEvent(this.id, productId));
    this.markAsUpdated();
  }

  /**
   * Update item quantity
   */
  public updateItemQuantity(productId: string, quantity: number): void {
    this.assertCartIsActive();

    const item = this.findItemByProductId(productId);

    if (!item) {
      throw new ValidationException(
        `Item with product ID ${productId} not found in cart`
      );
    }

    item.updateQuantity(quantity);
    this.markAsUpdated();
  }

  /**
   * Clear all items from cart
   */
  public clear(): void {
    this.assertCartIsActive();
    this.props.items = [];
    this.markAsUpdated();
  }

  /**
   * Checkout cart
   */
  public checkout(): void {
    this.assertCartIsActive();

    if (this.props.items.length === 0) {
      throw new BusinessRuleViolationException('Cannot checkout empty cart');
    }

    this.props.status = CartStatus.CHECKED_OUT;
    this.addDomainEvent(
      new CartCheckedOutEvent(
        this.id,
        this.customerId,
        this.getTotalAmount().amount
      )
    );
    this.markAsUpdated();
  }

  /**
   * Mark cart as abandoned
   */
  public markAsAbandoned(): void {
    if (this.props.status !== CartStatus.ACTIVE) {
      throw new InvalidOperationException(
        'Only active carts can be marked as abandoned'
      );
    }

    this.props.status = CartStatus.ABANDONED;
    this.markAsUpdated();
  }

  /**
   * Get total amount of all items
   */
  public getTotalAmount(): Money {
    if (this.props.items.length === 0) {
      return Money.create(0, this.currency);
    }

    return this.props.items.reduce(
      (total, item) => total.add(item.getTotal()),
      Money.create(0, this.currency)
    );
  }

  /**
   * Get subtotal (before discounts)
   */
  public getSubtotal(): Money {
    if (this.props.items.length === 0) {
      return Money.create(0, this.currency);
    }

    return this.props.items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      Money.create(0, this.currency)
    );
  }

  /**
   * Get total discount
   */
  public getTotalDiscount(): Money {
    if (this.props.items.length === 0) {
      return Money.create(0, this.currency);
    }

    return this.props.items.reduce(
      (total, item) => total.add(item.discount),
      Money.create(0, this.currency)
    );
  }

  /**
   * Get total item count
   */
  public getTotalItemCount(): number {
    return this.props.items.reduce(
      (total, item) => total + item.quantity.value,
      0
    );
  }

  /**
   * Check if cart is empty
   */
  public isEmpty(): boolean {
    return this.props.items.length === 0;
  }

  /**
   * Check if cart contains product
   */
  public hasProduct(productId: string): boolean {
    return this.findItemByProductId(productId) !== undefined;
  }

  private findItemByProductId(productId: string): CartItemEntity | undefined {
    return this.props.items.find((item) => item.productId === productId);
  }

  private assertCartIsActive(): void {
    if (this.props.status !== CartStatus.ACTIVE) {
      throw new InvalidOperationException(
        `Cannot modify cart with status: ${this.props.status}`
      );
    }
  }
}
