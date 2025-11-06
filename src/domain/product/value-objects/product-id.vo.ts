import { v4 as uuid, validate as uuidValidate } from 'uuid';

import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface ProductIdProps {
  value: string;
}

/**
 * Product ID Value Object
 */
export class ProductId extends ValueObject<ProductIdProps> {
  private constructor(props: ProductIdProps) {
    super(props);
  }

  public static create(id?: string): ProductId {
    return new ProductId({ value: id || uuid() });
  }

  protected validate(props: ProductIdProps): void {
    if (!props.value) {
      throw new ValidationException('Product ID cannot be empty');
    }

    if (!uuidValidate(props.value)) {
      throw new ValidationException(
        `Invalid Product ID format: ${props.value}`
      );
    }
  }

  get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
