import { SalesforceCartContext } from '~domain/salesforce/entities/salesforce-cart-context.entity';

export interface SalesforceCartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface SyncCartRequest {
  cartId: string;
  customerId: string;
  items: SalesforceCartItem[];
  totalAmount: number;
  currency: string;
}

export interface SyncCartResponse {
  contextId: string;
  success: boolean;
  message?: string;
}

/**
 * Salesforce Cart Service Interface
 * Defines operations for interacting with Salesforce cart API
 * This is the domain service contract that infrastructure will implement
 */
export interface ISalesforceCartService {
  /**
   * Create a new Salesforce cart context
   */
  createContext(customerId: string, accountId?: string): Promise<SalesforceCartContext>;

  /**
   * Sync cart data to Salesforce
   */
  syncCart(
    context: SalesforceCartContext,
    request: SyncCartRequest
  ): Promise<SyncCartResponse>;

  /**
   * Validate that a context is still valid in Salesforce
   */
  validateContext(context: SalesforceCartContext): Promise<boolean>;

  /**
   * Refresh/renew a context (extend TTL)
   */
  refreshContext(context: SalesforceCartContext): Promise<void>;

  /**
   * Invalidate/terminate a context
   */
  invalidateContext(context: SalesforceCartContext): Promise<void>;
}
