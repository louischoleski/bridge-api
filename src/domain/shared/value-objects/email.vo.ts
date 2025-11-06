import { ValidationException } from '../exceptions/domain.exception';

import { ValueObject } from './value-object.base';

interface EmailProps {
  value: string;
}

/**
 * Email Value Object
 */
export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Email {
    return new Email({ value: email.toLowerCase().trim() });
  }

  protected validate(props: EmailProps): void {
    if (!props.value) {
      throw new ValidationException('Email cannot be empty');
    }

    if (!Email.EMAIL_REGEX.test(props.value)) {
      throw new ValidationException(`Invalid email format: ${props.value}`);
    }
  }

  get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
