import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/theme';
export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background }}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  // SECURITY: Prevent unauthorized access via deeplinks
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen name="career-goals" options={{ headerShown: false }} />
        <Stack.Screen name="career-profile" options={{ headerShown: false }} />
        <Stack.Screen name="resumes" options={{ headerShown: false }} />
        <Stack.Screen name="cv-analysis/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="interview" options={{ headerShown: false }} />
        <Stack.Screen name="scenarios" options={{ headerShown: false }} />
        <Stack.Screen name="star-builder" options={{ headerShown: false }} />
        <Stack.Screen name="growth" options={{ headerShown: false }} />
        <Stack.Screen name="pricing" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

