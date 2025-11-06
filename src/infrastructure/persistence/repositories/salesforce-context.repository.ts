import {
  ContextStatus,
  SalesforceCartContext,
} from '~domain/salesforce/entities/salesforce-cart-context.entity';
import { ISalesforceContextRepository } from '~domain/salesforce/repositories/salesforce-context.repository.interface';
import { ContextTTL } from '~domain/salesforce/value-objects/context-ttl.vo';
import { SalesforceContextId } from '~domain/salesforce/value-objects/salesforce-context-id.vo';
import { SalesforceContextModel } from '~infrastructure/persistence/models/salesforce-context.model';

/**
 * Salesforce Context Repository Implementation
 * In-memory storage for Salesforce cart contexts
 */
export class SalesforceContextRepository implements ISalesforceContextRepository {
  private contexts: Map<string, SalesforceContextModel> = new Map();

  async save(context: SalesforceCartContext): Promise<void> {
    const model = this.toModel(context);
    this.contexts.set(context.id, model);
  }

  async findById(id: string): Promise<SalesforceCartContext | null> {
    const model = this.contexts.get(id);
    return model ? this.toDomain(model) : null;
  }

  async findActiveByCustomerId(
    customerId: string
  ): Promise<SalesforceCartContext | null> {
    const now = new Date();
    const model = Array.from(this.contexts.values()).find((ctx) => {
      if (ctx.customerId !== customerId) return false;
      if (ctx.status !== ContextStatus.ACTIVE) return false;

      // Check if expired
      const ttl = ContextTTL.create(ctx.ttlSeconds);
      return !ttl.hasExpired(ctx.createdAt, now);
    });

    return model ? this.toDomain(model) : null;
  }

  async findByContextId(contextId: string): Promise<SalesforceCartContext | null> {
    const model = Array.from(this.contexts.values()).find(
      (ctx) => ctx.contextId === contextId
    );

    return model ? this.toDomain(model) : null;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, model] of this.contexts.entries()) {
      const ttl = ContextTTL.create(model.ttlSeconds);
      if (ttl.hasExpired(model.createdAt, now)) {
        this.contexts.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async delete(id: string): Promise<void> {
    this.contexts.delete(id);
  }

  /**
   * Get all contexts (for testing purposes)
   */
  async findAll(): Promise<SalesforceCartContext[]> {
    return Array.from(this.contexts.values()).map((model) => this.toDomain(model));
  }

  /**
   * Clear all contexts (for testing purposes)
   */
  async clear(): Promise<void> {
    this.contexts.clear();
  }

  private toModel(context: SalesforceCartContext): SalesforceContextModel {
    return {
      id: context.id,
      contextId: context.contextId.value,
      customerId: context.customerId,
      ttlSeconds: context.ttl.seconds,
      status: context.status,
      accountId: context.accountId,
      opportunityId: context.opportunityId,
      lastAccessedAt: context.lastAccessedAt,
      createdAt: context.createdAt,
      updatedAt: context.updatedAt,
    };
  }

  private toDomain(model: SalesforceContextModel): SalesforceCartContext {
    return SalesforceCartContext.reconstitute(
      model.id,
      SalesforceContextId.create(model.contextId),
      model.customerId,
      ContextTTL.create(model.ttlSeconds),
      model.status,
      model.lastAccessedAt,
      model.createdAt,
      model.updatedAt,
      model.accountId,
      model.opportunityId
    );
  }
}
