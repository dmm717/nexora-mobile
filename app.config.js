// Dựa vào ngày giờ để tự động tạo versionCode
// Format: YYMMDDHH (ví dụ 24110315 -> 24-11-03 15:00)
const now = new Date();
const year = now.getFullYear().toString().slice(-2);
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');
const hour = now.getHours().toString().padStart(2, '0');
const autoVersionCode = parseInt(`${year}${month}${day}${hour}`);

module.exports = ({ config }) => {
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
