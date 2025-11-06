import { ISalesforceContextRepository } from '~domain/salesforce/repositories/salesforce-context.repository.interface';
import { ISalesforceCartService } from '~domain/salesforce/services/salesforce-cart.service.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

export interface RefreshSalesforceContextInput {
  customerId: string;
}

export interface RefreshSalesforceContextOutput {
  success: boolean;
  contextId: string;
  newTTL: number;
  message?: string;
}

/**
 * Refresh Salesforce Context Use Case
 *
 * Extends the TTL of an existing Salesforce cart context
 */
export class RefreshSalesforceContextUseCase {
  constructor(
    private readonly salesforceContextRepository: ISalesforceContextRepository,
    private readonly salesforceService: ISalesforceCartService
  ) {}

  async execute(
    input: RefreshSalesforceContextInput
  ): Promise<RefreshSalesforceContextOutput> {
    const context =
      await this.salesforceContextRepository.findActiveByCustomerId(
        input.customerId
      );

    if (!context) {
      throw new NotFoundException(
        'Salesforce context',
        `customer ${input.customerId}`
      );
    }

    if (context.hasExpired()) {
      throw new Error(
        'Cannot refresh expired context. Please create a new context.'
      );
    }

    // Refresh in Salesforce
    await this.salesforceService.refreshContext(context);

    // Update in repository
    await this.salesforceContextRepository.save(context);

    return {
      success: true,
      contextId: context.contextId.value,
      newTTL: context.getRemainingTTL(),
      message: 'Context refreshed successfully',
    };
  }
}
