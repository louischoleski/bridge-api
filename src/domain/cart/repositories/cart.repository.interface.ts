import { CartAggregate } from '../aggregates/cart.aggregate';

/**
 * Cart Repository Interface
 * Defines operations for persisting and retrieving carts
 */
export interface ICartRepository {
  /**
   * Save a cart
   */
  save(cart: CartAggregate): Promise<void>;

  /**
   * Find cart by ID
   */
  findById(id: string): Promise<CartAggregate | null>;

  /**
   * Find active cart by customer ID
   */
  findActiveByCustomerId(customerId: string): Promise<CartAggregate | null>;

  /**
   * Delete a cart
   */
  delete(id: string): Promise<void>;

  /**
   * Find all carts by customer ID
   */
  findAllByCustomerId(customerId: string): Promise<CartAggregate[]>;
}
