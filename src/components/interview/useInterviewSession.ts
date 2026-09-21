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

  const timerRef = useRef<any>(null);

  const { data: interview, isLoading, refetch } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'starting' || status === 'completing') {
        return 3000;
      }
      return false;
    }
  });

  // Automatically check completion and navigate to report when completed
  useEffect(() => {
    if (interview?.status === 'completed' && interview.id) {
      router.replace(`/(app)/interview/report/${interview.id}` as any);
    }
  }, [interview?.status, interview?.id, router]);

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

  // Speech Recognition toggle
  const toggleSpeech = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechService.startListening({
        onResult: (transcript) => {
          setAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        onError: (err) => {
          Alert.alert('Lỗi thu âm', err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
    }
  };

  // Find unanswered current question
  const answeredQuestionIds = new Set(interview?.answers?.map((a) => a.questionId) || []);
  const currentQuestion = interview?.questions?.find((q) => !answeredQuestionIds.has(q.id));

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!currentQuestion) throw new Error('Không có câu hỏi hiện tại');
      if (!answerText.trim()) throw new Error('Vui lòng nhập hoặc thu âm câu trả lời');

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
      ttsService.stop();

      // Check boundary after answer 2 & answer 3
      const newAnswerCount = (interview?.answers.length || 0) + 1;
      if (data.answer?.evaluation?.coachingFeedback) {
        setLastCoaching(data.answer.evaluation.coachingFeedback);
      } else if (data.answer?.evaluation) {
        setLastCoaching(data.answer.evaluation);
      }

      if (newAnswerCount === 2) {
        setShowQ2BoundaryModal(true);
      } else if (newAnswerCount === 3) {
        setShowQ3BoundaryModal(true);
      }

      refetch();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi nộp bài', err.message || 'Không thể nộp câu trả lời. Vui lòng thử lại.');
    }
  });

  // Complete Interview mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.completeInterview(id!);
      return res;
    },
    onSuccess: () => {
      setShowQ2BoundaryModal(false);
      setShowQ3BoundaryModal(false);
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
    durationSeconds,
    lastCoaching,
    showQ2BoundaryModal,
    setShowQ2BoundaryModal,
    showQ3BoundaryModal,
    setShowQ3BoundaryModal,
    submitAnswerMutation,
    completeMutation,
    continueMutation,
  };
}
