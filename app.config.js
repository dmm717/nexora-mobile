// Dựa vào ngày giờ để tự động tạo versionCode
// Format: YYMMDDHH (ví dụ 24110315 -> 24-11-03 15:00)
const now = new Date();
const year = now.getFullYear().toString().slice(-2);
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');
const hour = now.getHours().toString().padStart(2, '0');
const autoVersionCode = parseInt(`${year}${month}${day}${hour}`);

module.exports = ({ config }) => {
  if (process.env.EAS_BUILD_PROFILE === 'production' || process.env.EXPO_PUBLIC_ENV === 'production') {
    if (process.env.EXPO_PUBLIC_API_URL !== 'https://api.nexorainterview.io.vn/api/v1') {
      throw new Error('Production requires EXPO_PUBLIC_API_URL=https://api.nexorainterview.io.vn/api/v1');
    }
  }

  return {
    ...config,
    android: {
      ...config.android,
      versionCode: autoVersionCode,
    },
    ios: {
      ...config.ios,
      buildNumber: autoVersionCode.toString(),
    },
  };
};
