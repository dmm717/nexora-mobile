import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { interviewApi } from '@/api/interview.api';
import { jobDescriptionsApi } from '@/api/job-descriptions.api';
import { profileApi } from '@/api/profile.api';
import { resumesApi } from '@/api/resumes.api';
import { ExitConfirmationModal } from '@/components/interview/InterviewSubComponents';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/interview-preflight.styles';


import { PreflightHeroBanner } from '@/components/interview/preflight/PreflightHeroBanner';
import { CombinedPreflightCard } from '@/components/interview/preflight/CombinedPreflightCard';
import { PreflightTypeCard } from '@/components/interview/preflight/PreflightTypeCard';
import { MicCheckCard } from '@/components/interview/preflight/MicCheckCard';
import { EntranceActionCard } from '@/components/interview/preflight/EntranceActionCard';
import { toast } from '@/components/ui/toast/ToastProvider';

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

  const jdIdempotencyRef = useRef<string | null>(null);
  const interviewIdempotencyRef = useRef<string | null>(null);

  const startMutation = useMutation({
    mutationFn: async () => {
      let finalJdId = selectedJdId;

      if (!role.trim()) {
        throw new Error('Vui lòng nhập vai trò mục tiêu cho phiên phỏng vấn.');
      }

      if (interviewType === 'cv_targeted') {
        const resume = resumes?.find(r => r.id === selectedResumeId);
        if (!resume || resume.status !== 'ready') {
           throw new Error('Chủ đề phỏng vấn theo CV yêu cầu bạn phải chọn một bản CV ở trạng thái Sẵn sàng (Ready).');
        }
      }

      if (interviewType === 'jd_targeted') {
        if (jdMode === 'new') {
          if (!newJdTitle.trim() || !newJdContent.trim()) {
            throw new Error('Vui lòng nhập tiêu đề và nội dung Job Description mới');
          }
          if (!jdIdempotencyRef.current) jdIdempotencyRef.current = require('../../../utils/uuid').generateIdempotencyKey();
          
          const createdJd = await jobDescriptionsApi.create({
            title: newJdTitle.trim(),
            content: newJdContent.trim(),
          }, jdIdempotencyRef.current || undefined);
          finalJdId = createdJd.id;
        } else {
          if (!finalJdId) {
            throw new Error('Vui lòng chọn một Job Description đã lưu hoặc tạo JD mới.');
          }
        }
      }

      if (!interviewIdempotencyRef.current) interviewIdempotencyRef.current = require('../../../utils/uuid').generateIdempotencyKey();

      const res = await interviewApi.start({
        role: role.trim() || undefined,
        seniority: seniority || undefined,
        interviewType: interviewType,
        difficulty: difficulty,
        resumeId: interviewType === 'cv_targeted' ? selectedResumeId! : undefined,
        jobDescriptionId: interviewType === 'jd_targeted' ? finalJdId! : undefined,
        careerGoalId: selectedGoalId || undefined,
      }, interviewIdempotencyRef.current || undefined);
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interview-history'] });
      queryClient.invalidateQueries({ queryKey: ['progress-dashboard'] });
      router.replace(`/(app)/interview/${data.id}?micMode=${micMode}` as any);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể khởi tạo phiên phỏng vấn. Vui lòng thử lại.');
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
                interviewType={interviewType}
                resumes={resumes}
                selectedResumeId={selectedResumeId}
                setSelectedResumeId={setSelectedResumeId}
                jobDescriptions={jobDescriptions}
                jdMode={jdMode}
                setJdMode={setJdMode}
                selectedJdId={selectedJdId}
                setSelectedJdId={setSelectedJdId}
                newJdTitle={newJdTitle}
                setNewJdTitle={setNewJdTitle}
                newJdContent={newJdContent}
                setNewJdContent={setNewJdContent}
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