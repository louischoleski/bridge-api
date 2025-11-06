import test from 'ava';

import {
  CartAggregate,
  CartStatus,
} from '~domain/cart/aggregates/cart.aggregate';
import {
  BusinessRuleViolationException,
  InvalidOperationException,
} from '~domain/shared/exceptions/domain.exception';
import { Money } from '~domain/shared/value-objects/money.vo';

test('should create a new cart', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');

  t.is(cart.customerId, 'customer-123');
  t.is(cart.currency, 'CAD');
  t.is(cart.status, CartStatus.ACTIVE);
  t.is(cart.items.length, 0);
  t.true(cart.isEmpty());
});

test('should add item to cart', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');
  const price = Money.create(99.99, 'CAD');

  cart.addItem('product-1', 'Test Product', 2, price);

  t.is(cart.items.length, 1);
  t.is(cart.items[0].productId, 'product-1');
  t.is(cart.items[0].quantity.value, 2);
  t.false(cart.isEmpty());
});

test('should increase quantity when adding existing item', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');
  const price = Money.create(99.99, 'CAD');

  cart.addItem('product-1', 'Test Product', 2, price);
  cart.addItem('product-1', 'Test Product', 3, price);

  t.is(cart.items.length, 1);
  t.is(cart.items[0].quantity.value, 5);
});

test('should remove item from cart', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');
  const price = Money.create(99.99, 'CAD');

  cart.addItem('product-1', 'Test Product', 2, price);
  cart.removeItem('product-1');

  t.is(cart.items.length, 0);
  t.true(cart.isEmpty());
});

test('should calculate total amount correctly', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');
  const price1 = Money.create(99.99, 'CAD');
  const price2 = Money.create(49.99, 'CAD');

  cart.addItem('product-1', 'Product 1', 2, price1); // 199.98
  cart.addItem('product-2', 'Product 2', 1, price2); // 49.99

  const total = cart.getTotalAmount();
  t.is(total.amount, 249.97);
});

test('should checkout cart', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');
  const price = Money.create(99.99, 'CAD');

  cart.addItem('product-1', 'Test Product', 1, price);
  cart.checkout();

  t.is(cart.status, CartStatus.CHECKED_OUT);
});

test('should not checkout empty cart', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');

  const error = t.throws(
    () => {
      cart.checkout();
    },
    { instanceOf: BusinessRuleViolationException }
  );

  t.is(error?.message, 'Cannot checkout empty cart');
});

test('should not modify cart after checkout', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');
  const price = Money.create(99.99, 'CAD');

  cart.addItem('product-1', 'Test Product', 1, price);
  cart.checkout();

  const error = t.throws(
    () => {
      cart.addItem('product-2', 'Product 2', 1, price);
    },
    { instanceOf: InvalidOperationException }
  );

  t.truthy(error);
});

test('should emit domain events', (t) => {
  const cart = CartAggregate.create('customer-123', 'CAD');
  const price = Money.create(99.99, 'CAD');

  cart.addItem('product-1', 'Test Product', 1, price);

  const events = cart.getDomainEvents();
  t.is(events.length, 2); // CartCreated + ItemAdded
  t.is(events[0].eventType, 'CartCreated');
  t.is(events[1].eventType, 'ItemAdded');
});
