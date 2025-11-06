import { SalesforceCartContext } from '~domain/salesforce/entities/salesforce-cart-context.entity';

/**
 * Salesforce Context Repository Interface
 * Defines persistence operations for Salesforce cart contexts
 */
export interface ISalesforceContextRepository {
  /**
   * Save or update a context
   */
  save(context: SalesforceCartContext): Promise<void>;

  /**
   * Find context by ID
   */
  findById(id: string): Promise<SalesforceCartContext | null>;

  /**
   * Find active context by customer ID
   */
  findActiveByCustomerId(customerId: string): Promise<SalesforceCartContext | null>;

  /**
   * Find context by Salesforce context ID
   */
  findByContextId(contextId: string): Promise<SalesforceCartContext | null>;

  /**
   * Delete expired contexts
   */
  deleteExpired(): Promise<number>;

  /**
   * Delete context
   */
  delete(id: string): Promise<void>;
}
