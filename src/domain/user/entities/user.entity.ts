import { Email } from '~domain/shared/value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Password } from '../value-objects/password.vo';
import { UserRoles } from '../value-objects/user-role.vo';

/**
 * User Entity
 * Represents a user in the system
 */
export class UserEntity {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private readonly _password: Password,
    private readonly _roles: UserRoles,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  /**
   * Create a new user
   */
  static create(
    email: string,
    password: string,
    roles: string[],
    id?: string
  ): UserEntity {
    const userId = id ? UserId.create(id) : UserId.create(`user-${Date.now()}`);
    const emailVo = Email.create(email);
    const passwordVo = Password.hash(password);
    const rolesVo = UserRoles.create(roles);
    const now = new Date();

    return new UserEntity(userId, emailVo, passwordVo, rolesVo, now, now);
  }

  /**
   * Reconstitute a user from persistence
   */
  static reconstitute(
    id: string,
    email: string,
    hashedPassword: string,
    roles: string[],
    createdAt: Date,
    updatedAt: Date
  ): UserEntity {
    const userId = UserId.create(id);
    const emailVo = Email.create(email);
    const passwordVo = Password.create(hashedPassword);
    const rolesVo = UserRoles.create(roles);

    return new UserEntity(
      userId,
      emailVo,
      passwordVo,
      rolesVo,
      createdAt,
      updatedAt
    );
  }

  /**
   * Verify password
   */
  verifyPassword(plainPassword: string): boolean {
    return this._password.verify(plainPassword);
  }

  /**
   * Update password
   */
  updatePassword(newPassword: string): void {
    const newPasswordVo = Password.hash(newPassword);
    (this as any)._password = newPasswordVo;
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id.value;
  }

  get email(): string {
    return this._email.value;
  }

  get password(): string {
    return this._password.value;
  }

  get roles(): string[] {
    return this._roles.toStringArray();
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
