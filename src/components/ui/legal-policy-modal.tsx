/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { PRIVACY_URL } from '@/constants/legal';
import React, { useEffect, useRef, useState, memo } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  ScrollView,
  State
} from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { PrivacyPolicyContent } from './legal/PrivacyPolicyContent';
import { TermsOfServiceContent } from './legal/TermsOfServiceContent';
import { PaymentPolicyContent } from './legal/PaymentPolicyContent';
import { DataDeletionContent } from './legal/DataDeletionContent';

export type PolicyTab = 'privacy' | 'terms' | 'payment' | 'deletion';

interface LegalPolicyModalProps {
  visible: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { key: 'terms', label: 'Điều khoản' },
  { key: 'privacy', label: 'Bảo mật' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'deletion', label: 'Xóa dữ liệu' },
] as const;

export const LegalPolicyModal = memo(function LegalPolicyModal({
  visible,
  initialTab = 'terms',
  onClose,
}: LegalPolicyModalProps) {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [showModal, setShowModal] = useState(visible);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Tab & Scroll Animations
  const scrollViewRef = useRef<ScrollView>(null);
  const isSyncing = useRef(false);
  const tabIndexAnim = useRef(new Animated.Value(0)).current;
  const tabActiveAnims = useRef(TABS.map(() => new Animated.Value(0))).current;
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const prevVisible = useRef(visible);

  // Sync state during render phase to completely eliminate flicker (1-frame lag)
  if (visible && !prevVisible.current) {
    if (activeTab !== initialTab) {
      setActiveTab(initialTab);
    }
    const idx = TABS.findIndex(t => t.key === initialTab);
    if (idx !== -1) {
      tabIndexAnim.setValue(idx);
      TABS.forEach((_, i) => tabActiveAnims[i].setValue(i === idx ? 1 : 0));
    }
  }
  prevVisible.current = visible;


  useEffect(() => {
    const activeIndex = TABS.findIndex(t => t.key === activeTab);
    if (activeIndex === -1) return;

    // Slide indicator
    Animated.spring(tabIndexAnim, {
      toValue: activeIndex,
      friction: 12,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Color fade
    TABS.forEach((_, i) => {
      Animated.timing(tabActiveAnims[i], {
        toValue: i === activeIndex ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    // Content swipe sync
    if (!isSyncing.current && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: activeIndex * SCREEN_WIDTH, animated: true });
    }
  }, [activeTab]);

  const onTabLayout = (index: number, e: any) => {
    const layout = e.nativeEvent.layout;
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { x: layout.x, width: layout.width };
      return newLayouts;
    });
  };

  const hasAllLayouts = tabLayouts.length === TABS.length && tabLayouts.every(l => l !== undefined);
  const activeWidth = TABS.findIndex(t => t.key === activeTab) !== -1
    ? tabLayouts[TABS.findIndex(t => t.key === activeTab)]?.width || 0
    : 0;

  const indicatorLeft = tabIndexAnim.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => tabLayouts[i]?.x || 0),
  });

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: slideAnim } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (event.nativeEvent.translationY > SCREEN_HEIGHT * 0.15 || event.nativeEvent.velocityY > 800) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 12,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 12,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible, fadeAnim, slideAnim]);

  const openWebUrl = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      await Linking.openURL(url);
    }
  };

  return (
    <Modal
      visible={showModal}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.backdrop}>
          <Animated.View
            style={[
              styles.backdropTouch,
              { opacity: fadeAnim, backgroundColor: 'rgba(0, 0, 0, 0.4)' }
            ]}
          >
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
          </Animated.View>

          <PanGestureHandler
            activeOffsetY={[-10, 10]}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  backgroundColor: colors.background,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [0, 0, 1],
                    })
                  }]
                }
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View>
                  <ThemedText style={styles.headerTitle}>Pháp lý & điều khoản</ThemedText>
                </View>
                <View style={styles.headerActions}>
                  {activeTab === 'privacy' && <TouchableOpacity
                    accessibilityLabel="Mở chính sách bảo mật trên website Nexora"
                    onPress={() => openWebUrl(PRIVACY_URL)}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="open-outline" size={22} color={colors.text} />
                  </TouchableOpacity>}
                  <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Minimalist Tab Navigation */}
              <View style={[styles.tabBarWrapper, { borderBottomColor: colors.cardBorder }]}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tabBarContent}
                >
                  {TABS.map((tab, i) => {
                    const textColor = tabActiveAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [colors.textMuted, colors.primary],
                    });
                    const isActive = activeTab === tab.key;

                    return (
                      <TouchableOpacity
                        key={tab.key}
                        style={styles.tabItem}
                        onLayout={(e) => onTabLayout(i, e)}
                        onPress={() => setActiveTab(tab.key)}
                        activeOpacity={0.7}
                      >
                        <Animated.Text
                          style={[
                            { fontSize: 16, lineHeight: 24 },
                            styles.tabText,
                            {
                              color: textColor,
                              fontFamily: isActive ? Typography.fontFamily.bold : Typography.fontFamily.medium
                            },
                          ]}
                        >
                          {tab.label}
                        </Animated.Text>
                      </TouchableOpacity>
                    );
                  })}
                  {hasAllLayouts && (
                    <Animated.View
                      style={[
                        styles.activeIndicator,
                        {
                          backgroundColor: colors.primary,
                          transform: [{ translateX: indicatorLeft }],
                          width: activeWidth,
                        }
                      ]}
                    />
                  )}
                </ScrollView>
              </View>

              {/* Document Content */}
              <View style={{ flex: 1 }}>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  bounces={false}
                  onLayout={() => {
                    const idx = Math.max(0, TABS.findIndex(t => t.key === initialTab));
                    if (idx > 0 && scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({ x: idx * SCREEN_WIDTH, animated: false });
                    }
                  }}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    const newTab = TABS[index]?.key;
                    if (newTab && newTab !== activeTab) {
                      isSyncing.current = true;
                      setActiveTab(newTab);
                      setTimeout(() => { isSyncing.current = false; }, 50);
                    }
                  }}
                >
                  {TABS.map(tab => (
                    <View style={{ width: SCREEN_WIDTH }} key={tab.key}>
                      <ScrollView
                        style={styles.scrollContent}
                        contentContainerStyle={styles.scrollInner}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        nestedScrollEnabled={true}
                        bounces={false}
                        overScrollMode="never"
                      >
                        {tab.key === 'privacy' && <PrivacyPolicyContent colors={colors} styles={styles} />}
                        {tab.key === 'terms' && <TermsOfServiceContent colors={colors} styles={styles} />}
                        {tab.key === 'payment' && <PaymentPolicyContent colors={colors} styles={styles} />}
                        {tab.key === 'deletion' && <DataDeletionContent colors={colors} styles={styles} />}

                        {tab.key === 'privacy' && <View style={styles.footerRow}>
                          <TouchableOpacity
                            onPress={() => openWebUrl(PRIVACY_URL)}
                            style={styles.webLinkTextContainer}
                          >
                            <ThemedText style={[styles.webLinkText, { color: colors.primary }]}>
                              Chính sách bảo mật trên website Nexora
                            </ThemedText>
                            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                          </TouchableOpacity>
                        </View>}
                      </ScrollView>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomSheet: {
    height: SCREEN_HEIGHT * 0.6, // 60% height for better one-handed reach while leaving top space
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...(Platform.select({
      web: { boxShadow: '0px -10px 40px rgba(0, 0, 0, 0.15)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
      },
    }) as any),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.extrabold,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarWrapper: {
    borderBottomWidth: 1,
    marginBottom: Spacing.one,
  },
  tabBarContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  tabItem: {
    paddingVertical: Spacing.two,
    position: 'relative',
    marginRight: Spacing.one,
  },
  tabText: {
    letterSpacing: -0.2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    borderRadius: 2,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: Spacing.four,
    paddingBottom: 64, // Safe space at bottom
  },
  docSection: {
    gap: Spacing.four,
  },
  docMeta: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.two,
  },
  contentBlock: {
    marginBottom: Spacing.four,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  sectionNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionNumber: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
  },
  sectionHeading: {
    flex: 1,
    fontSize: 17,
    fontFamily: Typography.fontFamily.bold,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Typography.fontFamily.regular,
  },
  bulletList: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingLeft: Spacing.two,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Typography.fontFamily.regular,
  },
  footerRow: {
    marginTop: Spacing.six,
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  webLinkTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  webLinkText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.semibold,
  },
});

