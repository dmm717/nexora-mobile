import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { View, Image, StyleSheet } from 'react-native';

export default function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('@/assets/images/logo.png')} style={styles.splashLogo} resizeMode="contain" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={"/(tabs)/home" as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Should match theme background ideally, using white for now
  },
  splashLogo: {
    width: 120,
    height: 120,
  }
});
