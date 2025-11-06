import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface QuantityProps {
  value: number;
}

/**
 * Quantity Value Object
 */
export class Quantity extends ValueObject<QuantityProps> {
  private static readonly MAX_QUANTITY = 999;

  private constructor(props: QuantityProps) {
    super(props);
  }

  public static create(value: number): Quantity {
    return new Quantity({ value });
  }

  protected validate(props: QuantityProps): void {
    if (!Number.isInteger(props.value)) {
      throw new ValidationException('Quantity must be an integer');
    }

    if (props.value < 1) {
      throw new ValidationException('Quantity must be at least 1');
    }

    if (props.value > Quantity.MAX_QUANTITY) {
      throw new ValidationException(
        `Quantity cannot exceed ${Quantity.MAX_QUANTITY}`
      );
    }
  }

  get value(): number {
    return this.props.value;
  }

  /**
   * Increase quantity
   */
  public increase(amount: number): Quantity {
    return Quantity.create(this.value + amount);
  }

  /**
   * Decrease quantity
   */
  public decrease(amount: number): Quantity {
    return Quantity.create(this.value - amount);
  }

  public toString(): string {
    return this.value.toString();
  }
}
