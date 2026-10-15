import { Platform, Linking } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.vuvietanh.nexora';
const PLAY_STORE_NATIVE_URL = 'market://details?id=com.vuvietanh.nexora';

export interface PlayUpdateInfo {
  available: boolean;
  installedVersionCode: number;
  availableVersionCode: number;
}

export function isNewerPlayUpdate(info: unknown): info is PlayUpdateInfo {
  if (!info || typeof info !== 'object') return false;
  const value = info as PlayUpdateInfo;
  return value.available === true &&
    Number.isSafeInteger(value.installedVersionCode) && value.installedVersionCode > 0 &&
    Number.isSafeInteger(value.availableVersionCode) &&
    value.availableVersionCode > value.installedVersionCode;
}

// Offline, sideloaded builds and unavailable Play services must never block use.
export async function checkForPlayUpdate(): Promise<PlayUpdateInfo | null> {
  if (Platform.OS !== 'android' || __DEV__) return null;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const native = requireOptionalNativeModule<{ checkForUpdate: () => Promise<unknown> }>('NexoraPlayUpdate');
    if (!native) return null;
    const result = await Promise.race([
      native.checkForUpdate(),
      new Promise<null>(resolve => { timeout = setTimeout(() => resolve(null), 8000); }),
    ]);
    return isNewerPlayUpdate(result) ? result : null;
  } catch {
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function openPlayStore(): Promise<void> {
  try {
    await Linking.openURL(PLAY_STORE_NATIVE_URL);
  } catch {
    await Linking.openURL(PLAY_STORE_URL);
  }
}
