import { v4 as uuid, validate as uuidValidate } from 'uuid';

import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface CartIdProps {
  value: string;
}

/**
 * Cart ID Value Object
 */
export class CartId extends ValueObject<CartIdProps> {
  private constructor(props: CartIdProps) {
    super(props);
  }

  public static create(id?: string): CartId {
    return new CartId({ value: id || uuid() });
  }

  protected validate(props: CartIdProps): void {
    if (!props.value) {
      throw new ValidationException('Cart ID cannot be empty');
    }

    if (!uuidValidate(props.value)) {
      throw new ValidationException(`Invalid Cart ID format: ${props.value}`);
    }
  }

  get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
