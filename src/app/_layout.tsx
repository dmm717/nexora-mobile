import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AppProvider } from '@/providers/app-provider';
import { 
  useFonts as useJakartaFonts, 
  PlusJakartaSans_400Regular, 
  PlusJakartaSans_500Medium, 
  PlusJakartaSans_600SemiBold, 
  PlusJakartaSans_700Bold, 
  PlusJakartaSans_800ExtraBold 
} from '@expo-google-fonts/plus-jakarta-sans';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [jakartaLoaded, jakartaError] = useJakartaFonts({
    PlusJakartaSans_400Regular, 
    PlusJakartaSans_500Medium, 
    PlusJakartaSans_600SemiBold, 
    PlusJakartaSans_700Bold, 
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (jakartaLoaded || jakartaError) {
      SplashScreen.hideAsync();
    }
  }, [jakartaLoaded, jakartaError]);

  if (!jakartaLoaded && !jakartaError) {
    return null;
  }

  return (
    <AppProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AppProvider>
  );
}
