import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
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

  const renderBullet = (text: string) => (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: colors.textSecondary }]} />
      <ThemedText style={[styles.bulletText, { color: colors.textSecondary }]}>{text}</ThemedText>
    </View>
  );

  const renderSectionHeader = (number: string, title: string) => (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionNumberBadge, { backgroundColor: colors.primary + '15' }]}>
        <ThemedText style={[styles.sectionNumber, { color: colors.primary }]}>{number}</ThemedText>
      </View>
      <ThemedText style={styles.sectionHeading}>{title}</ThemedText>
    </View>
  );

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
                  <TouchableOpacity
                    onPress={() => openWebUrl('https://nexora.vn/privacy')}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="open-outline" size={22} color={colors.text} />
                  </TouchableOpacity>
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
                        {tab.key === 'privacy' && (
                          <View style={styles.docSection}>
                            <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Cập nhật lần cuối: 25.09.2026</ThemedText>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('1', 'Thu thập dữ liệu')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Nexora AI cam kết bảo vệ thông tin riêng tư của ứng viên. Chúng tôi thu thập các dữ liệu cần thiết để phục vụ trải nghiệm luyện phỏng vấn:
                              </ThemedText>
                              <View style={styles.bulletList}>
                                {renderBullet('Thông tin tài khoản: Email, tên hiển thị, mật khẩu được mã hóa qua ASP.NET Core Identity.')}
                                {renderBullet('Hồ sơ nghề nghiệp: Nội dung CV, Mô tả công việc (JD), lịch sử các buổi phỏng vấn thử.')}
                                {renderBullet('Giọng nói & Âm thanh: Dữ liệu ghi âm giọng nói khi thực hiện phỏng vấn (chỉ dùng cho chuyển đổi văn bản và phân tích giọng nói).')}
                              </View>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('2', 'Sử dụng & bảo mật dữ liệu AI')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Tất cả dữ liệu câu trả lời và thông tin hồ sơ được truyền qua kết nối mã hóa TLS/HTTPS tới hệ thống backend. Nexora không bao giờ chia sẻ hoặc bán dữ liệu cá nhân của ứng viên cho bên thứ ba vì mục đích quảng cáo.
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('3', 'Quyền của ứng viên & lưu trữ')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Bạn có toàn quyền trích xuất bản sao dữ liệu cá nhân (định dạng JSON) hoặc yêu cầu xóa toàn bộ lịch sử và tài khoản người dùng trực tiếp trong ứng dụng. Dữ liệu cá nhân chỉ được lưu trữ trong thời gian tài khoản hoạt động và được xóa vĩnh viễn trong vòng 30 ngày sau khi tiếp nhận yêu cầu.
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('4', 'Quyền truy cập thiết bị & ghi âm')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Ứng dụng yêu cầu quyền truy cập Micro duy nhất cho mục đích thu âm câu trả lời phỏng vấn thử nghiệm bằng giọng nói. Dữ liệu âm thanh không bao giờ được ghi âm ngầm hay chạy dưới nền khi ứng dụng không thực hiện phỏng vấn.
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('5', 'Giới hạn độ tuổi & trẻ em')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Nexora AI là dịch vụ hỗ trợ sự nghiệp và ứng tuyển dành cho người dùng từ 18 tuổi trở lên (hoặc từ 13 tuổi với sự giám sát của người giám hộ). Chúng tôi không chủ động thu thập thông tin cá nhân của trẻ em dưới 13 tuổi.
                              </ThemedText>
                            </View>
                          </View>
                        )}
        
                        {tab.key === 'terms' && (
                          <View style={styles.docSection}>
                            <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Áp dụng cho nền tảng Nexora AI Mobile</ThemedText>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('1', 'Mục đích sử dụng')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Nexora là sản phẩm hỗ trợ luyện tập phỏng vấn và nhận đánh giá phản hồi dựa trên tiêu chí tuyển dụng. Nền tảng tuyệt đối KHÔNG phải công cụ gian lận phỏng vấn trực tiếp hay phần mềm nhắc bài thời gian thực.
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('2', 'Tài khoản & gói sử dụng')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Người dùng có trách nhiệm bảo mật thông tin đăng nhập của mình. Các lượt phỏng vấn và tính năng AI được cấp hạn mức dựa trên gói tài khoản (FREE / PRO).
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('3', 'Sở hữu trí tuệ')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Toàn bộ thuật toán, giao diện và nội dung câu hỏi được bảo hộ bản quyền bởi Nexora Platform. Người dùng sở hữu nội dung câu trả lời và hồ sơ cá nhân của mình.
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('4', 'Nội dung phản hồi AI')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Các nhận xét và điểm số được khởi tạo tự động bởi mô hình AI dựa trên tiêu chí tuyển dụng. Nếu bạn phát hiện phản hồi AI không phù hợp hoặc không chính xác, bạn có thể gửi báo cáo trực tiếp thông qua tính năng "Đánh giá & Góp ý" tích hợp trong ứng dụng.
                              </ThemedText>
                            </View>
                          </View>
                        )}
        
                        {tab.key === 'payment' && (
                          <View style={styles.docSection}>
                            <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Quy định nâng cấp gói & hoàn tiền</ThemedText>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('1', 'Phương thức thanh toán')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Các giao dịch nâng cấp gói cước (Gói PRO) được thực hiện an toàn qua hệ thống đối tác thanh toán chính thức hoặc cơ chế thanh toán trong ứng dụng (Google Play Billing). Nexora KHÔNG trực tiếp thu thập hay lưu trữ số thẻ ngân hàng, mã CVV hay mật khẩu tài khoản thanh toán của bạn.
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('2', 'Hạn mức & lượt sử dụng')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Mỗi đơn hàng thành công sẽ cấp quyền truy cập tính năng phỏng vấn AI tương ứng với gói đã chọn. Lịch sử đơn hàng, mã giao dịch và thời hạn gói cước được minh bạch trực tiếp trong trang "Cài đặt tài khoản".
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('3', 'Chính sách hoàn tiền')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Người dùng có quyền yêu cầu hoàn tiền trong các trường hợp:
                              </ThemedText>
                              <View style={styles.bulletList}>
                                {renderBullet('Phát sinh sự cố kỹ thuật từ phía hệ thống Nexora dẫn đến việc không thể khởi tạo lượt phỏng vấn quá 24h.')}
                                {renderBullet('Giao dịch bị thanh toán trùng lặp do sự cố cổng thanh toán.')}
                              </View>
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary, marginTop: Spacing.two }]}>
                                Yêu cầu hoàn tiền cần được gửi trong vòng 7 ngày làm việc kể từ thời điểm phát sinh giao dịch qua email support@nexora.vn hoặc mục "Đánh giá & Góp ý".
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('4', 'Hủy gói & gia hạn')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Bạn có thể chủ động ngừng gia hạn hoặc chuyển đổi gói cước bất kỳ lúc nào mà không phát sinh thêm chi phí ẩn. Sau khi hủy, quyền lợi gói PRO hiện tại sẽ duy trì cho đến hết chu kỳ đã thanh toán.
                              </ThemedText>
                            </View>
                          </View>
                        )}
        
                        {tab.key === 'deletion' && (
                          <View style={styles.docSection}>
                            <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Tuân thủ quy định Google Play Store</ThemedText>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('1', 'Cam kết xóa dữ liệu')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Theo quy chuẩn dành cho ứng dụng Android trên Google Play Store, bạn có quyền yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân (CV, lịch sử phỏng vấn, báo cáo điểm số).
                              </ThemedText>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('2', 'Cách thực hiện')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Bạn có thể thực hiện xóa tài khoản bằng 2 cách:
                              </ThemedText>
                              <View style={styles.bulletList}>
                                {renderBullet('Trực tiếp trong app: Vào Cài đặt tài khoản → Khu vực nguy hiểm → Yêu cầu xóa tài khoản.')}
                                {renderBullet('Gửi email yêu cầu: Gửi tới support@nexora.vn với chủ đề "Yêu cầu xóa tài khoản Nexora".')}
                              </View>
                            </View>
        
                            <View style={styles.contentBlock}>
                              {renderSectionHeader('3', 'Thời gian xử lý')}
                              <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
                                Sau khi tiếp nhận yêu cầu, tài khoản của bạn sẽ bị vô hiệu hóa ngay lập tức và toàn bộ dữ liệu trên hệ thống cơ sở dữ liệu sẽ được hủy bỏ hoàn toàn trong tối đa 30 ngày làm việc.
                              </ThemedText>
                            </View>
                          </View>
                        )}
        
                        <View style={styles.footerRow}>
                          <TouchableOpacity
                            onPress={() => openWebUrl('https://nexora.vn/privacy')}
                            style={styles.webLinkTextContainer}
                          >
                            <ThemedText style={[styles.webLinkText, { color: colors.primary }]}>
                              Đọc bản đầy đủ trên nexora.vn
                            </ThemedText>
                            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
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
    fontSize: 15,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six + Spacing.four,
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
    marginBottom: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  sectionNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  sectionNumber: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.3,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Typography.fontFamily.medium,
    opacity: 0.9,
  },
  bulletList: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 10,
    opacity: 0.6,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Typography.fontFamily.medium,
    opacity: 0.9,
  },
  footerRow: {
    marginTop: Spacing.five,
    alignItems: 'flex-start',
  },
  webLinkTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  webLinkText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
  },
});
