import { Redirect } from 'expo-router';
import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/context/auth-context';
import { ActivityIndicator, View } from 'react-native';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3525CD" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <AppTabs />;
}
