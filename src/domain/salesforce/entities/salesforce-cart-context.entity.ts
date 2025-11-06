import { BaseEntity } from '~domain/shared/entities/base.entity';
import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ContextTTL } from '~domain/salesforce/value-objects/context-ttl.vo';
import { SalesforceContextId } from '~domain/salesforce/value-objects/salesforce-context-id.vo';

export enum ContextStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  INVALIDATED = 'invalidated',
}

interface SalesforceCartContextProps {
  contextId: SalesforceContextId;
  customerId: string;
  ttl: ContextTTL;
  status: ContextStatus;
  accountId?: string;
  opportunityId?: string;
  lastAccessedAt: Date;
}

/**
 * Salesforce Cart Context Entity
 * Represents a non-persistent session/context for Salesforce cart operations
 */
export class SalesforceCartContext extends BaseEntity<SalesforceCartContextProps> {
  private constructor(props: SalesforceCartContextProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new Salesforce cart context
   */
  public static create(
    customerId: string,
    accountId?: string,
    ttl?: ContextTTL,
    contextId?: SalesforceContextId
  ): SalesforceCartContext {
    if (!customerId) {
      throw new ValidationException('Customer ID is required');
    }

    return new SalesforceCartContext({
      contextId: contextId || SalesforceContextId.create(),
      customerId,
      ttl: ttl || ContextTTL.create(),
      status: ContextStatus.ACTIVE,
      accountId,
      lastAccessedAt: new Date(),
    });
  }

  /**
   * Reconstitute from persistence
   */
  public static reconstitute(
    id: string,
    contextId: SalesforceContextId,
    customerId: string,
    ttl: ContextTTL,
    status: ContextStatus,
    lastAccessedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    accountId?: string,
    opportunityId?: string
  ): SalesforceCartContext {
    const context = new SalesforceCartContext(
      {
        contextId,
        customerId,
        ttl,
        status,
        accountId,
        opportunityId,
        lastAccessedAt,
      },
      id
    );
    context._createdAt = createdAt;
    context._updatedAt = updatedAt;
    return context;
  }

  get contextId(): SalesforceContextId {
    return this.props.contextId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get ttl(): ContextTTL {
    return this.props.ttl;
  }

  get status(): ContextStatus {
    return this.props.status;
  }

  get accountId(): string | undefined {
    return this.props.accountId;
  }

  get opportunityId(): string | undefined {
    return this.props.opportunityId;
  }

  get lastAccessedAt(): Date {
    return this.props.lastAccessedAt;
  }

  /**
   * Check if context has expired
   */
  public hasExpired(now: Date = new Date()): boolean {
    if (this.status === ContextStatus.EXPIRED) {
      return true;
    }
    return this.ttl.hasExpired(this.createdAt, now);
  }

  /**
   * Check if context is active and valid
   */
  public isActive(): boolean {
    return this.status === ContextStatus.ACTIVE && !this.hasExpired();
  }

  /**
   * Get remaining TTL in seconds
   */
  public getRemainingTTL(now: Date = new Date()): number {
    if (!this.isActive()) {
      return 0;
    }
    return this.ttl.getRemainingSeconds(this.createdAt, now);
  }

  /**
   * Mark context as expired
   */
  public markAsExpired(): void {
    this.props.status = ContextStatus.EXPIRED;
    this.markAsUpdated();
  }

  /**
   * Invalidate context (manual termination)
   */
  public invalidate(): void {
    this.props.status = ContextStatus.INVALIDATED;
    this.markAsUpdated();
  }

  /**
   * Update last accessed timestamp
   */
  public touch(): void {
    if (!this.isActive()) {
      throw new ValidationException('Cannot touch an expired or invalidated context');
    }
    this.props.lastAccessedAt = new Date();
    this.markAsUpdated();
  }

  /**
   * Set Salesforce opportunity ID
   */
  public setOpportunityId(opportunityId: string): void {
    if (!opportunityId) {
      throw new ValidationException('Opportunity ID cannot be empty');
    }
    this.props.opportunityId = opportunityId;
    this.markAsUpdated();
  }

  /**
   * Set Salesforce account ID
   */
  public setAccountId(accountId: string): void {
    if (!accountId) {
      throw new ValidationException('Account ID cannot be empty');
    }
    this.props.accountId = accountId;
    this.markAsUpdated();
  }
}
