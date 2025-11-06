import { v4 as uuid, validate as uuidValidate } from 'uuid';

import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface OrderIdProps {
  value: string;
}

/**
 * Order ID Value Object
 */
export class OrderId extends ValueObject<OrderIdProps> {
  private constructor(props: OrderIdProps) {
    super(props);
  }

  public static create(id?: string): OrderId {
    return new OrderId({ value: id || uuid() });
  }

  protected validate(props: OrderIdProps): void {
    if (!props.value) {
      throw new ValidationException('Order ID cannot be empty');
    }

    if (!uuidValidate(props.value)) {
      throw new ValidationException(`Invalid Order ID format: ${props.value}`);
    }
  }

  get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
