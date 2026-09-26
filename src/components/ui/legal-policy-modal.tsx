import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from './glass-card';
import { TouchableScale } from './touchable-scale';

export type PolicyTab = 'privacy' | 'terms' | 'payment' | 'deletion';

interface LegalPolicyModalProps {
  visible: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
}

export function LegalPolicyModal({
  visible,
  initialTab = 'privacy',
  onClose,
}: LegalPolicyModalProps) {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  const openWebUrl = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      await Linking.openURL(url);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Modal Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Pháp Lý & Điều Khoản</ThemedText>
          <TouchableOpacity
            onPress={() => openWebUrl('https://nexora.vn/privacy')}
            style={styles.webBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="open-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation Bar */}
        <View style={[styles.tabBar, { backgroundColor: colors.backgroundElement }]}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'privacy' && [styles.activeTabItem, { backgroundColor: colors.surface }],
            ]}
            onPress={() => setActiveTab('privacy')}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'privacy' ? { color: colors.primary, fontWeight: '700' } : { color: colors.textMuted },
              ]}
            >
              Bảo Mật
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'terms' && [styles.activeTabItem, { backgroundColor: colors.surface }],
            ]}
            onPress={() => setActiveTab('terms')}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'terms' ? { color: colors.primary, fontWeight: '700' } : { color: colors.textMuted },
              ]}
            >
              Điều Khoản
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'payment' && [styles.activeTabItem, { backgroundColor: colors.surface }],
            ]}
            onPress={() => setActiveTab('payment')}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'payment' ? { color: colors.primary, fontWeight: '700' } : { color: colors.textMuted },
              ]}
            >
              Thanh Toán
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'deletion' && [styles.activeTabItem, { backgroundColor: colors.surface }],
            ]}
            onPress={() => setActiveTab('deletion')}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'deletion' ? { color: colors.primary, fontWeight: '700' } : { color: colors.textMuted },
              ]}
            >
              Xóa Dữ Liệu
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Document Content */}
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
          {activeTab === 'privacy' && (
            <View style={styles.docSection}>
              <ThemedText style={styles.docTitle}>Chính Sách Bảo Mật (Privacy Policy)</ThemedText>
              <ThemedText style={styles.docMeta}>Cập nhật lần cuối: Ngày 25 tháng 09 năm 2026</ThemedText>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>1. Thu Thập Dữ Liệu</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Nexora AI cam kết bảo vệ thông tin riêng tư của ứng viên. Chúng tôi thu thập các dữ liệu cần thiết để phục vụ trải nghiệm luyện phỏng vấn:
                </ThemedText>
                <ThemedText style={styles.bullet}>• Thông tin tài khoản: Email, tên hiển thị, mật khẩu được mã hóa qua ASP.NET Core Identity.</ThemedText>
                <ThemedText style={styles.bullet}>• Hồ sơ nghề nghiệp: Nội dung CV, Mô tả công việc (JD), lịch sử các buổi phỏng vấn thử.</ThemedText>
                <ThemedText style={styles.bullet}>• Giọng nói & Âm thanh: Dữ liệu ghi âm giọng nói khi thực hiện phỏng vấn (chỉ dùng cho chuyển đổi văn bản và phân tích giọng nói).</ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>2. Sử Dụng & Bảo Mã Dữ Liệu AI</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Tất cả dữ liệu câu trả lời và thông tin hồ sơ được truyền qua kết nối mã hóa TLS/HTTPS tới hệ thống backend. Nexora không bao giờ chia sẻ hoặc bán dữ liệu cá nhân của ứng viên cho bên thứ ba vì mục đích quảng cáo.
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>3. Quyền Của Ứng Viên & Lưu Trữ Dữ Liệu</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Bạn có toàn quyền trích xuất bản sao dữ liệu cá nhân (định dạng JSON) hoặc yêu cầu xóa toàn bộ lịch sử và tài khoản người dùng trực tiếp trong ứng dụng. Dữ liệu cá nhân chỉ được lưu trữ trong thời gian tài khoản hoạt động và được xóa vĩnh viễn trong vòng 30 ngày sau khi tiếp nhận yêu cầu.
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>4. Quyền Truy Cập Thiết Bị & Ghi Âm (Microphone)</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Ứng dụng yêu cầu quyền truy cập Micro (`RECORD_AUDIO`) duy nhất cho mục đích thu âm câu trả lời phỏng vấn thử nghiệm bằng giọng nói. Dữ liệu âm thanh không bao giờ được ghi âm ngầm hay chạy dưới nền khi ứng dụng không thực hiện phỏng vấn.
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>5. Giới Hạn Độ Tuổi & Quyền Trẻ Em</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Nexora AI là dịch vụ hỗ trợ sự nghiệp và ứng tuyển dành cho người dùng từ 18 tuổi trở lên (hoặc từ 13 tuổi với sự giám sát của người giám hộ). Chúng tôi không chủ động thu thập thông tin cá nhân của trẻ em dưới 13 tuổi.
                </ThemedText>
              </GlassCard>
            </View>
          )}

          {activeTab === 'terms' && (
            <View style={styles.docSection}>
              <ThemedText style={styles.docTitle}>Điều Khoản Sử Dụng (Terms of Service)</ThemedText>
              <ThemedText style={styles.docMeta}>Áp dụng cho nền tảng Nexora AI Mobile</ThemedText>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>1. Mục Đích Sử Dụng</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Nexora là sản phẩm hỗ trợ luyện tập phỏng vấn và nhận đánh giá phản hồi dựa trên tiêu chí tuyển dụng. Nền tảng tuyệt đối KHÔNG phải công cụ gian lận phỏng vấn trực tiếp hay phần mềm nhắc bài thời gian thực.
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>2. Tài Khoản & Gói Sử Dụng</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Người dùng có trách nhiệm bảo mật thông tin đăng nhập của mình. Các lượt phỏng vấn và tính năng AI được cấp hạn mức dựa trên gói tài khoản (FREE / PRO).
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>3. Sở Hữu Trí Tuệ</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Toàn bộ thuật toán, giao diện và nội dung câu hỏi được bảo hộ bản quyền bởi Nexora Platform. Người dùng sở hữu nội dung câu trả lời và hồ sơ cá nhân của mình.
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>4. Nội Dung Phản Hồi AI & Báo Cáo Vi Phạm</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Các nhận xét và điểm số được khởi tạo tự động bởi mô hình AI dựa trên tiêu chí tuyển dụng. Nếu bạn phát hiện phản hồi AI không phù hợp hoặc không chính xác, bạn có thể gửi báo cáo trực tiếp thông qua tính năng "Đánh giá & Góp ý" tích hợp trong ứng dụng.
                </ThemedText>
              </GlassCard>
            </View>
          )}

          {activeTab === 'payment' && (
            <View style={styles.docSection}>
              <ThemedText style={styles.docTitle}>Chính Sách Thanh Toán & Giao Dịch</ThemedText>
              <ThemedText style={styles.docMeta}>Quy định nâng cấp gói, bảo mật giao dịch & hoàn tiền</ThemedText>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>1. Phương Thức Thanh Toán & Bảo Mật</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Các giao dịch nâng cấp gói cước (Gói PRO) được thực hiện an toàn qua hệ thống đối tác thanh toán chính thức hoặc cơ chế thanh toán trong ứng dụng (Google Play Billing). Nexora KHÔNG trực tiếp thu thập hay lưu trữ số thẻ ngân hàng, mã CVV hay mật khẩu tài khoản thanh toán của bạn.
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>2. Hạn Mức Lượt Sử Dụng & Gói Cước</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Mỗi đơn hàng thành công sẽ cấp quyền truy cập tính năng phỏng vấn AI tương ứng với gói đã chọn. Lịch sử đơn hàng, mã giao dịch `#ORDER-ID` và thời hạn gói cước được minh bạch trực tiếp trong trang "Cài đặt tài khoản".
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>3. Chính Sách Hoàn Tiền (Refund Policy)</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Người dùng có quyền yêu cầu hoàn tiền trong các trường hợp:
                </ThemedText>
                <ThemedText style={styles.bullet}>• Phát sinh sự cố kỹ thuật từ phía hệ thống Nexora dẫn đến việc không thể khởi tạo lượt phỏng vấn quá 24h.</ThemedText>
                <ThemedText style={styles.bullet}>• Giao dịch bị thanh toán trùng lặp do sự cố cổng thanh toán.</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Yêu cầu hoàn tiền cần được gửi trong vòng 7 ngày làm việc kể từ thời điểm phát sinh giao dịch qua email support@nexora.vn hoặc mục "Đánh giá & Góp ý".
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>4. Hủy Gói & Gia Hạn</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Bạn có thể chủ động ngừng gia hạn hoặc chuyển đổi gói cước bất kỳ lúc nào mà không phát sinh thêm chi phí ẩn. Sau khi hủy, quyền lợi gói PRO hiện tại sẽ duy trì cho đến hết chu kỳ đã thanh toán.
                </ThemedText>
              </GlassCard>
            </View>
          )}

          {activeTab === 'deletion' && (
            <View style={styles.docSection}>
              <ThemedText style={styles.docTitle}>Quy Trình Xóa Tài Khoản & Dữ Liệu</ThemedText>
              <ThemedText style={styles.docMeta}>Tuân thủ quy định Google Play Store 2024+</ThemedText>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>1. Cam Kết Xóa Dữ Liệu</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Theo quy chuẩn dành cho ứng dụng Android trên Google Play Store, bạn có quyền yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân (CV, lịch sử phỏng vấn, báo cáo điểm số).
                </ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>2. Cách Thực Hiện Xóa Tài Khoản</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Bạn có thể thực hiện xóa tài khoản bằng 2 cách:
                </ThemedText>
                <ThemedText style={styles.bullet}>• Trực tiếp trong app: Vào Cài đặt tài khoản → Khu vực nguy hiểm → Yêu cầu xóa tài khoản.</ThemedText>
                <ThemedText style={styles.bullet}>• Gửi email yêu cầu: Gửi tới support@nexora.vn với chủ đề "Yêu cầu xóa tài khoản Nexora".</ThemedText>
              </GlassCard>

              <GlassCard style={styles.card}>
                <ThemedText style={styles.sectionHeading}>3. Thời Gian Xử Lý</ThemedText>
                <ThemedText style={styles.paragraph}>
                  Sau khi tiếp nhận yêu cầu, tài khoản của bạn sẽ bị vô hiệu hóa ngay lập tức và toàn bộ dữ liệu trên hệ thống cơ sở dữ liệu sẽ được hủy bỏ hoàn toàn trong tối đa 30 ngày làm việc.
                </ThemedText>
              </GlassCard>
            </View>
          )}

          <View style={styles.footerRow}>
            <TouchableScale
              style={[styles.webLinkBtn, { borderColor: colors.cardBorder }]}
              onPress={() => openWebUrl('https://nexora.vn/privacy')}
            >
              <Ionicons name="globe-outline" size={16} color={colors.primary} />
              <ThemedText style={[styles.webLinkText, { color: colors.primary }]}>
                Xem trang chính sách bảo mật trên Web (nexora.vn)
              </ThemedText>
            </TouchableScale>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: Spacing.one,
  },
  webBtn: {
    padding: Spacing.one,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    borderRadius: Radius.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  activeTabItem: {
    ...(Platform.select({
      web: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }) as any),
  },
  tabText: {
    fontSize: 12,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  docSection: {
    gap: Spacing.three,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  docMeta: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: Spacing.one,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.85,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.85,
    paddingLeft: Spacing.two,
  },
  footerRow: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  webLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  webLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
