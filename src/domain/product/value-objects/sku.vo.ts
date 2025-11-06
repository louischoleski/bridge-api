import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface SkuProps {
  value: string;
}

/**
 * SKU (Stock Keeping Unit) Value Object
 */
export class Sku extends ValueObject<SkuProps> {
  private static readonly SKU_REGEX = /^[A-Z0-9-]{3,50}$/;

  private constructor(props: SkuProps) {
    super(props);
  }

  public static create(sku: string): Sku {
    return new Sku({ value: sku.toUpperCase().trim() });
  }

  protected validate(props: SkuProps): void {
    if (!props.value) {
      throw new ValidationException('SKU cannot be empty');
    }

    if (!Sku.SKU_REGEX.test(props.value)) {
      throw new ValidationException(
        `Invalid SKU format: ${props.value}. Must be 3-50 characters, uppercase letters, numbers, and hyphens only.`
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
