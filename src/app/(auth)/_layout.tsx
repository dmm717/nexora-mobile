import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/theme';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background }}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  // SECURITY: Prevent authenticated users from accessing auth screens via deeplinks
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
