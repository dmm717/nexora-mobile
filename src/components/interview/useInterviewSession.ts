import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { interviewApi } from '@/api/interview.api';
import { speechService } from '@/services/speech';
import { ttsService } from '@/services/tts';

export function useInterviewSession(id: string | undefined) {
  const router = useRouter();

  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [showQ2BoundaryModal, setShowQ2BoundaryModal] = useState(false);
  const [showQ3BoundaryModal, setShowQ3BoundaryModal] = useState(false);
  const [lastCoaching, setLastCoaching] = useState<any | null>(null);

  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null);
  const attemptedQuestionsRef = useRef<Set<string>>(new Set());

  const timerRef = useRef<any>(null);

  // Check browser mic permission on load
  useEffect(() => {
    let active = true;
    async function checkMicPermission() {
      const state = await speechService.checkPermission();
      if (!active) return;
      if (state === 'denied') {
        setIsMicAllowed(false);
      } else if (state === 'granted') {
        setIsMicAllowed(true);
      }
    }
    checkMicPermission();
    return () => {
      active = false;
    };
  }, []);

  const { data: interview, isLoading, refetch } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const reportState = query.state.data?.reportState;
      if (
        status === 'starting' ||
        status === 'completing' ||
        status === 'evaluating' ||
        reportState === 'processing'
      ) {
        return 3000;
      }
      return false;
    }
  });

  // Find unanswered current question
  const answeredQuestionIds = new Set(interview?.answers?.map((a) => a.questionId) || []);
  const currentQuestion = interview?.questions?.find((q) => !answeredQuestionIds.has(q.id));

  // Automatically check completion and navigate to report when completing/evaluating/completed
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

  // Auto-play TTS question reading on question change (AutoSpeak)
  useEffect(() => {
    if (
      currentQuestion?.id &&
      currentQuestion?.content &&
      !attemptedQuestionsRef.current.has(currentQuestion.id)
    ) {
      attemptedQuestionsRef.current.add(currentQuestion.id);
      setIsTtsSpeaking(true);
      ttsService.speak(
        currentQuestion.content,
        id,
        () => setIsTtsSpeaking(false),
        () => setIsTtsSpeaking(false)
      );
    }
    return () => {
      ttsService.stop();
      setIsTtsSpeaking(false);
    };
  }, [currentQuestion?.id, currentQuestion?.content, id]);

  // Manual TTS Speaker Toggle
  const toggleTts = () => {
    if (isTtsSpeaking) {
      ttsService.stop();
      setIsTtsSpeaking(false);
    } else if (currentQuestion?.content) {
      if (isRecording) {
        speechService.stopListening();
        setIsRecording(false);
      }
      setIsTtsSpeaking(true);
      ttsService.speak(
        currentQuestion.content,
        id,
        () => setIsTtsSpeaking(false),
        () => setIsTtsSpeaking(false)
      );
    }
  };

  // Answer duration timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const speechBaseTextRef = useRef<string>('');

  // Speech Recognition toggle
  const toggleSpeech = () => {
    if (isTtsSpeaking) {
      ttsService.stop();
      setIsTtsSpeaking(false);
    }

    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      speechBaseTextRef.current = answerText;
      setIsRecording(true);
      speechService.startListening(
        {
          onResult: (transcript) => {
            setAnswerText(transcript);
          },
          onError: (err) => {
            Alert.alert('Thông báo Microphone', String(err));
            setIsRecording(false);
          },
          onEnd: () => {
            setIsRecording(false);
          },
        },
        answerText
      );
    }
  };

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!currentQuestion) throw new Error('Không có câu hỏi hiện tại');
      if (!answerText.trim()) throw new Error('Vui lòng nhập hoặc thu âm câu trả lời');

      ttsService.stop();
      setIsTtsSpeaking(false);
      if (isRecording) {
        speechService.stopListening();
        setIsRecording(false);
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
      setIsRecording(false);
      setIsTtsSpeaking(false);
      ttsService.stop();

      const evalData = data.answer?.evaluation || data.answer?.evaluation?.coachingFeedback;
      if (evalData) {
        setLastCoaching(evalData);
        setShowCoachingModal(true);
      } else {
        // Match Web FE: Seamless transition without forced Q2/Q3 popups
        const isUpgradeRequired = !data.nextQuestion && data.continuation?.state === 'upgrade_required';
        if (isUpgradeRequired) {
          setShowQ3BoundaryModal(true);
        }
      }

      refetch();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi nộp bài', err.message || 'Không thể nộp câu trả lời. Vui lòng thử lại.');
    }
  });

  // Derived AI Presence State
  const aiState: 'idle' | 'speaking' | 'listening' | 'thinking' =
    submitAnswerMutation.isPending
      ? 'thinking'
      : isRecording
      ? 'listening'
      : isTtsSpeaking
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
      Alert.alert('Lỗi', err.message || 'Không thể hoàn thành phỏng vấn.');
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
      Alert.alert('Lỗi', err.message || 'Không thể tiếp tục phỏng vấn.');
    }
  });

  return {
    router,
    interview,
    isLoading,
    currentQuestion,
    answerText,
    setAnswerText,
    isRecording,
    toggleSpeech,
    isTtsSpeaking,
    toggleTts,
    durationSeconds,
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
    isMicAllowed,
  };
}
