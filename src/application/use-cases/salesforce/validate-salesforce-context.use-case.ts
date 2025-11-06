import { ISalesforceContextRepository } from '~domain/salesforce/repositories/salesforce-context.repository.interface';
import { ISalesforceCartService } from '~domain/salesforce/services/salesforce-cart.service.interface';

export interface ValidateSalesforceContextInput {
  customerId: string;
}

export interface ValidateSalesforceContextOutput {
  hasValidContext: boolean;
  contextId?: string;
  remainingTTL?: number;
  message?: string;
}

/**
 * Validate Salesforce Context Use Case
 *
 * Checks if a customer has a valid, active Salesforce cart context
 */
export class ValidateSalesforceContextUseCase {
  constructor(
    private readonly salesforceContextRepository: ISalesforceContextRepository,
    private readonly salesforceService: ISalesforceCartService
  ) {}

  async execute(
    input: ValidateSalesforceContextInput
  ): Promise<ValidateSalesforceContextOutput> {
    const context =
      await this.salesforceContextRepository.findActiveByCustomerId(
        input.customerId
      );

    if (!context) {
      return {
        hasValidContext: false,
        message: 'No active Salesforce context found',
      };
    }

    // Check local expiry
    if (context.hasExpired()) {
      context.markAsExpired();
      await this.salesforceContextRepository.save(context);
      return {
        hasValidContext: false,
        message: 'Salesforce context has expired',
      };
    }

    // Validate with Salesforce
    const isValid = await this.salesforceService.validateContext(context);

    if (!isValid) {
      context.markAsExpired();
      await this.salesforceContextRepository.save(context);
      return {
        hasValidContext: false,
        contextId: context.contextId.value,
        message: 'Salesforce context is no longer valid',
      };
    }

    return {
      hasValidContext: true,
      contextId: context.contextId.value,
      remainingTTL: context.getRemainingTTL(),
      message: 'Salesforce context is valid',
    };
  }
}
