/**
 * Base Value Object class
 * Value objects are immutable and compared by value, not identity
 */
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.validate(props);
    this.props = Object.freeze(props);
  }

  /**
   * Validate value object properties
   * Should throw error if validation fails
   */
  protected abstract validate(props: T): void;

  /**
   * Value objects are equal if their properties are equal
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    if (this === vo) {
      return true;
    }

    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  /**
   * Get the raw value of the value object
   */
  public getValue(): T {
    return this.props;
  }
}
