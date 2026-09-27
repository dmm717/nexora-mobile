import React, { memo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { styles } from '@/styles/interview-preflight.styles';
import { Spacing, Colors } from '@/constants/theme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { INTERVIEW_TYPES, SENIORITIES, SESSION_DIFFICULTIES } from './constants';

export const CombinedPreflightCard = memo(({
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
  interviewType,
  resumes,
  selectedResumeId,
  setSelectedResumeId,
  jobDescriptions,
  jdMode,
  setJdMode,
  selectedJdId,
  setSelectedJdId,
  newJdTitle,
  setNewJdTitle,
  newJdContent,
  setNewJdContent,
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
  interviewType?: string;
  resumes?: any[];
  selectedResumeId?: string | null;
  setSelectedResumeId?: (id: string | null) => void;
  jobDescriptions?: any[];
  jdMode?: 'select' | 'new';
  setJdMode?: (mode: 'select' | 'new') => void;
  selectedJdId?: string | null;
  setSelectedJdId?: (id: string | null) => void;
  newJdTitle?: string;
  setNewJdTitle?: (val: string) => void;
  newJdContent?: string;
  setNewJdContent?: (val: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const currentSeniorityLabel = SENIORITIES.find((s) => s.id.toLowerCase() === seniority.toLowerCase())?.label || seniority;
  const currentResumeLabel = resumes?.find((r) => r.id === selectedResumeId)?.fileName || 'Chưa chọn CV';
  const currentJdLabel = jobDescriptions?.find((j) => j.id === selectedJdId)?.title || 'Chưa chọn JD';

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
            {interviewType === 'cv_targeted' && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>CV:</ThemedText>
                  <ThemedText style={{ fontSize: 13, fontWeight: '600', color: colors.text, maxWidth: '70%' }} numberOfLines={1}>
                    {currentResumeLabel}
                  </ThemedText>
                </View>
                <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
              </>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>Vị trí:</ThemedText>
              <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colors.text, maxWidth: '70%' }} numberOfLines={1}>
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

            {interviewType === 'jd_targeted' && (
              <>
                <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>JD:</ThemedText>
                  <ThemedText style={{ fontSize: 13, fontWeight: '600', color: colors.text, maxWidth: '70%' }} numberOfLines={1}>
                    {jdMode === 'select' ? currentJdLabel : (newJdTitle || 'JD Mới')}
                  </ThemedText>
                </View>
              </>
            )}
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

            {interviewType === 'cv_targeted' && (
              <View style={{ gap: 6 }}>
                <ThemedText style={styles.inputLabel}>CV sử dụng:</ThemedText>
                <View style={{ gap: 8 }}>
                  {resumes?.filter(r => r.status === 'ready').map((r) => {
                    const isSelected = selectedResumeId === r.id;
                    return (
                      <TouchableOpacity
                        key={r.id}
                        style={[
                          styles.selectionRow,
                          {
                            borderColor: isSelected ? colors.primary : colors.cardBorder,
                            backgroundColor: isSelected ? colors.primaryLight : colors.backgroundElement,
                            paddingVertical: 10,
                          },
                        ]}
                        onPress={() => setSelectedResumeId?.(r.id)}
                      >
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={20}
                          color={isSelected ? colors.primary : colors.textMuted}
                        />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <ThemedText style={{ fontSize: 13, fontWeight: '600', color: isSelected ? colors.primary : colors.text }} numberOfLines={1}>
                            {r.fileName}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {(!resumes || resumes.filter(r => r.status === 'ready').length === 0) && (
                    <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>Không có CV nào sẵn sàng.</ThemedText>
                  )}
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

            {interviewType === 'jd_targeted' && (
              <View style={{ gap: 12, backgroundColor: colors.backgroundElement, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      { flex: 1, borderColor: jdMode === 'select' ? colors.primary : colors.cardBorder, backgroundColor: jdMode === 'select' ? colors.primaryLight : colors.card }
                    ]}
                    onPress={() => setJdMode?.('select')}
                  >
                    <ThemedText style={{ fontSize: 12, fontWeight: jdMode === 'select' ? '700' : '500', color: jdMode === 'select' ? colors.primary : colors.text }}>JD đã lưu</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      { flex: 1, borderColor: jdMode === 'new' ? colors.primary : colors.cardBorder, backgroundColor: jdMode === 'new' ? colors.primaryLight : colors.card }
                    ]}
                    onPress={() => setJdMode?.('new')}
                  >
                    <ThemedText style={{ fontSize: 12, fontWeight: jdMode === 'new' ? '700' : '500', color: jdMode === 'new' ? colors.primary : colors.text }}>Tạo JD mới</ThemedText>
                  </TouchableOpacity>
                </View>

                {jdMode === 'select' ? (
                  <View style={{ gap: 8 }}>
                    {jobDescriptions?.map((jd) => {
                      const isSelected = selectedJdId === jd.id;
                      return (
                        <TouchableOpacity
                          key={jd.id}
                          style={[
                            styles.selectionRow,
                            {
                              borderColor: isSelected ? colors.primary : colors.cardBorder,
                              backgroundColor: isSelected ? colors.primaryLight : colors.card,
                              paddingVertical: 10,
                            },
                          ]}
                          onPress={() => setSelectedJdId?.(jd.id)}
                        >
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                            size={20}
                            color={isSelected ? colors.primary : colors.textMuted}
                          />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <ThemedText style={{ fontSize: 13, fontWeight: '600', color: isSelected ? colors.primary : colors.text }} numberOfLines={1}>
                              {jd.title}
                            </ThemedText>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    {(!jobDescriptions || jobDescriptions.length === 0) && (
                      <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>Không có JD nào.</ThemedText>
                    )}
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    <View style={{ gap: 6 }}>
                      <ThemedText style={styles.inputLabel}>Tiêu đề JD:</ThemedText>
                      <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.card }]}
                        placeholder="Ví dụ: Senior Backend Engineer"
                        placeholderTextColor={colors.textMuted}
                        value={newJdTitle}
                        onChangeText={setNewJdTitle}
                      />
                    </View>
                    <View style={{ gap: 6 }}>
                      <ThemedText style={styles.inputLabel}>Nội dung JD:</ThemedText>
                      <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.card, height: 100, textAlignVertical: 'top' }]}
                        placeholder="Dán nội dung JD vào đây..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                        value={newJdContent}
                        onChangeText={setNewJdContent}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

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
