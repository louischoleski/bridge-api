import test from 'ava';

import {
  ContextStatus,
  SalesforceCartContext,
} from './salesforce-cart-context.entity';
import { ContextTTL } from '~domain/salesforce/value-objects/context-ttl.vo';

test('should create a new Salesforce cart context', (t) => {
  const context = SalesforceCartContext.create('customer-123', 'account-456');

  t.truthy(context.id);
  t.truthy(context.contextId);
  t.is(context.customerId, 'customer-123');
  t.is(context.accountId, 'account-456');
  t.is(context.status, ContextStatus.ACTIVE);
  t.true(context.isActive());
  t.truthy(context.lastAccessedAt);
});

test('should throw error when creating context without customer ID', (t) => {
  t.throws(
    () => {
      SalesforceCartContext.create('');
    },
    { message: /Customer ID is required/ }
  );
});

test('should detect expired context', (t) => {
  const shortTTL = ContextTTL.create(60); // 1 minute
  const context = SalesforceCartContext.create(
    'customer-123',
    undefined,
    shortTTL
  );

  // Not expired immediately
  t.false(context.hasExpired());

  // Simulate time passing (61 seconds in future)
  const futureDate = new Date(Date.now() + 61000);
  t.true(context.hasExpired(futureDate));
});

test('should calculate remaining TTL correctly', (t) => {
  const ttl = ContextTTL.create(300); // 5 minutes
  const context = SalesforceCartContext.create('customer-123', undefined, ttl);

  const remaining = context.getRemainingTTL();

  // Should be close to 300 seconds (allowing for small execution time)
  t.true(remaining >= 299 && remaining <= 300);
});

test('should return 0 remaining TTL when expired', (t) => {
  const shortTTL = ContextTTL.create(60); // 1 minute
  const context = SalesforceCartContext.create(
    'customer-123',
    undefined,
    shortTTL
  );

  // Check after expiry
  const futureDate = new Date(Date.now() + 61000);
  const remaining = context.getRemainingTTL(futureDate);

  t.is(remaining, 0);
});

test('should mark context as expired', (t) => {
  const context = SalesforceCartContext.create('customer-123');

  t.is(context.status, ContextStatus.ACTIVE);

  context.markAsExpired();

  t.is(context.status, ContextStatus.EXPIRED);
  t.true(context.hasExpired());
  t.false(context.isActive());
});

test('should invalidate context', (t) => {
  const context = SalesforceCartContext.create('customer-123');

  context.invalidate();

  t.is(context.status, ContextStatus.INVALIDATED);
  t.false(context.isActive());
});

test('should update last accessed timestamp on touch', (t) => {
  const context = SalesforceCartContext.create('customer-123');
  const originalTimestamp = context.lastAccessedAt;

  // Wait a bit
  const delay = 50;
  setTimeout(() => {
    context.touch();
    const newTimestamp = context.lastAccessedAt;

    t.true(newTimestamp > originalTimestamp);
  }, delay);
});

test('should throw error when touching expired context', (t) => {
  const context = SalesforceCartContext.create('customer-123');

  context.markAsExpired();

  t.throws(
    () => {
      context.touch();
    },
    { message: /Cannot touch an expired or invalidated context/ }
  );
});

test('should set opportunity ID', (t) => {
  const context = SalesforceCartContext.create('customer-123');

  context.setOpportunityId('opp-789');

  t.is(context.opportunityId, 'opp-789');
});

test('should throw error when setting empty opportunity ID', (t) => {
  const context = SalesforceCartContext.create('customer-123');

  t.throws(
    () => {
      context.setOpportunityId('');
    },
    { message: /Opportunity ID cannot be empty/ }
  );
});

test('should set account ID', (t) => {
  const context = SalesforceCartContext.create('customer-123');

  context.setAccountId('acc-456');

  t.is(context.accountId, 'acc-456');
});

test('should reconstitute context from persistence', (t) => {
  const now = new Date();
  const ttl = ContextTTL.create(300);
  const contextId = 'sf_ctx_12345';

  const context = SalesforceCartContext.reconstitute(
    'id-123',
    { value: contextId } as any,
    'customer-123',
    ttl,
    ContextStatus.ACTIVE,
    now,
    now,
    now,
    'account-456',
    'opp-789'
  );

  t.is(context.id, 'id-123');
  t.is(context.customerId, 'customer-123');
  t.is(context.accountId, 'account-456');
  t.is(context.opportunityId, 'opp-789');
  t.is(context.status, ContextStatus.ACTIVE);
});
