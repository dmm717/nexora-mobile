import React from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Badge } from '@/components/ui/badge';
import { Spacing, Typography } from '@/constants/theme';
import { ResumeView } from '@/api/types';
import { styles } from './CVAnalysisForms.styles';

interface AnalysisTypeSelectorProps {
  mode: 'standard' | 'job_targeted' | 'field_benchmark';
  setMode: (mode: 'standard' | 'job_targeted' | 'field_benchmark') => void;
  colors: any;
  colorScheme: any;
  defaultTargetRole?: string;
  isCustomProfile: boolean;
}

export const AnalysisTypeSelector = ({ mode, setMode, colors, colorScheme, defaultTargetRole, isCustomProfile }: AnalysisTypeSelectorProps) => {
  const isJobTargeted = mode === 'job_targeted';
  
  const handleSelectFieldBenchmark = () => {
    setMode(isCustomProfile ? 'field_benchmark' : 'standard');
  };

  return (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Chọn hình thức phân tích đối chiếu:</ThemedText>
      <View style={styles.radioGroup}>
        {/* Vị trí mục tiêu */}
        <TouchableScale 
          style={[
            styles.radioCard, 
            { borderColor: 'rgba(0,0,0,0.05)', backgroundColor: colors.background }, 
            !isJobTargeted && { borderColor: colors.primary, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.primaryLight }
          ]} 
          onPress={handleSelectFieldBenchmark}
        >
          <View style={styles.radioHeader}>
            <ThemedText style={[styles.radioTitle, { color: !isJobTargeted ? colors.primary : colors.text }]}>Theo vị trí mục tiêu</ThemedText>
            {!isJobTargeted ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            ) : (
              <Ionicons name="ellipse" size={24} color={colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6'} />
            )}
          </View>
          <ThemedText style={[styles.radioDesc, { color: colors.textSecondary }]}>
            Đánh giá độ sẵn sàng 6 trục đối chiếu với chuẩn thị trường của {defaultTargetRole ? <ThemedText style={{fontFamily: Typography.fontFamily.bold, fontSize: 13, color: !isJobTargeted ? colors.primary : colors.text}}>{defaultTargetRole}</ThemedText> : 'vị trí bạn chọn'}.
          </ThemedText>
        </TouchableScale>

        {/* JD Cụ thể */}
        <TouchableScale 
          style={[
            styles.radioCard, 
            { borderColor: 'rgba(0,0,0,0.05)', backgroundColor: colors.background }, 
            isJobTargeted && { borderColor: colors.primary, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.primaryLight }
          ]} 
          onPress={() => setMode('job_targeted')}
        >
          <View style={styles.radioHeader}>
            <ThemedText style={[styles.radioTitle, { color: isJobTargeted ? colors.primary : colors.text }]}>Theo JD cụ thể</ThemedText>
            {isJobTargeted ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            ) : (
              <Ionicons name="ellipse" size={24} color={colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6'} />
            )}
          </View>
          <ThemedText style={[styles.radioDesc, { color: colors.textSecondary }]}>
            Đo lường 5 trục tiêu chuẩn đối chiếu trực tiếp với một văn bản mô tả công việc (JD) bạn dán vào.
          </ThemedText>
        </TouchableScale>
      </View>
    </View>
  );
};

interface FieldBenchmarkCardProps {
  industry: string;
  setIndustry: (t: string) => void;
  targetRole: string;
  setTargetRole: (t: string) => void;
  seniority: string;
  setSeniority: (t: string) => void;
  colors: any;
}

export const FieldBenchmarkCard = ({ industry, setIndustry, targetRole, setTargetRole, seniority, setSeniority, colors }: FieldBenchmarkCardProps) => (
  <SurfaceCard style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.background }]}>
    <View style={styles.cardHeader}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Ionicons name="analytics" size={20} color={colors.primary} />
        <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>2. Định hướng chuẩn ngành</ThemedText>
      </View>
      <Badge variant="secondary" size="sm">6 trục tiêu chuẩn</Badge>
    </View>
    <View style={styles.formGap}>
      <View>
        <ThemedText style={styles.inputLabel}>Ngành nghề / Lĩnh vực <ThemedText style={styles.asterisk}>*</ThemedText></ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="VD: Công nghệ thông tin / Thương mại điện tử"
          placeholderTextColor={colors.textMuted}
          value={industry}
          onChangeText={setIndustry}
        />
      </View>
      <View>
        <ThemedText style={styles.inputLabel}>Vị trí mục tiêu <ThemedText style={styles.asterisk}>*</ThemedText></ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="VD: Senior Frontend Developer / Data Analyst"
          placeholderTextColor={colors.textMuted}
          value={targetRole}
          onChangeText={setTargetRole}
        />
      </View>
      <View>
        <ThemedText style={styles.inputLabel}>Cấp bậc kinh nghiệm <ThemedText style={styles.asterisk}>*</ThemedText></ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="VD: Fresher / Junior / Mid-level / Senior"
          placeholderTextColor={colors.textMuted}
          value={seniority}
          onChangeText={setSeniority}
        />
      </View>
    </View>
  </SurfaceCard>
);

interface JobDescriptionCardProps {
  jdTitle: string;
  setJdTitle: (t: string) => void;
  jdContent: string;
  setJdContent: (t: string) => void;
  colors: any;
}

export const JobDescriptionCard = ({ jdTitle, setJdTitle, jdContent, setJdContent, colors }: JobDescriptionCardProps) => (
  <SurfaceCard style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.background }]}>
    <View style={styles.cardHeader}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Ionicons name="briefcase" size={20} color={colors.primary} />
        <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>2. Mô tả công việc (JD)</ThemedText>
      </View>
      <Badge variant="primary" size="sm">Bắt buộc tiêu đề & nội dung</Badge>
    </View>
    <View style={styles.formGap}>
      <View>
        <ThemedText style={styles.inputLabel}>Chức danh tuyển dụng (Title) <ThemedText style={styles.asterisk}>*</ThemedText></ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="VD: Senior Frontend Developer (React)"
          placeholderTextColor={colors.textMuted}
          value={jdTitle}
          onChangeText={setJdTitle}
        />
      </View>
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
          <ThemedText style={styles.inputLabel}>Nội dung JD chi tiết <ThemedText style={styles.asterisk}>*</ThemedText></ThemedText>
          <ThemedText style={{fontSize: 10, color: colors.textSecondary}}>Dán nội dung thực tế</ThemedText>
        </View>
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Dán toàn bộ hoặc các yêu cầu chính trong JD (kỹ năng, trách nhiệm, kinh nghiệm) vào đây..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={6}
          value={jdContent}
          onChangeText={setJdContent}
        />
      </View>
    </View>
  </SurfaceCard>
);

interface ResumeUploadCardProps {
  isUploading: boolean;
  colors: any;
  colorScheme: any;
  onUploadResume: () => void;
  existingResumes?: ResumeView[];
  selectedResumeId?: string | null;
  onSelectExistingResume: (resume: ResumeView) => void;
  onClearSelectedResume?: () => void;
  currentFileName?: string | null;
}

const getFileIconProps = (fileName?: string | null) => {
  if (!fileName) return { color: '#6B7280', label: 'FILE' };
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { color: '#EF4444', label: 'PDF' };
  if (ext === 'doc' || ext === 'docx') return { color: '#2563EB', label: 'DOC' };
  if (ext === 'txt') return { color: '#4B5563', label: 'TXT' };
  return { color: '#6B7280', label: 'FILE' };
};

export const ResumeUploadCard = ({
  isUploading, colors, colorScheme, onUploadResume, 
  existingResumes, selectedResumeId, onSelectExistingResume, onClearSelectedResume, currentFileName
}: ResumeUploadCardProps) => {
  // Find the selected resume size if it's from existing list
  const selectedExisting = existingResumes?.find(r => r.id === selectedResumeId);
  const displaySize = selectedExisting ? (selectedExisting.size / (1024 * 1024)).toFixed(2) : '0.04'; // Default to 0.04 for newly uploaded if we don't have size
  const fileProps = getFileIconProps(currentFileName);

  return (
    <SurfaceCard style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.background }]}>
      <View style={styles.cardHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>1. Hồ sơ ứng viên (CV)</ThemedText>
        </View>
        <Badge variant="neutral" size="sm">PDF / DOCX ≤ 10MB</Badge>
      </View>
      
      <View style={{ gap: 16, marginTop: 8 }}>
        {(selectedResumeId && currentFileName) ? (
          <View style={[styles.currentCvBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder }]}>
            <View style={[styles.cvIconWrapper, { backgroundColor: fileProps.color, overflow: 'hidden' }]}>
              {/* Mini-document UI header */}
              <View style={{ height: 12, backgroundColor: 'rgba(0,0,0,0.2)', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <ThemedText style={{ color: '#FFF', fontSize: 7, fontFamily: Typography.fontFamily.bold }}>{fileProps.label}</ThemedText>
              </View>
              {/* Document Content Mock */}
              <View style={{ flex: 1, padding: 4, gap: 3, width: '100%', alignItems: 'flex-start' }}>
                <View style={{ height: 2, width: '60%', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />
                <View style={{ height: 2, width: '90%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
                <View style={{ height: 2, width: '80%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
                <View style={{ height: 2, width: '85%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
                <View style={{ height: 2, width: '40%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText style={[styles.cvNameText, { color: colors.text }]} numberOfLines={1}>
                {currentFileName}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                {displaySize} MB
              </ThemedText>
            </View>
            {onClearSelectedResume && (
              <TouchableOpacity onPress={onClearSelectedResume} style={{ padding: 8 }}>
                <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableScale
            onPress={onUploadResume}
            style={[
              styles.uploadArea, 
              { 
                borderColor: colors.border, 
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }
            ]}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} style={{marginBottom: 8}} />
                <ThemedText style={[styles.uploadTextBold, { color: colors.text }]}>Nhấn để chọn file tải lên</ThemedText>
                <ThemedText style={[styles.uploadTextSub, { color: colors.textSecondary }]}>Hỗ trợ file PDF, DOCX (Tối đa 10MB)</ThemedText>
              </>
            )}
          </TouchableScale>
        )}

        {!selectedResumeId && existingResumes && existingResumes.length > 0 && (
          <View style={{ gap: 8 }}>
            <ThemedText style={{ fontSize: 12, fontFamily: Typography.fontFamily.medium, color: colors.textSecondary }}>Hoặc chọn từ CV đã lưu:</ThemedText>
            <View style={{ gap: 8, maxHeight: 180, overflow: 'hidden' }}>
              <FlatList
                data={existingResumes}
                keyExtractor={(r) => r.id}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                renderItem={({ item: r }) => {
                  const isSelected = selectedResumeId === r.id;
                  const isReady = r.status === 'ready';
                  return (
                    <TouchableOpacity
                      disabled={!isReady}
                      onPress={() => onSelectExistingResume(r)}
                      style={[
                        styles.existingCvItem,
                        { borderColor: colors.border },
                        isSelected && { borderColor: colors.primary, backgroundColor: 'rgba(37,99,235,0.05)' },
                        !isReady && { opacity: 0.5 }
                      ]}
                    >
                      <ThemedText style={[styles.existingCvName, { color: isSelected ? colors.primary : colors.text }]} numberOfLines={1}>
                        {r.fileName}
                      </ThemedText>
                      <ThemedText style={{fontSize: 11, fontFamily: Typography.fontFamily.bold, color: isSelected ? colors.primary : colors.primary}}>
                        {isSelected ? 'Đã chọn' : isReady ? 'Chọn CV này' : 'Chưa sẵn sàng'}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        )}
      </View>
    </SurfaceCard>
  );
};
