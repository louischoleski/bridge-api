import { ValueObject } from './value-object.base';
import { ValidationException } from '../exceptions/domain.exception';

interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * Money Value Object
 * Represents monetary value with currency
 */
export class Money extends ValueObject<MoneyProps> {
  private static readonly SUPPORTED_CURRENCIES = ['CAD', 'EUR', 'GBP', 'CAD'];

  private constructor(props: MoneyProps) {
    super(props);
  }

  public static create(amount: number, currency: string = 'CAD'): Money {
    return new Money({ amount, currency: currency.toUpperCase() });
  }

  protected validate(props: MoneyProps): void {
    if (props.amount < 0) {
      throw new ValidationException('Amount cannot be negative');
    }

    if (!Number.isFinite(props.amount)) {
      throw new ValidationException('Amount must be a valid number');
    }

    if (!Money.SUPPORTED_CURRENCIES.includes(props.currency)) {
      throw new ValidationException(
        `Unsupported currency: ${
          props.currency
        }. Supported: ${Money.SUPPORTED_CURRENCIES.join(', ')}`
      );
    }
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  /**
   * Add two money values
   */
  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract two money values
   */
  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply money by a factor
   */
  public multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  /**
   * Compare with another money value
   */
  public greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  public lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new ValidationException(
        `Cannot operate on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }

  public toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}
