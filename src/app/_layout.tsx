import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AppProvider } from '@/providers/app-provider';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import * as Sentry from '@sentry/react-native';

import { 
  useFonts as useJakartaFonts, 
  PlusJakartaSans_400Regular, 
  PlusJakartaSans_500Medium, 
  PlusJakartaSans_600SemiBold, 
  PlusJakartaSans_700Bold, 
  PlusJakartaSans_800ExtraBold 
} from '@expo-google-fonts/plus-jakarta-sans';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
      delete event.request.headers['Idempotency-Key'];
    }
    if (event.request?.data) {
      // Scrub request body to prevent leaking PII (passwords, emails, CVs)
      event.request.data = '[Filtered PII]';
    }
    return event;
  },
});

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [jakartaLoaded, jakartaError] = useJakartaFonts({
    PlusJakartaSans_400Regular, 
    PlusJakartaSans_500Medium, 
    PlusJakartaSans_600SemiBold, 
    PlusJakartaSans_700Bold, 
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    import('@/utils/cache').then(m => m.clearOldCacheFiles());
    if (jakartaLoaded || jakartaError) {
      SplashScreen.hideAsync();
    }
  }, [jakartaLoaded, jakartaError]);

  if (!jakartaLoaded && !jakartaError) {
    return null;
  }

  return (
    <GlobalErrorBoundary>
      <AppProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </AppProvider>
    </GlobalErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);

export { ErrorBoundary } from '@/components/ErrorBoundary';
