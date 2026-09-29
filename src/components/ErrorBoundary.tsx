import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView , Alert } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { logger } from '@/services/logger';
import { useRouter } from 'expo-router';
import { toast } from '@/components/ui/toast/ToastProvider';

export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Global React Crash', error, { errorInfo });
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorBoundary error={this.state.error} retry={this.retry} />;
    }
    return this.props.children;
  }
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const router = useRouter();

  const handleReport = () => {
    logger.error('App Crashed (User Reported)', error);
    toast.success('Cảm ơn bạn đã thông báo sự cố cho chúng tôi.');
  };

  const handleGoHome = () => {
    retry();
    router.replace('/(tabs)/home' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        
        <Text style={styles.title}>Đã xảy ra sự cố không mong muốn</Text>
        
        <Text style={styles.description}>
          Xin lỗi, ứng dụng Nexora vừa gặp lỗi và không thể tiếp tục. Chúng tôi đã ghi nhận sự cố này.
        </Text>

        {__DEV__ && (
          <View style={styles.devErrorBox}>
            <Text style={styles.devErrorText}>{error.message}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={retry}>
            <Text style={styles.primaryButtonText}>Thử lại ngay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleGoHome}>
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.textButton]} onPress={handleReport}>
            <Text style={styles.textButtonText}>Báo cáo sự cố</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.six,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  description: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.six,
    lineHeight: 24,
  },
  devErrorBox: {
    backgroundColor: '#333',
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.six,
    width: '100%',
  },
  devErrorText: {
    color: '#ff6b6b',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.three,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
  },
  primaryButtonText: {
    color: Colors.dark.background,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.md,
  },
  secondaryButton: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  secondaryButtonText: {
    color: Colors.dark.text,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.md,
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  textButtonText: {
    color: Colors.dark.textMuted,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
  },
});
