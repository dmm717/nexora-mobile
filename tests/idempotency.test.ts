import { createIdempotencyKey } from '../src/api/client';
import { generateIdempotencyKey } from '../src/utils/uuid';
import * as Crypto from 'expo-crypto';

describe('Idempotency Key Generator', () => {
  it('generates unique keys if unmocked (verifying mock works)', () => {
    const key1 = createIdempotencyKey();
    expect(key1).toBe('12345678-1234-1234-1234-123456789012');
  });

  it('uses expo-crypto instead of Math.random', () => {
    const key = generateIdempotencyKey();
    expect(key).toBe('12345678-1234-1234-1234-123456789012');
  });
});
