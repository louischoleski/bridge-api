import { UserEntity } from '~domain/user/entities/user.entity';
import { IUserRepository } from '~domain/user/repositories/user.repository.interface';
import { UserModel } from '~infrastructure/persistence/models/user.model';

/**
 * User Repository Implementation
 * This is a mock implementation. In production, integrate with your database
 */
export class UserRepository implements IUserRepository {
  private users: Map<string, UserModel> = new Map();

  constructor() {
    // Initialize with default users for development
    this.seedUsers();
  }

  async save(user: UserEntity): Promise<void> {
    const userModel = this.toModel(user);
    this.users.set(user.id, userModel);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const userModel = this.users.get(id);

    if (!userModel) {
      return null;
    }

    return this.toDomain(userModel);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const userModel = Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!userModel) {
      return null;
    }

    return this.toDomain(userModel);
  }

  async findAll(): Promise<UserEntity[]> {
    const userModels = Array.from(this.users.values());
    return userModels.map((model) => this.toDomain(model));
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  /**
   * Seed initial users for development
   */
  private seedUsers(): void {
    const defaultUsers: UserModel[] = [
      {
        id: 'admin-001',
        email: 'admin@example.com',
        password: 'admin123',
        roles: ['admin'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'customer-001',
        email: 'customer@example.com',
        password: 'password123',
        roles: ['customer'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'product-manager-001',
        email: 'productmanager@example.com',
        password: 'products123',
        roles: ['product-manager'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'order-manager-001',
        email: 'ordermanager@example.com',
        password: 'orders123',
        roles: ['order-manager'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'guest-001',
        email: 'guest@example.com',
        password: 'guest123',
        roles: ['guest'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultUsers.forEach((user) => {
      this.users.set(user.id, user);
    });
  }

  /**
   * Convert domain entity to database model
   */
  private toModel(user: UserEntity): UserModel {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Convert database model to domain entity
   */
  private toDomain(model: UserModel): UserEntity {
    return UserEntity.reconstitute(
      model.id,
      model.email,
      model.password,
      model.roles,
      model.createdAt,
      model.updatedAt
    );
  }
}
