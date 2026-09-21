export const translateErrorMessage = (englishMessage: string): string => {
  if (!englishMessage) return 'Đã có lỗi xảy ra từ máy chủ';

  const lowerMsg = englishMessage.toLowerCase();

  // Data Annotations Mapping
  if (lowerMsg.includes('email field is required')) return 'Email là bắt buộc.';
  if (lowerMsg.includes('not a valid e-mail address')) return 'Định dạng email không hợp lệ.';
  if (lowerMsg.includes('password field is required')) return 'Mật khẩu là bắt buộc.';
  if (lowerMsg.includes('minimum length of \'8\'') || lowerMsg.includes('minimum length of \'10\'')) return 'Mật khẩu phải có ít nhất 8 ký tự.';
  if (lowerMsg.includes('maximum length of \'128\'')) return 'Mật khẩu không được vượt quá 128 ký tự.';
  if (lowerMsg.includes('displayname field is required')) return 'Tên hiển thị là bắt buộc.';
  if (lowerMsg.includes('maximum length of \'120\'')) return 'Tên hiển thị không được vượt quá 120 ký tự.';

  // ASP.NET Core Identity & Auth Mapping
  if (lowerMsg.includes('invalid credentials') || lowerMsg.includes('invalid username or password')) return 'Tài khoản hoặc mật khẩu không chính xác.';
  if (lowerMsg.includes('non alphanumeric character')) return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (VD: @, #, $, ...).';
  if (lowerMsg.includes('at least one lowercase')) return 'Mật khẩu phải chứa ít nhất một chữ cái viết thường (a-z).';
  if (lowerMsg.includes('at least one uppercase')) return 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa (A-Z).';
  if (lowerMsg.includes('at least one digit')) return 'Mật khẩu phải chứa ít nhất một chữ số (0-9).';
  if (lowerMsg.includes('passwords must be at least')) return 'Mật khẩu quá ngắn.';
  if (lowerMsg.includes('is already taken')) return 'Tài khoản hoặc email đã tồn tại.';
  if (lowerMsg.includes('invalid email')) return 'Email không hợp lệ.';
  if (lowerMsg.includes('network error') || lowerMsg.includes('failed to fetch') || lowerMsg.includes('timeout')) return 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.';

  return englishMessage;
};

export function extractErrorMessage(data: any, fallbackMessage: string): string {
  if (!data) return translateErrorMessage(fallbackMessage);

  // 1. Backend ApiErrorEnvelope standard format
  if (data.error?.message) {
    return translateErrorMessage(data.error.message);
  }

  // 2. Direct message string
  if (typeof data.message === 'string' && data.message.trim()) {
    return translateErrorMessage(data.message);
  }

  // 3. ASP.NET Core ValidationProblemDetails format: { errors: { FieldName: ["Error 1", "Error 2"] } }
  if (data.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
      return translateErrorMessage(data.errors[firstKey][0]);
    }
  }

  // 4. Fallback string title
  if (typeof data.title === 'string' && data.title.trim()) {
    return translateErrorMessage(data.title);
  }

  return translateErrorMessage(fallbackMessage);
}
