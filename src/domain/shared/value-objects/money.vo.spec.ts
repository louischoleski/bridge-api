import test from 'ava';

import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { Money } from '~domain/shared/value-objects/money.vo';

test('should create money value object', (t) => {
  const money = Money.create(100, 'CAD');

  t.is(money.amount, 100);
  t.is(money.currency, 'CAD');
});

test('should not create money with negative amount', (t) => {
  const error = t.throws(
    () => {
      Money.create(-100, 'CAD');
    },
    { instanceOf: ValidationException }
  );

  t.is(error?.message, 'Amount cannot be negative');
});

test('should add two money values', (t) => {
  const money1 = Money.create(100, 'CAD');
  const money2 = Money.create(50, 'CAD');

  const result = money1.add(money2);

  t.is(result.amount, 150);
  t.is(result.currency, 'CAD');
});

test('should subtract two money values', (t) => {
  const money1 = Money.create(100, 'CAD');
  const money2 = Money.create(30, 'CAD');

  const result = money1.subtract(money2);

  t.is(result.amount, 70);
  t.is(result.currency, 'CAD');
});

test('should multiply money by factor', (t) => {
  const money = Money.create(50, 'CAD');

  const result = money.multiply(3);

  t.is(result.amount, 150);
});

test('should not operate on different currencies', (t) => {
  const money1 = Money.create(100, 'CAD');
  const money2 = Money.create(50, 'EUR');

  const error = t.throws(
    () => {
      money1.add(money2);
    },
    { instanceOf: ValidationException }
  );

  t.truthy(error?.message.includes('different currencies'));
});

test('should compare money values', (t) => {
  const money1 = Money.create(100, 'CAD');
  const money2 = Money.create(50, 'CAD');

  t.true(money1.greaterThan(money2));
  t.false(money1.lessThan(money2));
});

test('should format money as string', (t) => {
  const money = Money.create(99.99, 'CAD');

  t.is(money.toString(), '99.99 CAD');
});
