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
import { 
  useFonts as useLexendFonts, 
  Lexend_400Regular, 
  Lexend_500Medium, 
  Lexend_600SemiBold, 
  Lexend_700Bold, 
  Lexend_800ExtraBold 
} from '@expo-google-fonts/lexend';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [jakartaLoaded, jakartaError] = useJakartaFonts({
    PlusJakartaSans_400Regular, 
    PlusJakartaSans_500Medium, 
    PlusJakartaSans_600SemiBold, 
    PlusJakartaSans_700Bold, 
    PlusJakartaSans_800ExtraBold,
  });
  
  const [lexendLoaded, lexendError] = useLexendFonts({
    Lexend_400Regular, 
    Lexend_500Medium, 
    Lexend_600SemiBold, 
    Lexend_700Bold, 
    Lexend_800ExtraBold,
  });

  useEffect(() => {
    if ((jakartaLoaded && lexendLoaded) || jakartaError || lexendError) {
      SplashScreen.hideAsync();
    }
  }, [jakartaLoaded, lexendLoaded, jakartaError, lexendError]);

  if (!jakartaLoaded || !lexendLoaded) {
    if (!jakartaError && !lexendError) return null;
  }

  return (
    <AppProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AppProvider>
  );
}
