import test from 'ava';

import { SalesforceCartContext } from '~domain/salesforce/entities/salesforce-cart-context.entity';
import { SalesforceCartClientTestDouble } from './salesforce-cart-client.test-double';

test('should create a new Salesforce context', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const context = await client.createContext('customer-123', 'account-456');

  t.truthy(context);
  t.is(context.customerId, 'customer-123');
  t.is(context.accountId, 'account-456');
  t.true(context.isActive());
  t.truthy(context.contextId);
});

test('should sync cart successfully with valid context', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  const response = await client.syncCart(context, {
    cartId: 'cart-789',
    customerId: 'customer-123',
    items: [
      {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        unitPrice: 99.99,
        currency: 'CAD',
      },
    ],
    totalAmount: 199.98,
    currency: 'CAD',
  });

  t.true(response.success);
  t.is(response.contextId, context.contextId.value);
  t.is(response.message, 'Cart synced successfully');
});

test('should fail sync with expired context', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    defaultTTL: 1, // 1 second TTL
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  // Wait for context to expire
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const response = await client.syncCart(context, {
    cartId: 'cart-789',
    customerId: 'customer-123',
    items: [
      {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 1,
        unitPrice: 50.0,
        currency: 'CAD',
      },
    ],
    totalAmount: 50.0,
    currency: 'CAD',
  });

  t.false(response.success);
  t.regex(response.message || '', /expired/i);
});

test('should fail sync with non-existent context', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const fakeContext = SalesforceCartContext.create('customer-123');

  const response = await client.syncCart(fakeContext, {
    cartId: 'cart-789',
    customerId: 'customer-123',
    items: [
      {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 1,
        unitPrice: 50.0,
        currency: 'CAD',
      },
    ],
    totalAmount: 50.0,
    currency: 'CAD',
  });

  t.false(response.success);
  t.regex(response.message || '', /not found/i);
});

test('should validate existing active context', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  const isValid = await client.validateContext(context);

  t.true(isValid);
});

test('should reject validation of expired context', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    defaultTTL: 1, // 1 second TTL
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  // Wait for expiry
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const isValid = await client.validateContext(context);

  t.false(isValid);
});

test('should refresh context successfully', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    defaultTTL: 60,
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  // Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 100));

  await client.refreshContext(context);

  // Context should still be valid
  const isValid = await client.validateContext(context);
  t.true(isValid);
});

test('should fail to refresh expired context', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    defaultTTL: 1,
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  // Wait for expiry
  await new Promise((resolve) => setTimeout(resolve, 1100));

  await t.throwsAsync(
    async () => {
      await client.refreshContext(context);
    },
    { message: /expired/ }
  );
});

test('should invalidate context successfully', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  await client.invalidateContext(context);

  const isValid = await client.validateContext(context);
  t.false(isValid);
});

test('should handle random failures when configured', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    failureRate: 1.0, // Always fail
    enableLogging: false,
  });

  await t.throwsAsync(
    async () => {
      await client.createContext('customer-123');
    },
    { message: /Failed to create Salesforce context/ }
  );
});

test('should cleanup expired contexts', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    defaultTTL: 1,
    enableLogging: false,
  });

  // Create multiple contexts
  await client.createContext('customer-1');
  await client.createContext('customer-2');
  await client.createContext('customer-3');

  let stats = client.getStats();
  t.is(stats.totalContexts, 3);

  // Wait for expiry
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const cleaned = await client.cleanupExpiredContexts();
  t.is(cleaned, 3);

  stats = client.getStats();
  t.is(stats.totalContexts, 0);
});

test('should validate cart data before sync', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  // Empty items
  const response1 = await client.syncCart(context, {
    cartId: 'cart-789',
    customerId: 'customer-123',
    items: [],
    totalAmount: 0,
    currency: 'CAD',
  });

  t.false(response1.success);
});

test('should store and retrieve cart data', async (t) => {
  const client = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const context = await client.createContext('customer-123');

  const cartData = {
    cartId: 'cart-789',
    customerId: 'customer-123',
    items: [
      {
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        unitPrice: 99.99,
        currency: 'CAD',
      },
    ],
    totalAmount: 199.98,
    currency: 'CAD',
  };

  await client.syncCart(context, cartData);

  const storedData = await client.getCartData(context.contextId.value);

  t.truthy(storedData);
  t.is(storedData?.cartId, cartData.cartId);
  t.is(storedData?.items.length, 1);
  t.is(storedData?.items[0].productId, 'prod-1');
});
