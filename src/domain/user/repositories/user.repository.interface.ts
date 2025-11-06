import { UserEntity } from '../entities/user.entity';

/**
 * User Repository Interface
 */
export interface IUserRepository {
  /**
   * Save a user
   */
  save(user: UserEntity): Promise<void>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Find all users
   */
  findAll(): Promise<UserEntity[]>;

  /**
   * Delete user by ID
   */
  delete(id: string): Promise<void>;
}
