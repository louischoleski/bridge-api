import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface ShippingAddressProps {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Shipping Address Value Object
 */
export class ShippingAddress extends ValueObject<ShippingAddressProps> {
  private constructor(props: ShippingAddressProps) {
    super(props);
  }

  public static create(
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  ): ShippingAddress {
    return new ShippingAddress({ street, city, state, zipCode, country });
  }

  protected validate(props: ShippingAddressProps): void {
    if (!props.street || props.street.trim().length === 0) {
      throw new ValidationException('Street is required');
    }

    if (!props.city || props.city.trim().length === 0) {
      throw new ValidationException('City is required');
    }

    if (!props.state || props.state.trim().length === 0) {
      throw new ValidationException('State is required');
    }

    if (!props.zipCode || props.zipCode.trim().length === 0) {
      throw new ValidationException('Zip code is required');
    }

    if (!props.country || props.country.trim().length === 0) {
      throw new ValidationException('Country is required');
    }
  }

  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get zipCode(): string {
    return this.props.zipCode;
  }

  get country(): string {
    return this.props.country;
  }

  public toString(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
}
