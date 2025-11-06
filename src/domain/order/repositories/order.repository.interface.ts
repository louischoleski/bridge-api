import { OrderAggregate } from '../aggregates/order.aggregate';

/**
 * Order Repository Interface
 * Defines operations for persisting and retrieving orders
 */
export interface IOrderRepository {
  /**
   * Save an order
   */
  save(order: OrderAggregate): Promise<void>;

  /**
   * Find order by ID
   */
  findById(id: string): Promise<OrderAggregate | null>;

  /**
   * Find all orders by customer ID
   */
  findByCustomerId(customerId: string): Promise<OrderAggregate[]>;

  /**
   * Delete an order
   */
  delete(id: string): Promise<void>;
}
