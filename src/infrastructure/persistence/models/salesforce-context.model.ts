import { ContextStatus } from '~domain/salesforce/entities/salesforce-cart-context.entity';

/**
 * Salesforce Context Model
 * Data structure for persistence layer
 */
export interface SalesforceContextModel {
  id: string;
  contextId: string;
  customerId: string;
  ttlSeconds: number;
  status: ContextStatus;
  accountId?: string;
  opportunityId?: string;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
