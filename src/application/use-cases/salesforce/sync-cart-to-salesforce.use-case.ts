import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { ISalesforceContextRepository } from '~domain/salesforce/repositories/salesforce-context.repository.interface';
import {
  ISalesforceCartService,
  SyncCartRequest,
} from '~domain/salesforce/services/salesforce-cart.service.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

export interface SyncCartToSalesforceInput {
  cartId: string;
  customerId: string;
  accountId?: string;
}

export interface SyncCartToSalesforceOutput {
  success: boolean;
  contextId: string;
  message?: string;
}

/**
 * Sync Cart to Salesforce Use Case
 *
 * Orchestrates the synchronization of a cart to Salesforce:
 * 1. Get or create Salesforce context for customer
 * 2. Retrieve cart data
 * 3. Transform to Salesforce format
 * 4. Sync to Salesforce
 * 5. Handle context expiry
 */
export class SyncCartToSalesforceUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly salesforceContextRepository: ISalesforceContextRepository,
    private readonly salesforceService: ISalesforceCartService
  ) {}

  async execute(
    input: SyncCartToSalesforceInput
  ): Promise<SyncCartToSalesforceOutput> {
    // 1. Get cart
    const cart = await this.cartRepository.findById(input.cartId);
    if (!cart) {
      throw new NotFoundException('Cart', input.cartId);
    }

    if (cart.customerId !== input.customerId) {
      throw new Error('Cart does not belong to customer');
    }

    if (cart.isEmpty()) {
      throw new Error('Cannot sync empty cart');
    }

    // 2. Get or create Salesforce context
    let context = await this.salesforceContextRepository.findActiveByCustomerId(
      input.customerId
    );

    if (!context || context.hasExpired()) {
      // Create new context
      context = await this.salesforceService.createContext(
        input.customerId,
        input.accountId
      );
      await this.salesforceContextRepository.save(context);
    } else {
      // Validate existing context with Salesforce
      const isValid = await this.salesforceService.validateContext(context);
      if (!isValid) {
        // Context expired on Salesforce side, create new one
        context = await this.salesforceService.createContext(
          input.customerId,
          input.accountId
        );
        await this.salesforceContextRepository.save(context);
      }
    }

    // 3. Transform cart to Salesforce format
    const syncRequest: SyncCartRequest = {
      cartId: cart.id,
      customerId: cart.customerId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity.value,
        unitPrice: item.unitPrice.amount,
        currency: item.unitPrice.currency,
      })),
      totalAmount: cart.getTotalAmount().amount,
      currency: cart.currency,
    };

    // 4. Sync to Salesforce
    const response = await this.salesforceService.syncCart(context, syncRequest);

    // 5. Update context in repository
    await this.salesforceContextRepository.save(context);

    return {
      success: response.success,
      contextId: response.contextId,
      message: response.message,
    };
  }
}
