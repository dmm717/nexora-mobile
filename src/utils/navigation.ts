import { useRouter } from 'expo-router';

type RouterType = ReturnType<typeof useRouter>;

/**
 * Safely navigates back if stack history exists; otherwise falls back to a default route.
 * Prevents "The action 'GO_BACK' was not handled by any navigator" error on direct page reloads/deep links.
 */
export function safeBack(router: RouterType, fallbackPath: string = '/(tabs)/practice') {
  try {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackPath as any);
    }
  } catch {
    router.replace(fallbackPath as any);
  }
}
