import { AggregateRoot } from '~domain/shared/aggregates/aggregate-root.base';
import { OrderLineEntity } from '~domain/order/entities/order-line.entity';
import {
  OrderStatus,
  OrderStatusType,
} from '~domain/order/value-objects/order-status.vo';
import { ShippingAddress } from '~domain/order/value-objects/shipping-address.vo';
import { Money } from '~domain/shared/value-objects/money.vo';
import { OrderCreatedEvent } from '~domain/order/events/order-created.event';
import { OrderConfirmedEvent } from '~domain/order/events/order-confirmed.event';
import { OrderCancelledEvent } from '~domain/order/events/order-cancelled.event';
import { OrderShippedEvent } from '~domain/order/events/order-shipped.event';
import {
  ValidationException,
  InvalidOperationException,
  BusinessRuleViolationException,
} from '~domain/shared/exceptions/domain.exception';

interface OrderProps {
  customerId: string;
  orderLines: OrderLineEntity[];
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  currency: string;
  trackingNumber?: string;
}

/**
 * Order Aggregate Root
 * Represents a customer order with business logic
 */
export class OrderAggregate extends AggregateRoot<OrderProps> {
  private constructor(props: OrderProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new order
   */
  public static create(
    customerId: string,
    orderLines: OrderLineEntity[],
    shippingAddress: ShippingAddress,
    currency: string
  ): OrderAggregate {
    if (!customerId) {
      throw new ValidationException('Customer ID is required');
    }

    if (!orderLines || orderLines.length === 0) {
      throw new ValidationException('Order must have at least one line item');
    }

    // Validate all line items have the same currency
    const invalidCurrencyLine = orderLines.find(
      (line) => line.unitPrice.currency !== currency
    );
    if (invalidCurrencyLine) {
      throw new ValidationException(
        'All order lines must have the same currency'
      );
    }

    const order = new OrderAggregate({
      customerId,
      orderLines,
      shippingAddress,
      status: OrderStatus.pending(),
      currency,
    });

    order.addDomainEvent(
      new OrderCreatedEvent(order.id, customerId, order.getTotalAmount().amount)
    );

    return order;
  }

  /**
   * Reconstitute order from persistence
   */
  public static reconstitute(
    id: string,
    customerId: string,
    orderLines: OrderLineEntity[],
    shippingAddress: ShippingAddress,
    status: OrderStatus,
    currency: string,
    trackingNumber: string | undefined,
    createdAt: Date,
    updatedAt: Date
  ): OrderAggregate {
    const order = new OrderAggregate(
      {
        customerId,
        orderLines,
        shippingAddress,
        status,
        currency,
        trackingNumber,
      },
      id
    );
    order._createdAt = createdAt;
    order._updatedAt = updatedAt;
    return order;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get orderLines(): ReadonlyArray<OrderLineEntity> {
    return this.props.orderLines;
  }

  get shippingAddress(): ShippingAddress {
    return this.props.shippingAddress;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get currency(): string {
    return this.props.currency;
  }

  get trackingNumber(): string | undefined {
    return this.props.trackingNumber;
  }

  /**
   * Confirm the order
   */
  public confirm(): void {
    if (!this.props.status.isPending()) {
      throw new InvalidOperationException(
        'Only pending orders can be confirmed'
      );
    }

    this.props.status = OrderStatus.create(OrderStatusType.CONFIRMED);
    this.addDomainEvent(new OrderConfirmedEvent(this.id));
    this.markAsUpdated();
  }

  /**
   * Mark order as processing
   */
  public process(): void {
    if (!this.props.status.isConfirmed()) {
      throw new InvalidOperationException(
        'Only confirmed orders can be processed'
      );
    }

    this.props.status = OrderStatus.create(OrderStatusType.PROCESSING);
    this.markAsUpdated();
  }

  /**
   * Ship the order
   */
  public ship(trackingNumber?: string): void {
    if (this.props.status.value !== OrderStatusType.PROCESSING) {
      throw new InvalidOperationException(
        'Only processing orders can be shipped'
      );
    }

    this.props.status = OrderStatus.create(OrderStatusType.SHIPPED);
    this.props.trackingNumber = trackingNumber;
    this.addDomainEvent(new OrderShippedEvent(this.id, trackingNumber));
    this.markAsUpdated();
  }

  /**
   * Mark order as delivered
   */
  public deliver(): void {
    if (this.props.status.value !== OrderStatusType.SHIPPED) {
      throw new InvalidOperationException(
        'Only shipped orders can be delivered'
      );
    }

    this.props.status = OrderStatus.create(OrderStatusType.DELIVERED);
    this.markAsUpdated();
  }

  /**
   * Cancel the order
   */
  public cancel(reason: string): void {
    if (!this.props.status.canBeCancelled()) {
      throw new BusinessRuleViolationException(
        `Cannot cancel order with status: ${this.props.status.value}`
      );
    }

    this.props.status = OrderStatus.create(OrderStatusType.CANCELLED);
    this.addDomainEvent(new OrderCancelledEvent(this.id, reason));
    this.markAsUpdated();
  }

  /**
   * Get order subtotal (before discounts)
   */
  public getSubtotal(): Money {
    return this.props.orderLines.reduce(
      (total, line) => total.add(line.getSubtotal()),
      Money.create(0, this.currency)
    );
  }

  /**
   * Get total discount
   */
  public getTotalDiscount(): Money {
    return this.props.orderLines.reduce(
      (total, line) => total.add(line.discount),
      Money.create(0, this.currency)
    );
  }

  /**
   * Get order total amount
   */
  public getTotalAmount(): Money {
    return this.props.orderLines.reduce(
      (total, line) => total.add(line.getTotal()),
      Money.create(0, this.currency)
    );
  }

  /**
   * Get total item count
   */
  public getTotalItemCount(): number {
    return this.props.orderLines.reduce(
      (total, line) => total + line.quantity.value,
      0
    );
  }
}
