import { SalesforceCartContext } from '~domain/salesforce/entities/salesforce-cart-context.entity';
import {
  ISalesforceCartService,
  SyncCartRequest,
  SyncCartResponse,
} from '~domain/salesforce/services/salesforce-cart.service.interface';
import { ContextTTL } from '~domain/salesforce/value-objects/context-ttl.vo';

export interface SalesforceCartClientConfig {
  /**
   * Simulate network latency (ms)
   */
  networkLatency?: number;

  /**
   * Simulate random failures (0.0 to 1.0)
   */
  failureRate?: number;

  /**
   * Default TTL for contexts (seconds)
   */
  defaultTTL?: number;

  /**
   * Enable verbose logging
   */
  enableLogging?: boolean;
}

/**
 * Salesforce Cart Client Test Double
 *
 * A realistic test double that simulates Salesforce cart API behavior including:
 * - Non-persistent cart context with TTL expiry
 * - Network latency
 * - Realistic error scenarios
 * - Context validation and refresh
 *
 * This is NOT a real Salesforce integration. It simulates realistic behavior
 * for testing and development purposes.
 */
export class SalesforceCartClientTestDouble implements ISalesforceCartService {
  private readonly config: Required<SalesforceCartClientConfig>;
  private readonly contextStore: Map<string, {
    context: SalesforceCartContext;
    data?: SyncCartRequest;
  }> = new Map();

  constructor(config: SalesforceCartClientConfig = {}) {
    this.config = {
      networkLatency: config.networkLatency ?? 100,
      failureRate: config.failureRate ?? 0.0,
      defaultTTL: config.defaultTTL ?? ContextTTL.DEFAULT_TTL_SECONDS,
      enableLogging: config.enableLogging ?? false,
    };
  }

  /**
   * Create a new Salesforce cart context
   */
  async createContext(
    customerId: string,
    accountId?: string
  ): Promise<SalesforceCartContext> {
    await this.simulateNetworkLatency();
    this.simulateRandomFailure('Failed to create Salesforce context');

    const context = SalesforceCartContext.create(
      customerId,
      accountId,
      ContextTTL.create(this.config.defaultTTL)
    );

    this.contextStore.set(context.contextId.value, { context });

    this.log(`[SF] Created context ${context.contextId.value} for customer ${customerId}`);

    return context;
  }

  /**
   * Sync cart data to Salesforce
   */
  async syncCart(
    context: SalesforceCartContext,
    request: SyncCartRequest
  ): Promise<SyncCartResponse> {
    await this.simulateNetworkLatency();

    // Check if context exists
    const storedContext = this.contextStore.get(context.contextId.value);
    if (!storedContext) {
      this.log(`[SF] Context ${context.contextId.value} not found`);
      return {
        contextId: context.contextId.value,
        success: false,
        message: 'Context not found in Salesforce',
      };
    }

    // Check if context has expired
    if (context.hasExpired()) {
      this.log(`[SF] Context ${context.contextId.value} has expired`);
      this.contextStore.delete(context.contextId.value);
      return {
        contextId: context.contextId.value,
        success: false,
        message: 'Salesforce context has expired. Please create a new context.',
      };
    }

    // Simulate random failures
    this.simulateRandomFailure('Salesforce sync failed due to network error');

    // Validate cart data
    this.validateCartData(request);

    // Store cart data (simulating Salesforce storage)
    storedContext.data = request;
    storedContext.context.touch(); // Update last accessed time

    this.log(
      `[SF] Synced cart ${request.cartId} with ${request.items.length} items to context ${context.contextId.value}`
    );

    return {
      contextId: context.contextId.value,
      success: true,
      message: 'Cart synced successfully',
    };
  }

  /**
   * Validate that a context is still valid in Salesforce
   */
  async validateContext(context: SalesforceCartContext): Promise<boolean> {
    await this.simulateNetworkLatency();

    const storedContext = this.contextStore.get(context.contextId.value);

    if (!storedContext) {
      this.log(`[SF] Context ${context.contextId.value} not found during validation`);
      return false;
    }

    if (context.hasExpired()) {
      this.log(`[SF] Context ${context.contextId.value} expired during validation`);
      this.contextStore.delete(context.contextId.value);
      return false;
    }

    this.log(`[SF] Context ${context.contextId.value} is valid`);
    return true;
  }

  /**
   * Refresh/renew a context (extend TTL)
   */
  async refreshContext(context: SalesforceCartContext): Promise<void> {
    await this.simulateNetworkLatency();
    this.simulateRandomFailure('Failed to refresh Salesforce context');

    const storedContext = this.contextStore.get(context.contextId.value);

    if (!storedContext) {
      throw new Error('Context not found in Salesforce');
    }

    if (context.hasExpired()) {
      this.contextStore.delete(context.contextId.value);
      throw new Error('Cannot refresh expired context');
    }

    // Create a new context with extended TTL (simulating refresh)
    const refreshedContext = SalesforceCartContext.create(
      context.customerId,
      context.accountId,
      ContextTTL.create(this.config.defaultTTL),
      context.contextId
    );

    storedContext.context = refreshedContext;

    this.log(`[SF] Refreshed context ${context.contextId.value}`);
  }

  /**
   * Invalidate/terminate a context
   */
  async invalidateContext(context: SalesforceCartContext): Promise<void> {
    await this.simulateNetworkLatency();

    const deleted = this.contextStore.delete(context.contextId.value);

    this.log(
      `[SF] Invalidated context ${context.contextId.value} (existed: ${deleted})`
    );
  }

  /**
   * Get stored cart data for a context (test helper)
   */
  async getCartData(contextId: string): Promise<SyncCartRequest | undefined> {
    const stored = this.contextStore.get(contextId);
    return stored?.data;
  }

  /**
   * Clean up expired contexts (background task simulation)
   */
  async cleanupExpiredContexts(): Promise<number> {
    let cleaned = 0;
    const now = new Date();

    for (const [contextId, { context }] of this.contextStore.entries()) {
      if (context.hasExpired(now)) {
        this.contextStore.delete(contextId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.log(`[SF] Cleaned up ${cleaned} expired contexts`);
    }

    return cleaned;
  }

  /**
   * Get statistics (for monitoring/testing)
   */
  getStats(): {
    activeContexts: number;
    totalContexts: number;
  } {
    return {
      activeContexts: Array.from(this.contextStore.values()).filter(
        ({ context }) => !context.hasExpired()
      ).length,
      totalContexts: this.contextStore.size,
    };
  }

  /**
   * Clear all contexts (test helper)
   */
  clearAllContexts(): void {
    this.contextStore.clear();
    this.log('[SF] Cleared all contexts');
  }

  // Private helper methods

  private async simulateNetworkLatency(): Promise<void> {
    if (this.config.networkLatency > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.networkLatency)
      );
    }
  }

  private simulateRandomFailure(message: string): void {
    if (this.config.failureRate > 0 && Math.random() < this.config.failureRate) {
      throw new Error(message);
    }
  }

  private validateCartData(request: SyncCartRequest): void {
    if (!request.cartId || !request.customerId) {
      throw new Error('Invalid cart data: missing required fields');
    }

    if (!request.items || request.items.length === 0) {
      throw new Error('Invalid cart data: cart must have at least one item');
    }

    for (const item of request.items) {
      if (!item.productId || item.quantity <= 0 || item.unitPrice < 0) {
        throw new Error(
          `Invalid item data: ${JSON.stringify(item)}`
        );
      }
    }
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[SalesforceCartClient] ${message}`);
    }
  }
}
