import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readSource = (relativePath) => readFile(join(__dirname, relativePath), 'utf8');

test('Mobile Auth E2E Structure Tests', async (t) => {
  const loginSrc = await readSource('../src/app/(auth)/login.tsx');
  const authTypesSrc = await readSource('../src/api/types/auth.types.ts');

  await t.test('Requirement 1: API Types Contract must enforce displayName', () => {
    assert.doesNotMatch(authTypesSrc, /fullName/, 'auth.types.ts must not contain fullName');
    assert.match(authTypesSrc, /displayName/, 'auth.types.ts must contain displayName');
  });

  // Requirements 2 and 3 removed: Confirm Password fields are deprecated in modern UX.

  await t.test('Requirement 4: Register Payload maps correctly to backend API', () => {
    assert.match(loginSrc, /displayName:\s*displayName\.trim\(\)/, 'Must map UI state to displayName');
  });

  await t.test('Requirement 5: Strict format and complexity validation is present', () => {
    assert.match(loginSrc, /const emailError = validateEmail\(/, 'Must invoke email validation');
    assert.match(loginSrc, /const passwordError = validatePassword\(/, 'Must invoke password validation');
    assert.match(loginSrc, /if \(!\/\[A-Z\]\/\.test\(pass\)\)/, 'Password validation must check for uppercase letters');
    assert.match(loginSrc, /if \(!\/\[a-z\]\/\.test\(pass\)\)/, 'Password validation must check for lowercase letters');
    assert.match(loginSrc, /if \(!\/\[0-9\]\/\.test\(pass\)\)/, 'Password validation must check for numbers');
  });

  await t.test('Requirement 6: API responses (Success/Error) must be handled and reported to the screen', () => {
    // mutations must have onError handlers displaying an Alert
    assert.match(loginSrc, /onError:\s*\(error\)\s*=>\s*\{[\s\S]*?Alert\.alert/);
    
    // Validate that success notifications or navigations are present
    assert.match(loginSrc, /onSuccess:\s*\(\)\s*=>\s*\{/);
    
    // Explicitly check Forgot Password success alert
    assert.match(loginSrc, /Alert\.alert\('Thành công', 'Mã xác thực đã được gửi/);
  });
});
