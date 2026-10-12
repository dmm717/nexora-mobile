// Preserve the existing iOS build-number strategy; Android uses app.json.
// Existing iOS build number format: YYMMDDHH.
const now = new Date();
const year = now.getFullYear().toString().slice(-2);
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');
const hour = now.getHours().toString().padStart(2, '0');
const autoVersionCode = parseInt(`${year}${month}${day}${hour}`);

module.exports = ({ config }) => {
  if (!Number.isInteger(config.android.versionCode) || config.android.versionCode < 1 || config.android.versionCode > 2100000000) {
    throw new Error('android.versionCode must be an integer between 1 and 2100000000');
  }
  if (process.env.EAS_BUILD_PROFILE === 'production' || process.env.EXPO_PUBLIC_ENV === 'production') {
    if (process.env.EXPO_PUBLIC_API_URL !== 'https://api.nexorainterview.io.vn/api/v1') {
      throw new Error('Production requires EXPO_PUBLIC_API_URL=https://api.nexorainterview.io.vn/api/v1');
    }
  }

  return {
    ...config,
    android: {
      ...config.android,
      versionCode: config.android.versionCode,
    },
    ios: {
      ...config.ios,
      buildNumber: autoVersionCode.toString(),
    },
  };
};
