import { extractErrorMessage, translateErrorCode, translateErrorMessage } from '../src/utils/errorTranslator';

describe('errorTranslator', () => {
  it('translates known error messages safely', () => {
    const translated = translateErrorMessage('Invalid credentials');
    expect(translated).toBe('Tài khoản hoặc mật khẩu không chính xác.');
  });

  it('translates known error codes', () => {
    const errorObj = {
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Some unmapped message'
      }
    };
    const translated = extractErrorMessage(errorObj, 'fallback');
    expect(translated).toBe('Tài khoản hoặc mật khẩu không chính xác.');
  });

  it('translates validation errors using field names', () => {
    const errorObj = {
      errors: {
        Password: ['Passwords must be at least 8 characters.']
      }
    };
    const translated = extractErrorMessage(errorObj, 'fallback');
    expect(translated).toBe('Mật khẩu quá ngắn.');
  });
});
