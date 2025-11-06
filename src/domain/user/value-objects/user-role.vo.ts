/**
 * User Role Value Object
 */
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  PRODUCT_MANAGER = 'product-manager',
  ORDER_MANAGER = 'order-manager',
  GUEST = 'guest',
}

export class UserRoles {
  private constructor(private readonly _roles: UserRole[]) {
    if (!_roles || _roles.length === 0) {
      throw new Error('User must have at least one role');
    }
  }

  static create(roles: string[]): UserRoles {
    const validRoles = roles.map((role) => {
      const roleValue = Object.values(UserRole).find((r) => r === role);
      if (!roleValue) {
        throw new Error(`Invalid role: ${role}`);
      }
      return roleValue;
    });

    return new UserRoles(validRoles);
  }

  get roles(): UserRole[] {
    return [...this._roles];
  }

  hasRole(role: UserRole): boolean {
    return this._roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this._roles.includes(role));
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  toStringArray(): string[] {
    return this._roles.map((r) => r.toString());
  }
}
