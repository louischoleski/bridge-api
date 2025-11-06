/**
 * Password Value Object
 * In production, passwords should be hashed using bcrypt or similar
 */
export class Password {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }
    if (_value.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }

  static create(value: string): Password {
    return new Password(value);
  }

  get value(): string {
    return this._value;
  }

  /**
   * Verify password match
   * In production: use bcrypt.compare() or similar
   */
  verify(plainPassword: string): boolean {
    return this._value === plainPassword;
  }

  /**
   * Hash password
   * In production: use bcrypt.hash() or similar
   */
  static hash(plainPassword: string): Password {
    // In production: return new Password(bcrypt.hashSync(plainPassword, 10));
    return new Password(plainPassword);
  }
}
