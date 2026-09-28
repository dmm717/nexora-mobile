import * as Crypto from 'expo-crypto';

export const generateIdempotencyKey = (): string => {
  if (typeof Crypto.randomUUID === 'function') {
    return Crypto.randomUUID();
  }
  
  // Fallback if randomUUID is not available in the current environment
  const bytes = Crypto.getRandomBytes(16);
  // Set version (4) and variant (8, 9, a, or b) for UUIDv4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
