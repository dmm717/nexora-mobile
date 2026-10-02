import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { setAudioModeAsync } from 'expo-audio';

import { AppProvider } from '@/providers/app-provider';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/services/logger';
import * as Sentry from '@sentry/react-native';

import { 
  useFonts as useJakartaFonts, 
  PlusJakartaSans_400Regular, 
  PlusJakartaSans_500Medium, 
  PlusJakartaSans_600SemiBold, 
  PlusJakartaSans_700Bold, 
  PlusJakartaSans_800ExtraBold 
} from '@expo-google-fonts/plus-jakarta-sans';
import Constants from 'expo-constants';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
const isExpoGo = Constants.appOwnership === 'expo';

Sentry.init({
  dsn: sentryDsn,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  enabled: !!sentryDsn,
  debug: __DEV__,
  // In Expo Go the native SDK is unavailable, so we must disable it
  // and provide a JS fetch transport. In dev/prod builds native works fine.
  enableNative: !isExpoGo,
  integrations(integrations) {
    // Remove integrations that spam logs in Expo Go
    if (isExpoGo) {
      return integrations.filter(
        (i) => i.name !== 'TouchEventBoundary' && i.name !== 'UserInteraction',
      );
    }
    return integrations;
  },
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
    // Configure audio mode globally so useAudioRecorder doesn't crash natively on iOS
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true }).catch((err) => 
      logger.warn('Failed to set global audio mode', { error: err })
    );
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
