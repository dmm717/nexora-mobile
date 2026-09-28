import * as FileSystem from 'expo-file-system/legacy';
import { logger } from '@/services/logger';
import { Platform } from 'react-native';

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function clearOldCacheFiles() {
  if (Platform.OS === 'web') return;
  
  try {
    if (!FileSystem.cacheDirectory) return;
    
    const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      const fileUri = `${FileSystem.cacheDirectory}${file}`;
      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists && !fileInfo.isDirectory) {
          const fileAge = now - (fileInfo.modificationTime * 1000);
          if (fileAge > CACHE_MAX_AGE_MS) {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
            deletedCount++;
          }
        }
      } catch (err: any) {
        logger.warn(`Failed to process cache file: ${fileUri}`, { error: err?.message || err });
      }
    }
    
    if (deletedCount > 0) {
      logger.info(`Cleared ${deletedCount} old cache files on startup.`);
    }
  } catch (error) {
    logger.error('Failed to clear old cache files on startup', error);
  }
}
