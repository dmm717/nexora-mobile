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

  // Prevent raw backend messages from leaking to UI if not explicitly mapped
  return 'Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
};

const USER_ERRORS: Record<string, string> = {
  EMAIL_NOT_VERIFIED: 'Bạn cần xác minh email trước khi đăng nhập.',
  USER_UNVERIFIED: 'Bạn cần xác minh email trước khi đăng nhập.',
  EMAIL_ALREADY_REGISTERED: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc khôi phục mật khẩu.',
  RATE_LIMITED: 'Bạn thao tác quá nhanh. Vui lòng đợi một lúc rồi thử lại.',
  INVALID_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  UNAUTHENTICATED: 'Bạn cần đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn chưa có quyền sử dụng chức năng này.',
  NOT_FOUND: 'Không tìm thấy nội dung. Vui lòng tải lại và thử lại.',
  RESOURCE_NOT_FOUND: 'Nội dung không còn khả dụng. Vui lòng tải lại.',
  INCORRECT_CURRENT_PASSWORD: 'Mật khẩu hiện tại không chính xác.',
  EMAIL_VERIFICATION_INVALID: 'Liên kết xác minh không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.',
  PASSWORD_RESET_INVALID: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.',
  FEATURE_QUOTA_EXCEEDED: 'Bạn đã sử dụng hết lượt của chức năng này trong gói hiện tại.',
  QUOTA_EXCEEDED: 'Bạn đã sử dụng hết lượt trong gói hiện tại.',
  FEATURE_NOT_AVAILABLE: 'Chức năng này chưa có trong gói hiện tại của bạn.',
  RESUME_NOT_READY: 'CV đang được xử lý. Vui lòng đợi một lúc rồi thử lại.',
  RESUME_ANALYSIS_CONTEXT_INVALID: 'Thông tin phân tích chưa đầy đủ. Vui lòng kiểm tra CV và mục tiêu nghề nghiệp.',
  ACTIVE_CAREER_GOAL_REQUIRED: 'Vui lòng thiết lập mục tiêu nghề nghiệp trước khi tiếp tục.',
  INTERVIEW_REPORT_PROCESSING: 'Báo cáo đang được xử lý. Vui lòng đợi một lúc.',
  INTERVIEW_REPORT_FAILED: 'Chưa thể tạo báo cáo. Vui lòng thử lại.',
  INTERVIEW_REPORT_UNAVAILABLE: 'Báo cáo chưa khả dụng. Vui lòng thử lại sau.',
};

// Only local, deliberately authored validation messages may bypass the code map.
export class UserFacingError extends Error {}

export function getUserErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (error instanceof UserFacingError) return error.message;
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return translateErrorCode(error.code) ?? fallback;
  }
  return fallback;
}

export const translateErrorCode = (code: string): string | null => {
  if (Object.prototype.hasOwnProperty.call(USER_ERRORS, code)) return USER_ERRORS[code];
  switch (code) {
    case 'UNAUTHORIZED':
    case 'INVALID_CREDENTIALS':
      return 'Tài khoản hoặc mật khẩu không chính xác.';
    case 'USER_NOT_FOUND':
      return 'Tài khoản không tồn tại.';
    case 'EMAIL_EXISTS':
      return 'Email đã được sử dụng.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Bạn thao tác quá nhanh, vui lòng thử lại sau.';
    case 'CV_UPLOAD_FAILED':
    case 'FILE_TOO_LARGE':
      return 'File quá lớn hoặc không hợp lệ.';
    case 'INTERNAL_SERVER_ERROR':
    case 'DATABASE_ERROR':
      return 'Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
    default:
      return null;
  }
};

export function extractErrorMessage(data: any, fallbackMessage: string): string {
  if (!data) return translateErrorMessage(fallbackMessage);

  // 1. Backend ApiErrorEnvelope standard format - map by error.code if available
  if (data.error) {
    if (data.error.code) {
      const codeMsg = translateErrorCode(data.error.code);
      if (codeMsg) return codeMsg;
    }
    // Backend/provider messages are untrusted display text, even if Vietnamese.
    return translateErrorMessage(fallbackMessage);
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
