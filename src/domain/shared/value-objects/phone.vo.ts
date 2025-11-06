import { ValidationException } from '../exceptions/domain.exception';

import { ValueObject } from './value-object.base';

interface PhoneProps {
  value: string;
}

/**
 * Phone Number Value Object
 */
export class Phone extends ValueObject<PhoneProps> {
  private static readonly PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

  private constructor(props: PhoneProps) {
    super(props);
  }

  public static create(phone: string): Phone {
    const sanitized = phone.replace(/[\s\-\(\)]/g, '');
    return new Phone({ value: sanitized });
  }

  protected validate(props: PhoneProps): void {
    if (!props.value) {
      throw new ValidationException('Phone number cannot be empty');
    }

    if (!Phone.PHONE_REGEX.test(props.value)) {
      throw new ValidationException(
        `Invalid phone number format: ${props.value}`
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
