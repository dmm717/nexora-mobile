import { extractErrorMessage, getUserErrorMessage, UserFacingError } from '../src/utils/errorTranslator';

describe('user-facing error boundary', () => {
  const secret = 'NpgsqlException SQL SELECT password_hash FROM users; https://private.example/token?secret=abc';
  it.each([
    new Error(secret),
    { code: 'UNEXPECTED_PROVIDER_FAILURE', message: secret },
    { code: 'constructor', message: secret },
    { response: { data: { error: { message: secret } } }, message: secret },
    { message: 'Lỗi nội bộ: ' + secret },
  ])('never displays arbitrary error text: %p', error => {
    expect(getUserErrorMessage(error, 'Không thể tải CV. Vui lòng thử lại.'))
      .toBe('Không thể tải CV. Vui lòng thử lại.');
  });
  it('maps a known code without including its raw message or code', () => {
    expect(getUserErrorMessage({ code: 'INVALID_CREDENTIALS', message: secret }))
      .toBe('Tài khoản hoặc mật khẩu không chính xác.');
  });
  it.each([
    { error: { code: 'UNKNOWN', message: secret } },
    { error: { message: 'Lỗi hệ thống: ' + secret } },
    { message: secret },
    { errors: { Password: [secret] } },
    { title: secret },
  ])('does not forward server/provider response text: %p', payload => {
    const display = extractErrorMessage(payload, 'Request failed with status code 500');
    expect(display).not.toContain('SQL');
    expect(display).not.toContain('private.example');
    expect(display).not.toContain('abc');
  });
  it('retains deliberately authored local validation help', () => {
    expect(getUserErrorMessage(new UserFacingError('Vui lòng chọn CV trước khi tiếp tục.')))
      .toBe('Vui lòng chọn CV trước khi tiếp tục.');
  });
});
