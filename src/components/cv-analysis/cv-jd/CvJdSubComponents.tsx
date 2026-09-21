import React from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AnalysisTypeSelector,
  FieldBenchmarkCard,
  JobDescriptionCard,
  ResumeUploadCard
} from '@/components/cv-analysis/CVAnalysisForms';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Spacing, Typography } from '@/constants/theme';
import { styles } from '@/app/(tabs)/cv-jd.styles';
import { getFileIconProps, useCvJdTabState } from './useCvJdTabState';

export const PrimaryCvSpotlightCard = React.memo(({
  profile,
  colorScheme,
  colors,
}: {
  profile: any;
  colorScheme: string;
  colors: any;
}) => {
  const fileProps = getFileIconProps(profile?.primaryResume?.fileName);
  return (
    <View style={[styles.contextCardPremium, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: 'rgba(0,0,0,0.05)' }]}>
      <ThemedText style={[styles.dataSourceTitlePremium, { color: colors.textSecondary, marginBottom: 12 }]}>BỐI CẢNH ĐÃ SẴN SÀNG</ThemedText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{
          width: 68,
          height: 90,
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
          overflow: 'visible'
        }}>
          <View style={{ height: 16, backgroundColor: fileProps.color, borderTopLeftRadius: 5, borderTopRightRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
            <ThemedText style={{ color: '#FFF', fontSize: 7, fontFamily: Typography.fontFamily.bold, letterSpacing: 0.5 }}>{fileProps.label}</ThemedText>
          </View>
          <View style={{ padding: 8, gap: 5 }}>
            <View style={{ height: 3, width: '60%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : '#E5E7EB', borderRadius: 2 }} />
            <View style={{ height: 3, width: '90%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '80%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '85%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '40%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
          </View>

          <View style={{ position: 'absolute', bottom: -6, right: -6, backgroundColor: '#10B981', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF', boxShadow: '0px 2px 4px rgba(16, 185, 129, 0.3)' }}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        </View>

        <View style={{ flex: 1, gap: 10 }}>
          <View>
            <ThemedText style={styles.contextItemLabelPremium}>CV chính:</ThemedText>
            <ThemedText style={styles.contextItemValuePremium} numberOfLines={1}>{profile?.primaryResume?.fileName || 'Chưa thiết lập'}</ThemedText>
          </View>

          <View style={[styles.contextDivider, { marginVertical: 0, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

          <View>
            <ThemedText style={styles.contextItemLabelPremium}>Mục tiêu nghề nghiệp:</ThemedText>
            <ThemedText style={styles.contextItemValuePremium} numberOfLines={1}>
              {profile?.activeCareerGoal?.targetRole || 'Chưa thiết lập'}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
});

export const AnalysisHistoryItemCard = React.memo(({
  item,
  profile,
  colors,
  onSetPrimary,
  isSettingPrimary,
  onViewResult,
}: {
  item: any;
  profile: any;
  colors: any;
  onSetPrimary: (resumeId: string) => void;
  isSettingPrimary: boolean;
  onViewResult: () => void;
}) => {
  const isTargeted = item.mode === 'job_targeted';
  const isPrimary = profile?.primaryResume?.id === item.resumeId;
  const dateObj = new Date(item.createdAt);
  const dateStr = dateObj.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <View style={[styles.historyCard, { backgroundColor: '#fff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <View style={styles.historyCardTop}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Badge variant={isTargeted ? 'primary' : 'secondary'} size="sm" style={isTargeted ? { backgroundColor: '#F3E8FF' } : {}}>
            <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: isTargeted ? '#7E22CE' : colors.text }}>{isTargeted ? 'Theo JD mục tiêu' : 'Chuẩn thị trường'}</ThemedText>
          </Badge>
          {isPrimary && (
            <Badge variant="warning" size="sm" style={{ backgroundColor: '#FEF3C7' }}>
              <Ionicons name="star" size={10} color="#D97706" />
              <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: '#D97706', marginLeft: 4 }}>CV chính</ThemedText>
            </Badge>
          )}
        </View>
        <Badge variant="success" size="sm" style={{ backgroundColor: '#DCFCE7' }}>
          <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: '#15803D' }}>Hoàn thành</ThemedText>
        </Badge>
      </View>

      <View style={styles.nestedContextBox}>
        <View style={styles.nestedContextTop}>
          <ThemedText style={styles.nestedContextLabel}>Bối cảnh đối chiếu:</ThemedText>
          <ThemedText style={styles.nestedContextDate}>{dateStr}</ThemedText>
        </View>

        <ThemedText style={styles.historyContextTitle} numberOfLines={2}>
          {isTargeted ? 'Phân tích CV theo JD' : (item.context?.targetRole || 'Định hướng chuẩn ngành')}
          {item.context?.seniority ? ` (${item.context.seniority})` : ''}
        </ThemedText>

        {item.context?.industry && (
          <ThemedText style={styles.nestedContextIndustry}>
            Ngành: <ThemedText style={{ fontFamily: Typography.fontFamily.semibold, color: '#111827' }}>{item.context.industry}</ThemedText>
          </ThemedText>
        )}
      </View>

      <View style={styles.historyActions}>
        <View style={{ flex: 1 }}>
          {!isPrimary && item.resumeId ? (
            <TouchableOpacity
              onPress={() => onSetPrimary(item.resumeId)}
              style={styles.btnSecondary}
              disabled={isSettingPrimary}
            >
              {isSettingPrimary ? (
                <ActivityIndicator size="small" color="#111827" />
              ) : (
                <ThemedText style={styles.btnSecondaryText}>Đặt làm CV chính</ThemedText>
              )}
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <TouchableOpacity
            onPress={onViewResult}
            style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="eye" size={16} color="#fff" />
            <ThemedText style={styles.btnPrimaryText}>Xem kết quả</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export const CvJdHistorySection = React.memo(({
  isHistoryLoading,
  currentHistoryItems,
  profile,
  colors,
  setPrimaryResumeMutation,
  router,
}: {
  isHistoryLoading: boolean;
  currentHistoryItems: any[];
  profile: any;
  colors: any;
  setPrimaryResumeMutation: any;
  router: any;
}) => (
  <View style={styles.historySection}>
    <View style={styles.historyHeader}>
      <Ionicons name="time" size={20} color={colors.text} />
      <ThemedText style={styles.historyTitle}>Lịch sử phân tích</ThemedText>
    </View>

    {isHistoryLoading ? (
      <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
    ) : currentHistoryItems.length ? (
      <View style={{ gap: 12 }}>
        {currentHistoryItems.map((item: any) => (
          <AnalysisHistoryItemCard
            key={item.id}
            item={item}
            profile={profile}
            colors={colors}
            onSetPrimary={(resumeId) => setPrimaryResumeMutation.mutate(resumeId)}
            isSettingPrimary={setPrimaryResumeMutation.isPending}
            onViewResult={() => router.push(`/(app)/cv-analysis/${item.id}` as any)}
          />
        ))}
      </View>
    ) : (
      <View style={{ alignItems: 'center', marginTop: 24, padding: 24, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16 }}>
        <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12, opacity: 0.5 }} />
        <ThemedText style={[styles.emptyHistory, { color: colors.textSecondary }]}>
          Bạn chưa thực hiện bài phân tích nào. Hãy bắt đầu ngay để khám phá tiềm năng hồ sơ của bạn.
        </ThemedText>
      </View>
    )}
  </View>
));

export const CvJdFloatingPagination = React.memo(({
  showFloatingNav,
  totalHistoryPages,
  historyPage,
  hasNextPage,
  colorScheme,
  colors,
  onPrev,
  onNext,
}: {
  showFloatingNav: boolean;
  totalHistoryPages: number;
  historyPage: number;
  hasNextPage: boolean;
  colorScheme: string;
  colors: any;
  onPrev: () => void;
  onNext: () => void;
}) => {
  if (!showFloatingNav || totalHistoryPages <= 1) return null;
  return (
    <View style={styles.floatingNavContainer}>
      <View style={[styles.inlineNavContainer, {
        backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#fff',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      }]}>
        <TouchableScale
          style={[styles.miniPageBtn, historyPage === 1 ? styles.disabledButton : null]}
          disabled={historyPage === 1}
          onPress={onPrev}
        >
          <Ionicons name="chevron-back" size={16} color={historyPage === 1 ? colors.textSecondary : colors.primary} />
          <ThemedText style={[styles.miniPageBtnText, { color: historyPage === 1 ? colors.textSecondary : colors.text }]}>
            Trước
          </ThemedText>
        </TouchableScale>

        <ThemedText style={[styles.inlinePageIndicator, { color: colors.text, marginHorizontal: 16 }]}>
          Trang {historyPage}/{totalHistoryPages}
        </ThemedText>

        <TouchableScale
          style={[styles.miniPageBtn, (!hasNextPage) ? styles.disabledButton : null]}
          disabled={!hasNextPage}
          onPress={onNext}
        >
          <ThemedText style={[styles.miniPageBtnText, { color: (!hasNextPage) ? colors.textSecondary : colors.text }]}>
            Sau
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={(!hasNextPage) ? colors.textSecondary : colors.primary} />
        </TouchableScale>
      </View>
    </View>
  );
});

export const CurrentProfileSection = React.memo(({
  profile, colorScheme, colors, mode, setMode, jdTitle, setJdTitle, jdContent, setJdContent, analyzeMutation, handleStartAnalysis,
}: any) => (
  <View style={{ gap: Spacing.four }}>
    <PrimaryCvSpotlightCard profile={profile} colorScheme={colorScheme} colors={colors} />
    <AnalysisTypeSelector mode={mode} setMode={setMode} colors={colors} colorScheme={colorScheme} defaultTargetRole={profile?.activeCareerGoal?.targetRole} isCustomProfile={false} />
    {mode === 'job_targeted' && (
      <JobDescriptionCard jdTitle={jdTitle} setJdTitle={setJdTitle} jdContent={jdContent} setJdContent={setJdContent} colors={colors} />
    )}
    <TouchableScale
      style={[styles.primaryButtonPremium, (analyzeMutation.isPending || !profile?.primaryResume) && styles.disabledButtonPremium]}
      onPress={handleStartAnalysis}
      disabled={analyzeMutation.isPending || !profile?.primaryResume}
    >
      {analyzeMutation.isPending ? <ActivityIndicator color="#fff" /> : (
        <>
          <ThemedText style={styles.primaryButtonTextPremium}>Phân tích độ phù hợp</ThemedText>
          <View style={styles.buttonIconWrapPremium}><Ionicons name="rocket" size={16} color="#FFF" /></View>
        </>
      )}
    </TouchableScale>
  </View>
));

export const CustomProfileSection = React.memo(({
  isUploading, colors, colorScheme, handleUploadResume, userResumes, selectedResumeId, setSelectedResumeId, currentFileName, setCurrentFileName, mode, setMode, jdTitle, setJdTitle, jdContent, setJdContent, industry, setIndustry, targetRole, setTargetRole, seniority, setSeniority, analyzeMutation, handleStartAnalysis,
}: any) => (
  <View style={{ gap: Spacing.four }}>
    <ResumeUploadCard
      isUploading={isUploading}
      colors={colors}
      colorScheme={colorScheme}
      onUploadResume={handleUploadResume}
      existingResumes={userResumes}
      selectedResumeId={selectedResumeId}
      onSelectExistingResume={(r: any) => { setSelectedResumeId(r.id); setCurrentFileName(r.fileName); }}
      onClearSelectedResume={() => { setSelectedResumeId(null); setCurrentFileName(null); }}
      currentFileName={currentFileName}
    />
    <AnalysisTypeSelector mode={mode} setMode={setMode} colors={colors} colorScheme={colorScheme} isCustomProfile={true} />
    {mode === 'job_targeted' ? (
      <JobDescriptionCard jdTitle={jdTitle} setJdTitle={setJdTitle} jdContent={jdContent} setJdContent={setJdContent} colors={colors} />
    ) : (
      <FieldBenchmarkCard industry={industry} setIndustry={setIndustry} targetRole={targetRole} setTargetRole={setTargetRole} seniority={seniority} setSeniority={setSeniority} colors={colors} />
    )}
    <TouchableScale
      style={[styles.primaryButtonPremium, (analyzeMutation.isPending || !selectedResumeId) && styles.disabledButtonPremium]}
      onPress={handleStartAnalysis}
      disabled={analyzeMutation.isPending || !selectedResumeId}
    >
      {analyzeMutation.isPending ? <ActivityIndicator color="#fff" /> : (
        <>
          <ThemedText style={styles.primaryButtonTextPremium}>Phân tích độ phù hợp</ThemedText>
          <View style={styles.buttonIconWrapPremium}><Ionicons name="rocket" size={16} color="#FFF" /></View>
        </>
      )}
    </TouchableScale>
  </View>
));

export const ToggleItem = React.memo(({
  active,
  title,
  subtitle,
  onPress,
  colorScheme,
  colors,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
  colorScheme: string;
  colors: any;
}) => {
  const activeBg = colorScheme === 'dark' ? '#374151' : '#FFFFFF';
  const activeColor = colorScheme === 'dark' ? colors.primaryLight : colors.primary;
  const textColor = active ? activeColor : colors.text;
  const subColor = active ? activeColor : colors.textSecondary;

  return (
    <TouchableScale
      style={[styles.toggleBtnPremium, active && [styles.toggleBtnActivePremium, { backgroundColor: activeBg }]]}
      onPress={onPress}
    >
      <ThemedText style={[styles.toggleBtnTextPremium, { color: textColor }]}>{title}</ThemedText>
      <ThemedText style={{ fontSize: 10, color: subColor, marginTop: 2 }}>{subtitle}</ThemedText>
    </TouchableScale>
  );
});

export const DataSourceToggleBar = React.memo(({
  useCurrentProfile,
  setUseCurrentProfile,
  mode,
  setMode,
  colorScheme,
  colors,
}: {
  useCurrentProfile: boolean;
  setUseCurrentProfile: (v: boolean) => void;
  mode: string;
  setMode: (m: any) => void;
  colorScheme: string;
  colors: any;
}) => {
  const onSelectCurrent = () => {
    setUseCurrentProfile(true);
    if (mode === 'field_benchmark') setMode('standard');
  };

  const onSelectCustom = () => {
    setUseCurrentProfile(false);
    if (mode === 'standard') setMode('field_benchmark');
  };

  const wrapBg = colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

  return (
    <View style={styles.dataSourceContainerPremium}>
      <ThemedText style={[styles.dataSourceTitlePremium, { color: colors.textSecondary }]}>NGUỒN DỮ LIỆU PHÂN TÍCH</ThemedText>
      <View style={[styles.toggleWrapPremium, { backgroundColor: wrapBg }]}>
        <ToggleItem
          active={useCurrentProfile}
          title="Dùng hồ sơ hiện tại"
          subtitle="CV chính + mục tiêu nghề nghiệp"
          onPress={onSelectCurrent}
          colorScheme={colorScheme}
          colors={colors}
        />
        <ToggleItem
          active={!useCurrentProfile}
          title="Tùy chỉnh lần phân tích"
          subtitle="CV+mục tiêu riêng cho lần này"
          onPress={onSelectCustom}
          colorScheme={colorScheme}
          colors={colors}
        />
      </View>
    </View>
  );
});

export const CvJdFormContent = React.memo(({
  state,
  colorScheme,
  colors,
}: {
  state: ReturnType<typeof useCvJdTabState>;
  colorScheme: string;
  colors: any;
}) => (
  <View>
    <DataSourceToggleBar
      useCurrentProfile={state.useCurrentProfile}
      setUseCurrentProfile={state.setUseCurrentProfile}
      mode={state.mode}
      setMode={state.setMode}
      colorScheme={colorScheme}
      colors={colors}
    />

    {state.useCurrentProfile ? (
      <CurrentProfileSection
        profile={state.profile}
        colorScheme={colorScheme}
        colors={colors}
        mode={state.mode}
        setMode={state.setMode}
        jdTitle={state.jdTitle}
        setJdTitle={state.setJdTitle}
        jdContent={state.jdContent}
        setJdContent={state.setJdContent}
        analyzeMutation={state.analyzeMutation}
        handleStartAnalysis={state.handleStartAnalysis}
      />
    ) : (
      <CustomProfileSection
        isUploading={state.isUploading}
        colors={colors}
        colorScheme={colorScheme}
        handleUploadResume={state.handleUploadResume}
        userResumes={state.userResumes}
        selectedResumeId={state.selectedResumeId}
        setSelectedResumeId={state.setSelectedResumeId}
        currentFileName={state.currentFileName}
        setCurrentFileName={state.setCurrentFileName}
        mode={state.mode}
        setMode={state.setMode}
        jdTitle={state.jdTitle}
        setJdTitle={state.setJdTitle}
        jdContent={state.jdContent}
        setJdContent={state.setJdContent}
        industry={state.industry}
        setIndustry={state.setIndustry}
        targetRole={state.targetRole}
        setTargetRole={state.setTargetRole}
        seniority={state.seniority}
        setSeniority={state.setSeniority}
        analyzeMutation={state.analyzeMutation}
        handleStartAnalysis={state.handleStartAnalysis}
      />
    )}

    <CvJdHistorySection
      isHistoryLoading={state.isHistoryLoading}
      currentHistoryItems={state.currentHistoryItems}
      profile={state.profile}
      colors={colors}
      setPrimaryResumeMutation={state.setPrimaryResumeMutation}
      router={state.router}
    />
  </View>
));

export const LatestAnalysisModal = React.memo(({
  visible,
  latestCompletedAnalysis,
  colors,
  colorScheme,
  doNotShowAgain,
  onClose,
  onViewResult,
  onToggleDoNotShow,
}: {
  visible: boolean;
  latestCompletedAnalysis: any;
  colors: any;
  colorScheme: string;
  doNotShowAgain: boolean;
  onClose: () => void;
  onViewResult: (id: string) => void;
  onToggleDoNotShow: () => void;
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlayPremium}>
      {latestCompletedAnalysis && (
        <SurfaceCard style={[styles.modalCardPremium, { backgroundColor: colors.background, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <View style={{ padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="checkmark-done" size={20} color="#10B981" />
              </View>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ThemedText style={{ fontSize: 11, fontFamily: Typography.fontFamily.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              KẾT QUẢ ĐÃ SẴN SÀNG
            </ThemedText>
            <ThemedText style={{ fontSize: 24, fontFamily: Typography.fontFamily.bold, color: colors.text }}>
              Bản phân tích gần nhất
            </ThemedText>
          </View>

          <View style={{ padding: 24, gap: 16 }}>
            <View style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Chế độ</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text }}>
                  {latestCompletedAnalysis.mode === 'job_targeted' ? 'Đánh giá theo JD' : 'Tiêu chuẩn ngành'}
                </ThemedText>
              </View>
              <View style={{ height: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Mục tiêu</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text, maxWidth: 180 }} numberOfLines={1}>
                  {latestCompletedAnalysis.mode === 'job_targeted' ? 'Mô tả công việc (JD)' : (latestCompletedAnalysis.context?.targetRole || 'Mặc định')}
                </ThemedText>
              </View>
              <View style={{ height: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Thời gian</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text }}>
                  {new Date(latestCompletedAnalysis.createdAt).toLocaleDateString('vi-VN')}
                </ThemedText>
              </View>
            </View>

            <TouchableScale
              onPress={() => onViewResult(latestCompletedAnalysis.id)}
              style={{ backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4 }}
            >
              <ThemedText style={{ color: '#fff', fontSize: 15, fontFamily: Typography.fontFamily.semibold }}>Xem ngay kết quả</ThemedText>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableScale>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
              onPress={onToggleDoNotShow}
              activeOpacity={0.7}
            >
              <View style={[{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' }, doNotShowAgain && { backgroundColor: colors.textSecondary, borderColor: colors.textSecondary }]}>
                {doNotShowAgain && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>
                Không hiện lại hộp thoại này
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SurfaceCard>
      )}
    </View>
  </Modal>
));
