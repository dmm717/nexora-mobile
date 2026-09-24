import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { memo, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { interviewApi } from '@/api/interview.api';
import { jobDescriptionsApi } from '@/api/job-descriptions.api';
import { profileApi } from '@/api/profile.api';
import { resumesApi } from '@/api/resumes.api';
import { ExitConfirmationModal } from '@/components/interview/InterviewSubComponents';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/interview-preflight.styles';

const INTERVIEW_TYPES = [
  {
    id: 'technical',
    label: 'Kỹ thuật',
    shortLabel: 'Kỹ thuật',
    icon: 'code-slash',
    desc: 'Đào sâu kiến thức và cách giải quyết vấn đề chuyên môn.',
    tags: ['Kiến thức chuyên môn', 'Giải quyết vấn đề', 'Tư duy thuật toán'],
  },
  {
    id: 'behavioral',
    label: 'Hành vi',
    shortLabel: 'Hành vi',
    icon: 'people',
    desc: 'Khai thác trải nghiệm, hợp tác và phản xạ theo cấu trúc STAR.',
    tags: ['Cấu trúc STAR', 'Trải nghiệm thực tế', 'Kỹ năng làm việc nhóm'],
  },
  {
    id: 'scenario',
    label: 'Tình huống',
    shortLabel: 'Tình huống',
    icon: 'construct',
    desc: 'Xử lý một bối cảnh thực tế phù hợp với vai trò mục tiêu.',
    tags: ['Xử lý bối cảnh', 'Phản ứng linh hoạt', 'Ra quyết định nhanh'],
  },
  {
    id: 'cv_targeted',
    label: 'Theo CV',
    shortLabel: 'Theo CV',
    icon: 'document-text',
    desc: 'Tạo câu hỏi từ một CV thật đang ở trạng thái sẵn sàng.',
    tags: ['Dự án trong CV', 'Hồ sơ cá nhân', 'Kinh nghiệm đã làm'],
  },
  {
    id: 'jd_targeted',
    label: 'Theo Job Description',
    shortLabel: 'Theo JD',
    icon: 'briefcase',
    desc: 'Tạo câu hỏi từ một Job Description đã lưu hoặc vừa tạo.',
    tags: ['Mô tả công việc', 'Yêu cầu tuyển dụng', 'Mức độ phù hợp JD'],
  },
  {
    id: 'motivation_role_fit',
    label: 'Động lực & phù hợp vai trò',
    shortLabel: 'Role Fit',
    icon: 'heart-outline',
    desc: 'Làm rõ động lực, định hướng và mức độ phù hợp với vai trò.',
    tags: ['Định hướng sự nghiệp', 'Văn hóa doanh nghiệp', 'Mục tiêu cá nhân'],
  },
  {
    id: 'self_introduction',
    label: 'Giới thiệu bản thân',
    shortLabel: 'Giới thiệu',
    icon: 'mic-outline',
    desc: 'Luyện phần mở đầu và cách trình bày hồ sơ ngắn gọn.',
    tags: ['Mở đầu ấn tượng', 'Kỹ năng thuyết trình', 'Tóm tắt bản thân'],
  },
];

const SENIORITIES = [
  { id: 'intern', label: 'Intern' },
  { id: 'fresher', label: 'Fresher' },
  { id: 'junior', label: 'Junior' },
  { id: 'middle', label: 'Mid-Level' },
  { id: 'senior', label: 'Senior' },
  { id: 'lead', label: 'Lead' },
  { id: 'principal', label: 'Principal' },
];

const SESSION_DIFFICULTIES = [
  { id: 'easy', label: 'Dễ' },
  { id: 'middle', label: 'Trung bình' },
  { id: 'hard', label: 'Khó' },
];

// ---------- Sub-components for lower control-flow complexity ----------

const PreflightHeroBanner = memo(({ colors }: { colors: any }) => (
  <View style={[styles.card, { backgroundColor: colors.primary, borderColor: colors.primary, padding: Spacing.four }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, marginRight: Spacing.two }}>
        <ThemedText style={{ color: '#ffffff', fontSize: 19, fontWeight: '800', letterSpacing: -0.4 }}>
          Chuẩn bị vào phòng phỏng vấn Nexora AI
        </ThemedText>
        <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 12, lineHeight: 17, marginTop: 6 }}>
          Chọn bối cảnh cho phiên này, cấu hình độ khó và kiểm tra microphone trước khi bắt đầu. Các thay đổi chỉ áp dụng cho phiên hiện tại.
        </ThemedText>
      </View>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="hardware-chip-outline" size={24} color="#ffffff" />
      </View>
    </View>
  </View>
));

const CombinedPreflightCard = memo(({
  role,
  setRole,
  seniority,
  setSeniority,
  difficulty,
  setDifficulty,
  careerGoals,
  selectedGoalId,
  onSelectGoal,
  colors,
}: {
  role: string;
  setRole: (r: string) => void;
  seniority: string;
  setSeniority: (s: string) => void;
  difficulty: string;
  setDifficulty: (d: string) => void;
  careerGoals?: any[];
  selectedGoalId: string | null;
  onSelectGoal: (goal: any) => void;
  colors: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const currentSeniorityLabel = SENIORITIES.find((s) => s.id.toLowerCase() === seniority.toLowerCase())?.label || seniority;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, gap: Spacing.four }]}>
      {/* SECTION 1: Bối Cảnh Phiên (Vị Trí & Cấp Bậc) */}
      <View style={{ gap: Spacing.two }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
            <ThemedText type="subtitle" style={styles.cardTitle}>Bối Cảnh Phiên</ThemedText>
          </View>

          <TouchableOpacity
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              backgroundColor: isEditing ? colors.backgroundElement : colors.primaryLight,
              borderWidth: isEditing ? 1 : 0,
              borderColor: colors.cardBorder,
            }}
            onPress={() => setIsEditing(!isEditing)}
          >
            <ThemedText style={{ fontSize: 12, fontWeight: '700', color: isEditing ? colors.textSecondary : colors.primary }}>
              {isEditing ? 'Đóng' : 'Thay đổi'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Compact View when not editing */}
        {!isEditing && (
          <View style={{ backgroundColor: colors.backgroundElement, padding: 12, borderRadius: 12, gap: 8, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>Vị trí:</ThemedText>
              <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                {role || 'Chưa chọn vị trí'}
              </ThemedText>
            </View>
            <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>Cấp bậc:</ThemedText>
              <View style={{ backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8 }}>
                <ThemedText style={{ fontSize: 12, fontWeight: '700', color: '#ffffff' }}>
                  {currentSeniorityLabel}
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Expanded View when editing */}
        {isEditing && (
          <View style={{ gap: Spacing.three, marginTop: Spacing.two }}>
            {careerGoals && careerGoals.length > 0 && (
              <View style={{ gap: 6 }}>
                <ThemedText style={styles.inputLabel}>Chọn từ Mục tiêu đã lưu:</ThemedText>
                <View style={{ gap: 8 }}>
                  {careerGoals.map((g) => {
                    const isSelected = selectedGoalId === g.id;
                    return (
                      <TouchableOpacity
                        key={g.id}
                        style={[
                          styles.selectionRow,
                          {
                            borderColor: isSelected ? colors.primary : colors.cardBorder,
                            backgroundColor: isSelected ? colors.primaryLight : colors.backgroundElement,
                          },
                        ]}
                        onPress={() => onSelectGoal(g)}
                      >
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={20}
                          color={isSelected ? colors.primary : colors.textMuted}
                        />
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <ThemedText style={{ fontSize: 13, fontWeight: '700', color: isSelected ? colors.primary : colors.text }}>
                            {g.targetRole}
                          </ThemedText>
                          <View style={{ backgroundColor: isSelected ? colors.primary : colors.cardBorder, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
                            <ThemedText style={{ fontSize: 11, fontWeight: '700', color: isSelected ? '#ffffff' : colors.textMuted }}>
                              {g.seniority}
                            </ThemedText>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={{ gap: 6 }}>
              <ThemedText style={styles.inputLabel}>Vị trí mục tiêu:</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }]}
                placeholder="Ví dụ: Business Analyst, Backend Developer"
                placeholderTextColor={colors.textMuted}
                value={role}
                onChangeText={setRole}
              />
            </View>

            <View style={{ gap: 8 }}>
              <ThemedText style={styles.inputLabel}>Cấp bậc mong muốn (Seniority):</ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SENIORITIES.map((sen) => {
                  const isSelected = seniority.toLowerCase() === sen.id.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={sen.id}
                      style={[
                        styles.chip,
                        {
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderColor: isSelected ? colors.primary : colors.cardBorder,
                          backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                        },
                      ]}
                      onPress={() => setSeniority(sen.id)}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? '#ffffff' : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                            fontSize: 12,
                          },
                        ]}
                      >
                        {sen.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.cardBorder, opacity: 0.6 }} />

      {/* SECTION 2: Độ Khó Của Phiên (ALWAYS VISIBLE) */}
      <View style={{ gap: Spacing.two }}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="speedometer-outline" size={20} color={colors.warning} />
          <ThemedText type="subtitle" style={styles.cardTitle}>Độ Khó Của Phiên</ThemedText>
        </View>

        <View style={styles.chipGroup}>
          {SESSION_DIFFICULTIES.map((diff) => {
            const isSelected = difficulty === diff.id;
            return (
              <TouchableOpacity
                key={diff.id}
                style={[
                  styles.chip,
                  {
                    flex: 1,
                    paddingVertical: 10,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                    backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                  },
                ]}
                onPress={() => setDifficulty(diff.id)}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#ffffff' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {diff.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
});

const PreflightTypeCard = memo(({
  interviewType,
  setInterviewType,
  colors,
}: {
  interviewType: string;
  setInterviewType: (t: string) => void;
  colors: any;
}) => {
  const currentIndex = INTERVIEW_TYPES.findIndex((t) => t.id === interviewType);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const selectedType = INTERVIEW_TYPES[safeIndex];

  const handlePrev = () => {
    const prevIndex = (safeIndex - 1 + INTERVIEW_TYPES.length) % INTERVIEW_TYPES.length;
    setInterviewType(INTERVIEW_TYPES[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (safeIndex + 1) % INTERVIEW_TYPES.length;
    setInterviewType(INTERVIEW_TYPES[nextIndex].id);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, gap: Spacing.three }]}>
      {/* Header Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="layers-outline" size={22} color={colors.secondary} />
          <ThemedText type="subtitle" style={styles.cardTitle}>Chủ Đề Phỏng Vấn Trọng Tâm</ThemedText>
        </View>
        <View style={{ backgroundColor: colors.backgroundElement, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
          <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
            {safeIndex + 1} / {INTERVIEW_TYPES.length}
          </ThemedText>
        </View>
      </View>

      {/* Horizontal Scrollable Pill Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {INTERVIEW_TYPES.map((type) => {
          const isSelected = interviewType === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.cardBorder,
                backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
              }}
              onPress={() => setInterviewType(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={15}
                color={isSelected ? '#ffffff' : colors.textSecondary}
              />
              <ThemedText
                style={{
                  fontSize: 12,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? '#ffffff' : colors.text,
                }}
              >
                {type.shortLabel}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Ultra-Premium Glassmorphic Spotlight Card */}
      <View
        style={{
          backgroundColor: colors.primaryLight,
          borderColor: colors.primary,
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 14,
          gap: 10,
        }}
      >
        {/* Top Header inside card */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={selectedType.icon as any} size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <ThemedText style={{ fontSize: 15, fontWeight: '800', color: colors.primary }} numberOfLines={1}>
                {selectedType.label}
              </ThemedText>
              <ThemedText style={{ fontSize: 11, color: colors.textMuted }}>
                Chủ đề phỏng vấn #{safeIndex + 1}
              </ThemedText>
            </View>
          </View>
          <View style={{ backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <ThemedText style={{ fontSize: 11, fontWeight: '800', color: '#ffffff' }}>✓ Đã chọn</ThemedText>
          </View>
        </View>

        {/* Description */}
        <ThemedText style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 18 }}>
          {selectedType.desc}
        </ThemedText>

        {/* Focus Tags */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          {selectedType.tags.map((tag, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: colors.card,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <ThemedText style={{ fontSize: 10.5, fontWeight: '600', color: colors.primary }}>
                🏷️ {tag}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Quick Prev / Next Navigator Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 }}
            onPress={handlePrev}
          >
            <Ionicons name="chevron-back" size={16} color={colors.primary} />
            <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Chủ đề trước</ThemedText>
          </TouchableOpacity>

          {/* Dots */}
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            {INTERVIEW_TYPES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === safeIndex ? 14 : 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: i === safeIndex ? colors.primary : colors.cardBorder,
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 }}
            onPress={handleNext}
          >
            <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Chủ đề sau</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});



const MicCheckCard = memo(({ colors, onModeChange }: { colors: any; onModeChange?: (mode: 'voice' | 'text') => void }) => {
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'ready' | 'blocked'>('idle');
  const [meterLevel, setMeterLevel] = useState(0);

  useEffect(() => {
    let interval: any;
    if (micStatus === 'testing') {
      interval = setInterval(() => {
        setMeterLevel(Math.floor(Math.random() * 60) + 30);
      }, 150);
    } else if (micStatus === 'ready') {
      setMeterLevel(100);
    } else if (micStatus === 'blocked') {
      setMeterLevel(100);
    } else {
      setMeterLevel(0);
    }
    return () => clearInterval(interval);
  }, [micStatus]);

  const handleTest = async () => {
    setMicStatus('testing');
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMicStatus('ready');
        onModeChange?.('voice');
      } else {
        setTimeout(() => {
          setMicStatus('ready');
          onModeChange?.('voice');
        }, 1200);
      }
    } catch {
      setMicStatus('blocked');
      onModeChange?.('text');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, gap: Spacing.three }]}>
      {/* Header Row */}
      <View style={styles.cardHeaderRow}>
        <Ionicons name="mic-outline" size={22} color="#059669" />
        <ThemedText type="subtitle" style={styles.cardTitle}>Kiểm tra thiết bị âm thanh</ThemedText>
      </View>

      {/* Inner Container */}
      <View
        style={{
          backgroundColor: colors.backgroundElement,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          borderRadius: 16,
          padding: 14,
          gap: 12,
        }}
      >
        {/* Status Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
            {micStatus === 'testing' ? '🎤 Đang đo tín hiệu âm thanh...' : 'Tín hiệu Microphone:'}
          </ThemedText>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor:
                micStatus === 'ready'
                  ? '#d1fae5'
                  : micStatus === 'blocked'
                  ? '#fee2e2'
                  : micStatus === 'testing'
                  ? colors.primaryLight
                  : colors.cardBorder + '40',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {micStatus === 'blocked' && <Ionicons name="mic-off" size={13} color="#dc2626" />}
            <ThemedText
              style={{
                fontSize: 11,
                fontWeight: '700',
                color:
                  micStatus === 'ready'
                    ? '#065f46'
                    : micStatus === 'blocked'
                    ? '#dc2626'
                    : micStatus === 'testing'
                    ? colors.primary
                    : colors.textMuted,
              }}
            >
              {micStatus === 'ready'
                ? '✓ Đã nhận diện Micro'
                : micStatus === 'blocked'
                ? 'Bị chặn / Không có'
                : micStatus === 'testing'
                ? 'Đang đo tín hiệu...'
                : 'Chưa kiểm tra Microphone'}
            </ThemedText>
          </View>
        </View>

        {/* Sound Level Meter Bar */}
        <View
          style={{
            height: 10,
            width: '100%',
            backgroundColor: colors.cardBorder + '60',
            borderRadius: 6,
            overflow: 'hidden',
            padding: 2,
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${meterLevel}%`,
              backgroundColor: micStatus === 'ready' ? '#10b981' : micStatus === 'blocked' ? '#dc2626' : colors.primary,
              borderRadius: 4,
            }}
          />
        </View>

        {/* Green Success Banner when Microphone is Ready */}
        {micStatus === 'ready' && (
          <View
            style={{
              backgroundColor: '#ecfdf5',
              borderColor: '#a7f3d0',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <ThemedText style={{ fontSize: 13, fontWeight: '700', color: '#065f46' }}>
                Tín hiệu Microphone hoạt động tốt! ✓
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 11.5, color: '#047857', lineHeight: 16 }}>
              Giọng nói sẽ được chuyển thành văn bản trong phiên. Bạn có thể chỉnh sửa trước khi nộp.
            </ThemedText>
            <TouchableOpacity onPress={() => setMicStatus('idle')}>
              <ThemedText style={{ fontSize: 11.5, fontWeight: '700', color: '#065f46', textDecorationLine: 'underline', marginTop: 2 }}>
                Thay vào đó, tôi muốn gõ văn bản
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Red Error Banner when Microphone is Blocked */}
        {micStatus === 'blocked' && (
          <View
            style={{
              backgroundColor: '#fef2f2',
              borderColor: '#fca5a5',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Ionicons name="mic-off-outline" size={20} color="#dc2626" style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 13, fontWeight: '700', color: '#991b1b', marginBottom: 2 }}>
                  Quyền truy cập Microphone bị từ chối.
                </ThemedText>
                <ThemedText style={{ fontSize: 11.5, color: '#b91c1c', lineHeight: 16 }}>
                  Bạn có thể bấm vào biểu tượng ổ khóa trên thanh địa chỉ hoặc Cài đặt ứng dụng để cấp quyền micro.
                </ThemedText>
              </View>
            </View>

            {/* Chat box fallback badge */}
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderWidth: 1,
                borderColor: '#fca5a5',
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Ionicons name="keypad-outline" size={16} color={colors.primary} />
                <ThemedText style={{ fontSize: 11, fontWeight: '600', color: '#7f1d1d', flex: 1 }}>
                  Đã tự động chuyển sang chế độ gõ văn bản (Chat Box)
                </ThemedText>
              </View>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
            </View>
          </View>
        )}

        {/* Action Button Centered */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
          onPress={handleTest}
          disabled={micStatus === 'testing'}
        >
          {micStatus === 'testing' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={micStatus === 'ready' ? 'checkmark-circle' : micStatus === 'blocked' ? 'refresh-outline' : 'mic-outline'}
              size={18}
              color={micStatus === 'ready' ? '#10b981' : micStatus === 'blocked' ? '#dc2626' : colors.text}
            />
          )}
          <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
            {micStatus === 'testing'
              ? 'Đang đo tín hiệu âm thanh...'
              : micStatus === 'ready'
              ? 'Kiểm tra lại Microphone'
              : micStatus === 'blocked'
              ? 'Thử kiểm tra lại Microphone'
              : 'Kiểm tra Microphone'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.cardBorder, opacity: 0.5 }} />

      {/* Invariant reminders (3 checkmark points) */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginTop: 1 }} />
          <ThemedText style={{ flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
            Âm thanh chỉ dùng để chuyển thành văn bản (STT). Bạn luôn được đọc và sửa trước khi nộp.
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginTop: 1 }} />
          <ThemedText style={{ flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
            Hệ thống <ThemedText style={{ fontWeight: '800', color: colors.text }}>không chấm điểm ngữ điệu, WPM, phát âm</ThemedText> hay ghi hình camera.
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginTop: 1 }} />
          <ThemedText style={{ flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
            Bạn có thể gõ văn bản trực tiếp nếu không tiện nói.
          </ThemedText>
        </View>
      </View>
    </View>
  );
});

const EntranceActionCard = memo(({
  onStart,
  isPending,
  colors,
}: {
  onStart: () => void;
  isPending: boolean;
  colors: any;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1.5 }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
        <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
          ⚡ Q1–Q3 thuộc phạm vi miễn phí
        </ThemedText>
      </View>
    </View>

    <ThemedText type="subtitle" style={{ fontSize: 17, fontWeight: '700', marginTop: 4 }}>
      Sẵn sàng bước vào phòng?
    </ThemedText>

    <ThemedText style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
      Máy chủ quyết định khả năng kết thúc hoặc tiếp tục cùng phiên sau ranh giới miễn phí, dựa trên quyền hiện tại của bạn.
    </ThemedText>

    <TouchableOpacity
      style={[
        styles.primaryButton,
        { backgroundColor: colors.primary, marginTop: Spacing.two },
        isPending && styles.disabledButton,
      ]}
      onPress={onStart}
      disabled={isPending}
    >
      {isPending ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Ionicons name="play-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
          <ThemedText style={styles.primaryButtonText}>Vào phòng phỏng vấn ngay</ThemedText>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
        </>
      )}
    </TouchableOpacity>
  </View>
));

// ---------- Main Screen Component ----------

export default function PreflightScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [role, setRole] = useState('');
  const [seniority, setSeniority] = useState('middle');
  const [difficulty, setDifficulty] = useState('middle');
  const [interviewType, setInterviewType] = useState('technical');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [micMode, setMicMode] = useState<'voice' | 'text'>('voice');

  // Exit Modal state
  const [showExitModal, setShowExitModal] = useState(false);

  // JD state
  const [jdMode, setJdMode] = useState<'select' | 'new'>('select');
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);
  const [newJdTitle, setNewJdTitle] = useState('');
  const [newJdContent, setNewJdContent] = useState('');

  // Career Goal state
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumesApi.list,
  });

  const { data: jobDescriptions } = useQuery({
    queryKey: ['job-descriptions'],
    queryFn: jobDescriptionsApi.list,
  });

  // Track auto-fill
  const autoFilledGoalId = useRef<string | undefined>(undefined);
  const autoFilledResumeId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (profile?.activeCareerGoal?.id && autoFilledGoalId.current !== profile.activeCareerGoal.id) {
      autoFilledGoalId.current = profile.activeCareerGoal.id;
      setSelectedGoalId(profile.activeCareerGoal.id);
      setRole(profile.activeCareerGoal.targetRole);
      setSeniority(profile.activeCareerGoal.seniority.toLowerCase());
    }
    if (profile?.primaryResume?.id && autoFilledResumeId.current !== profile.primaryResume.id) {
      autoFilledResumeId.current = profile.primaryResume.id;
      setSelectedResumeId(profile.primaryResume.id);
    }
  }, [profile]);

  const handleSelectGoal = (goal: any) => {
    setSelectedGoalId(goal.id);
    setRole(goal.targetRole);
    setSeniority(goal.seniority.toLowerCase());
  };

  const startMutation = useMutation({
    mutationFn: async () => {
      let finalJdId = selectedJdId;

      if (jdMode === 'new') {
        if (!newJdTitle.trim() || !newJdContent.trim()) {
          throw new Error('Vui lòng nhập tiêu đề và nội dung Job Description mới');
        }
        const createdJd = await jobDescriptionsApi.create({
          title: newJdTitle.trim(),
          content: newJdContent.trim(),
        });
        finalJdId = createdJd.id;
      }

      const res = await interviewApi.start({
        role: role.trim() || undefined,
        seniority: seniority || undefined,
        interviewType: interviewType,
        difficulty: difficulty,
        resumeId: selectedResumeId,
        jobDescriptionId: finalJdId,
        careerGoalId: selectedGoalId,
      });
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interview-history'] });
      queryClient.invalidateQueries({ queryKey: ['progress-dashboard'] });
      router.replace(`/(app)/interview/${data.id}?micMode=${micMode}` as any);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể khởi tạo phiên phỏng vấn. Vui lòng thử lại.');
      console.error(err);
    },
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header matching Web: ← Thoát phiên luyện | Chế độ luyện tập tập trung */}
        <AppScreenHeader
          title="Thoát phiên luyện"
          onBack={() => setShowExitModal(true)}
          rightElement={
            <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>
              Chế độ luyện tập tập trung
            </ThemedText>
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isProfileLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : (
            <>
              <PreflightHeroBanner colors={colors} />

              <CombinedPreflightCard
                role={role}
                setRole={setRole}
                seniority={seniority}
                setSeniority={setSeniority}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                careerGoals={profile?.activeCareerGoal ? [profile.activeCareerGoal] : []}
                selectedGoalId={selectedGoalId}
                onSelectGoal={handleSelectGoal}
                colors={colors}
              />


              <PreflightTypeCard
                interviewType={interviewType}
                setInterviewType={setInterviewType}
                colors={colors}
              />
              <MicCheckCard colors={colors} onModeChange={setMicMode} />

              <EntranceActionCard
                onStart={() => startMutation.mutate()}
                isPending={startMutation.isPending}
                colors={colors}
              />
            </>
          )}
        </ScrollView>

        {/* Exit Confirmation Modal */}
        <ExitConfirmationModal
          visible={showExitModal}
          colors={colors}
          onStay={() => setShowExitModal(false)}
          onLeave={() => {
            setShowExitModal(false);
            router.push('/(app)/interview/history' as any);
          }}
        />

        {/* Global Bottom Navigation Bar */}
        <AppBottomNavBar activeTab="interview" />
      </SafeAreaView>
    </ThemedView>
  );
}
