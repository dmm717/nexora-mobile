import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number; // Defaults to 2500ms (2.5 seconds)
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let staticToastHandler: ((options: ToastOptions) => void) | null = null;

/** Static Toast trigger for non-React contexts (API Interceptors, Services, Global Logic) */
export const toast = {
  show: (options: ToastOptions) => {
    staticToastHandler?.(options);
  },
  success: (message: string, duration = 2500) => {
    staticToastHandler?.({ type: 'success', message, duration });
  },
  error: (message: string, duration = 2500) => {
    // Displays ONLY human-readable Vietnamese error message without raw error codes
    staticToastHandler?.({ type: 'error', message, duration });
  },
  warning: (message: string, duration = 2500) => {
    staticToastHandler?.({ type: 'warning', message, duration });
  },
  info: (message: string, duration = 2500) => {
    staticToastHandler?.({ type: 'info', message, duration });
  },
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

const TOAST_CONFIG: Record<
  ToastType,
  { icon: keyof typeof Ionicons.glyphMap; bgLight: string; borderLight: string; textLight: string }
> = {
  success: {
    icon: 'checkmark-circle',
    bgLight: '#ecfdf5',
    borderLight: '#10b981',
    textLight: '#065f46',
  },
  error: {
    icon: 'alert-circle',
    bgLight: '#fef2f2',
    borderLight: '#ef4444',
    textLight: '#991b1b',
  },
  warning: {
    icon: 'warning',
    bgLight: '#fffbeb',
    borderLight: '#f59e0b',
    textLight: '#92400e',
  },
  info: {
    icon: 'information-circle',
    bgLight: '#eff6ff',
    borderLight: '#3b82f6',
    textLight: '#1e40af',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentToast, setCurrentToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentToast(null);
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const id = Date.now();
      const duration = options.duration ?? 2500; // Auto-dismiss after 2.5s

      setCurrentToast({ ...options, id });

      timerRef.current = setTimeout(() => {
        setCurrentToast(null);
      }, duration);
  }, []);

  // Register static handler
  React.useEffect(() => {
    staticToastHandler = show;
    return () => {
      staticToastHandler = null;
    };
  }, [show]);

  const config = currentToast ? TOAST_CONFIG[currentToast.type] : TOAST_CONFIG.info;

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {currentToast && (
        <SafeAreaView style={styles.safeContainer} pointerEvents="box-none">
          <Animated.View
            entering={FadeInUp.duration(300).springify()}
            exiting={FadeOutUp.duration(200)}
            style={[
              styles.toastCard,
              {
                backgroundColor: config.bgLight,
                borderColor: config.borderLight,
              },
            ]}
          >
            <Ionicons
              name={config.icon}
              size={22}
              color={config.borderLight}
              style={{ marginRight: 10 }}
            />
            <ThemedText
              style={[
                styles.messageText,
                { color: config.textLight },
              ]}
              numberOfLines={3}
            >
              {currentToast.message}
            </ThemedText>
            <TouchableOpacity onPress={hide} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={config.textLight} />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 6,
  },
});
