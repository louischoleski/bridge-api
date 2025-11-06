import test from 'ava';

import { CartAggregate } from '~domain/cart/aggregates/cart.aggregate';
import { Money } from '~domain/shared/value-objects/money.vo';
import { CartRepository } from '~infrastructure/persistence/repositories/cart.repository';
import { SalesforceContextRepository } from '~infrastructure/persistence/repositories/salesforce-context.repository';
import { SalesforceCartClientTestDouble } from '~infrastructure/external/salesforce/salesforce-cart-client.test-double';
import { SyncCartToSalesforceUseCase } from './sync-cart-to-salesforce.use-case';

test('should sync cart to Salesforce with new context', async (t) => {
  const cartRepo = new CartRepository();
  const sfContextRepo = new SalesforceContextRepository();
  const sfService = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const useCase = new SyncCartToSalesforceUseCase(
    cartRepo,
    sfContextRepo,
    sfService
  );

  // Create a cart with items
  const cart = CartAggregate.create('customer-123');
  cart.addItem(
    'prod-1',
    'Product 1',
    2,
    Money.create(99.99, 'CAD')
  );
  await cartRepo.save(cart);

  // Execute sync
  const result = await useCase.execute({
    cartId: cart.id,
    customerId: 'customer-123',
    accountId: 'account-456',
  });

  t.true(result.success);
  t.truthy(result.contextId);

  // Verify context was created
  const context = await sfContextRepo.findActiveByCustomerId('customer-123');
  t.truthy(context);
  t.is(context?.accountId, 'account-456');
});

test('should reuse existing active context', async (t) => {
  const cartRepo = new CartRepository();
  const sfContextRepo = new SalesforceContextRepository();
  const sfService = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const useCase = new SyncCartToSalesforceUseCase(
    cartRepo,
    sfContextRepo,
    sfService
  );

  // Create initial context
  const initialContext = await sfService.createContext('customer-123');
  await sfContextRepo.save(initialContext);

  // Create a cart
  const cart = CartAggregate.create('customer-123');
  cart.addItem('prod-1', 'Product 1', 1, Money.create(50, 'CAD'));
  await cartRepo.save(cart);

  // Execute sync
  const result = await useCase.execute({
    cartId: cart.id,
    customerId: 'customer-123',
  });

  t.true(result.success);
  t.is(result.contextId, initialContext.contextId.value);
});

test('should create new context when existing one is expired', async (t) => {
  const cartRepo = new CartRepository();
  const sfContextRepo = new SalesforceContextRepository();
  const sfService = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    defaultTTL: 1, // 1 second TTL
    enableLogging: false,
  });

  const useCase = new SyncCartToSalesforceUseCase(
    cartRepo,
    sfContextRepo,
    sfService
  );

  // Create expired context
  const expiredContext = await sfService.createContext('customer-123');
  await sfContextRepo.save(expiredContext);

  // Wait for expiry
  await new Promise((resolve) => setTimeout(resolve, 1100));

  // Create a cart
  const cart = CartAggregate.create('customer-123');
  cart.addItem('prod-1', 'Product 1', 1, Money.create(50, 'CAD'));
  await cartRepo.save(cart);

  // Execute sync
  const result = await useCase.execute({
    cartId: cart.id,
    customerId: 'customer-123',
  });

  t.true(result.success);
  t.not(result.contextId, expiredContext.contextId.value);
});

test('should throw error when cart not found', async (t) => {
  const cartRepo = new CartRepository();
  const sfContextRepo = new SalesforceContextRepository();
  const sfService = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const useCase = new SyncCartToSalesforceUseCase(
    cartRepo,
    sfContextRepo,
    sfService
  );

  await t.throwsAsync(
    async () => {
      await useCase.execute({
        cartId: 'non-existent-cart',
        customerId: 'customer-123',
      });
    },
    { message: /not found/ }
  );
});

test('should throw error when cart is empty', async (t) => {
  const cartRepo = new CartRepository();
  const sfContextRepo = new SalesforceContextRepository();
  const sfService = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const useCase = new SyncCartToSalesforceUseCase(
    cartRepo,
    sfContextRepo,
    sfService
  );

  // Create empty cart
  const cart = CartAggregate.create('customer-123');
  await cartRepo.save(cart);

  await t.throwsAsync(
    async () => {
      await useCase.execute({
        cartId: cart.id,
        customerId: 'customer-123',
      });
    },
    { message: /empty cart/ }
  );
});

test('should throw error when cart belongs to different customer', async (t) => {
  const cartRepo = new CartRepository();
  const sfContextRepo = new SalesforceContextRepository();
  const sfService = new SalesforceCartClientTestDouble({
    networkLatency: 0,
    enableLogging: false,
  });

  const useCase = new SyncCartToSalesforceUseCase(
    cartRepo,
    sfContextRepo,
    sfService
  );

  // Create cart for customer-123
  const cart = CartAggregate.create('customer-123');
  cart.addItem('prod-1', 'Product 1', 1, Money.create(50, 'CAD'));
  await cartRepo.save(cart);

  // Try to sync with different customer
  await t.throwsAsync(
    async () => {
      await useCase.execute({
        cartId: cart.id,
        customerId: 'customer-456', // Different customer!
      });
    },
    { message: /does not belong/ }
  );
});
