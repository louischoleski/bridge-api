import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

export enum OrderStatusType {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

interface OrderStatusProps {
  value: OrderStatusType;
}

/**
 * Order Status Value Object
 */
export class OrderStatus extends ValueObject<OrderStatusProps> {
  private constructor(props: OrderStatusProps) {
    super(props);
  }

  public static create(status: OrderStatusType): OrderStatus {
    return new OrderStatus({ value: status });
  }

  public static pending(): OrderStatus {
    return new OrderStatus({ value: OrderStatusType.PENDING });
  }

  protected validate(props: OrderStatusProps): void {
    if (!Object.values(OrderStatusType).includes(props.value)) {
      throw new ValidationException(`Invalid order status: ${props.value}`);
    }
  }

  get value(): OrderStatusType {
    return this.props.value;
  }

  public isPending(): boolean {
    return this.props.value === OrderStatusType.PENDING;
  }

  public isConfirmed(): boolean {
    return this.props.value === OrderStatusType.CONFIRMED;
  }

  public isCancelled(): boolean {
    return this.props.value === OrderStatusType.CANCELLED;
  }

  public canBeCancelled(): boolean {
    return [OrderStatusType.PENDING, OrderStatusType.CONFIRMED].includes(
      this.props.value
    );
  }

  public toString(): string {
    return this.props.value;
  }
}
