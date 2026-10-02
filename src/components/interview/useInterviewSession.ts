import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { interviewApi } from '@/api/interview.api';
import { useInterviewAudio } from '@/hooks/useInterviewAudio';
import { toast } from '@/components/ui/toast/ToastProvider';
export function useInterviewSession(id: string | undefined) {
  const router = useRouter();
  const [answerText, setAnswerText] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [showQ2BoundaryModal, setShowQ2BoundaryModal] = useState(false);
  const [showQ3BoundaryModal, setShowQ3BoundaryModal] = useState(false);
  const [lastCoaching, setLastCoaching] = useState<any | null>(null);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const attemptedQuestionsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<any>(null);
  // Platform-aware audio hook (native: expo-audio+Azure, web: Web Speech API)
  const onTranscriptionComplete = useCallback((text: string) => {
    setAnswerText((prev) => {
      // For native STT: append transcribed text to existing answer
      // For web STT: the transcript is the full accumulated text
      if (!prev.trim()) return text;
      return `${prev.trim()} ${text}`;
    });
  }, []);
  const audio = useInterviewAudio(id, onTranscriptionComplete);
  const { data: interview, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const reportState = query.state.data?.reportState;
      const questionPrep = query.state.data?.questionPreparationState;
      if (
        status === 'starting' ||
        status === 'completing' ||
        status === 'evaluating' ||
        reportState === 'processing' ||
        questionPrep === 'pending' ||
        questionPrep === 'processing'
      ) {
        return 3000;
      }
      return false;
    }
  });
  // Find unanswered current question
  const answeredQuestionIds = new Set(interview?.answers?.map((a) => a.questionId) || []);
  const currentQuestion = interview?.questions?.find((q) => !answeredQuestionIds.has(q.id));
  // Automatically check completion and navigate to report
  useEffect(() => {
    if (
      interview?.id &&
      (interview.status === 'completed' ||
        interview.status === 'completing' ||
        interview.status === 'evaluating' ||
        interview.reportState === 'ready')
    ) {
      router.replace(`/(app)/interview/report/${interview.id}` as any);
    }
  }, [interview?.status, interview?.reportState, interview?.id, router]);
  // Auto-play TTS question reading on question change
  useEffect(() => {
    if (
      currentQuestion?.id &&
      currentQuestion?.content &&
      !attemptedQuestionsRef.current.has(currentQuestion.id)
    ) {
      attemptedQuestionsRef.current.add(currentQuestion.id);
      audio.speakTts(currentQuestion.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, currentQuestion?.content]);
  // Manual TTS Speaker Toggle
  const toggleTts = useCallback(() => {
    if (currentQuestion?.content) {
      audio.toggleTts(currentQuestion.content);
    }
  }, [audio, currentQuestion]);
  // Answer duration timer (for web; native STT handles its own duration)
  useEffect(() => {
    if (audio.isRecording) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audio.isRecording]);
  // Speech Recognition toggle
  const toggleSpeech = useCallback(() => {
    audio.toggleSpeech();
  }, [audio]);
  // Show STT errors
  useEffect(() => {
    if (audio.sttErrorMessage) {
      toast.error(audio.sttErrorMessage);
    }
  }, [audio.sttErrorMessage]);
  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!currentQuestion) throw new Error('Không có câu hỏi hiện tại');
      if (!answerText.trim()) throw new Error('Vui lòng nhập hoặc thu âm câu trả lời');
      audio.stopTts();
      if (audio.isRecording) {
        audio.toggleSpeech();
      }
      const res = await interviewApi.submitAnswer(id!, {
        questionId: currentQuestion.id,
        content: answerText.trim(),
        durationSeconds,
      });
      return res;
    },
    onSuccess: (data) => {
      setAnswerText('');
      setDurationSeconds(0);
      const isMaxReached = data.isComplete === true && !data.nextQuestion && data.continuation?.state === 'max_questions_reached';
      if (isMaxReached) {
        completeMutation.mutate();
        return;
      }
      const evalData = data.answer?.evaluation || data.answer?.evaluation?.coachingFeedback;
      const isUpgradeRequired = !data.nextQuestion && data.continuation?.state === 'upgrade_required';
      if (isUpgradeRequired) {
        setShowQ3BoundaryModal(true);
      } else if (evalData) {
        setLastCoaching(evalData);
        setShowCoachingModal(true);
      }
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể nộp câu trả lời. Vui lòng thử lại.');
    }
  });
  // Derived AI Presence State
  const aiState: 'idle' | 'speaking' | 'listening' | 'thinking' | 'processing' | 'preparing_audio' =
    submitAnswerMutation.isPending
      ? 'thinking'
      : audio.isProcessingStt
      ? 'processing'
      : audio.isRecording
      ? 'listening'
      : audio.isTtsLoading
      ? 'preparing_audio'
      : audio.isTtsSpeaking
      ? 'speaking'
      : 'idle';
  // Handle continuing from coaching modal
  const handleContinueAfterCoaching = () => {
    setShowCoachingModal(false);
  };
  // Complete Interview mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.completeInterview(id!);
      return res;
    },
    onSuccess: () => {
      setShowQ2BoundaryModal(false);
      setShowQ3BoundaryModal(false);
      setShowCoachingModal(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể hoàn thành phỏng vấn.');
    }
  });
  // Continue Interview mutation (Paid / Deep Continuation)
  const continueMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.continueInterview(id!);
      return res;
    },
    onSuccess: () => {
      setShowQ3BoundaryModal(false);
      setShowCoachingModal(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể tiếp tục phỏng vấn.');
    }
  });
  const retryQuestionPreparationMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.retryQuestionPreparation(id!);
      return res;
    },
    onSuccess: () => {
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể thử lại chuẩn bị câu hỏi.');
    }
  });
  return {
    router,
    interview,
    isLoading,
    isError,
    error,
    currentQuestion,
    answerText,
    setAnswerText,
    isRecording: audio.isRecording,
    isProcessingStt: audio.isProcessingStt,
    toggleSpeech,
    isTtsSpeaking: audio.isTtsSpeaking,
    isTtsLoading: audio.isTtsLoading,
    toggleTts,
    durationSeconds: audio.isRecording ? audio.durationSeconds || durationSeconds : durationSeconds,
    aiState,
    lastCoaching,
    showCoachingModal,
    setShowCoachingModal,
    handleContinueAfterCoaching,
    showQ2BoundaryModal,
    setShowQ2BoundaryModal,
    showQ3BoundaryModal,
    setShowQ3BoundaryModal,
    submitAnswerMutation,
    completeMutation,
    continueMutation,
    retryQuestionPreparationMutation,
    isMicAllowed: audio.isMicAllowed,
  };
}