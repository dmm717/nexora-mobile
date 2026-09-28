export const validatePassword = (pass: string) => {
  if (pass.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (!/[A-Z]/.test(pass)) return 'Mật khẩu phải chứa ít nhất một chữ viết hoa';
  if (!/[a-z]/.test(pass)) return 'Mật khẩu phải chứa ít nhất một chữ viết thường';
  if (!/[0-9]/.test(pass)) return 'Mật khẩu phải chứa ít nhất một chữ số';
  if (!/[^a-zA-Z0-9]/.test(pass)) return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
  return null;
};

export const validateEmail = (emailStr: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailStr)) {
    return 'Vui lòng nhập định dạng email hợp lệ';
  }
  return null;
};
