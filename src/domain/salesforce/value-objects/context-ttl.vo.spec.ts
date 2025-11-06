import test from 'ava';

import { ContextTTL } from './context-ttl.vo';

test('should create ContextTTL with default value', (t) => {
  const ttl = ContextTTL.create();

  t.is(ttl.seconds, ContextTTL.DEFAULT_TTL_SECONDS);
  t.is(ttl.milliseconds, ContextTTL.DEFAULT_TTL_SECONDS * 1000);
});

test('should create ContextTTL with custom value', (t) => {
  const ttl = ContextTTL.create(300);

  t.is(ttl.seconds, 300);
  t.is(ttl.milliseconds, 300000);
});

test('should throw error for TTL below minimum', (t) => {
  t.throws(
    () => {
      ContextTTL.create(30); // Below MIN_TTL_SECONDS (60)
    },
    { message: /must be between/ }
  );
});

test('should throw error for TTL above maximum', (t) => {
  t.throws(
    () => {
      ContextTTL.create(10000); // Above MAX_TTL_SECONDS (7200)
    },
    { message: /must be between/ }
  );
});

test('should correctly determine if TTL has expired', (t) => {
  const ttl = ContextTTL.create(60); // 1 minute
  const createdAt = new Date('2024-01-01T10:00:00Z');

  // Not expired after 30 seconds
  const now1 = new Date('2024-01-01T10:00:30Z');
  t.false(ttl.hasExpired(createdAt, now1));

  // Expired after 61 seconds
  const now2 = new Date('2024-01-01T10:01:01Z');
  t.true(ttl.hasExpired(createdAt, now2));

  // Exactly at expiry (edge case)
  const now3 = new Date('2024-01-01T10:01:00Z');
  t.true(ttl.hasExpired(createdAt, now3));
});

test('should calculate expiration date correctly', (t) => {
  const ttl = ContextTTL.create(300); // 5 minutes
  const createdAt = new Date('2024-01-01T10:00:00Z');

  const expiresAt = ttl.getExpiresAt(createdAt);

  t.is(expiresAt.toISOString(), '2024-01-01T10:05:00.000Z');
});

test('should calculate remaining seconds correctly', (t) => {
  const ttl = ContextTTL.create(300); // 5 minutes
  const createdAt = new Date('2024-01-01T10:00:00Z');

  // After 2 minutes, should have 3 minutes (180 seconds) remaining
  const now = new Date('2024-01-01T10:02:00Z');
  const remaining = ttl.getRemainingSeconds(createdAt, now);

  t.is(remaining, 180);
});

test('should return 0 remaining seconds when expired', (t) => {
  const ttl = ContextTTL.create(60); // 1 minute
  const createdAt = new Date('2024-01-01T10:00:00Z');

  // After 2 minutes (expired)
  const now = new Date('2024-01-01T10:02:00Z');
  const remaining = ttl.getRemainingSeconds(createdAt, now);

  t.is(remaining, 0);
});

test('should handle fractional seconds correctly', (t) => {
  const ttl = ContextTTL.create(60);
  const createdAt = new Date('2024-01-01T10:00:00.000Z');

  // After 30.7 seconds
  const now = new Date('2024-01-01T10:00:30.700Z');
  const remaining = ttl.getRemainingSeconds(createdAt, now);

  // Should floor to 29 seconds
  t.is(remaining, 29);
});
