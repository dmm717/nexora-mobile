import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'nexora_access_token';
const REFRESH_TOKEN_KEY = 'nexora_refresh_token';
const HIDE_POPUP_KEY = 'nexora_hide_latest_analysis_popup';

// In-memory fallback for web environment when localStorage is unavailable
const memoryStorage = new Map<string, string>();

async function getValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (key === ACCESS_TOKEN_KEY || key === REFRESH_TOKEN_KEY) {
      // SECURITY: Tokens must NOT be stored in localStorage on web to prevent XSS theft.
      return memoryStorage.get(key) ?? null;
    }
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    return null;
  }
}

async function setValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (key === ACCESS_TOKEN_KEY || key === REFRESH_TOKEN_KEY) {
      memoryStorage.set(key, value);
    } else if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
  }
}

async function deleteValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (key === ACCESS_TOKEN_KEY || key === REFRESH_TOKEN_KEY) {
      memoryStorage.delete(key);
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
  }
}

export const tokenStorage = {
  getAccessToken: () => getValue(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => setValue(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () => getValue(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => setValue(REFRESH_TOKEN_KEY, token),
  getHidePopup: () => getValue(HIDE_POPUP_KEY),
  setHidePopup: (val: string) => setValue(HIDE_POPUP_KEY, val),
  clearTokens: async () => {
    await Promise.all([
      deleteValue(ACCESS_TOKEN_KEY), 
      deleteValue(REFRESH_TOKEN_KEY),
      deleteValue(HIDE_POPUP_KEY)
    ]);
  },
};
