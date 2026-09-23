export type FeedbackModerationStatus = 'pending' | 'approved' | 'rejected';

export interface FeedbackRequest {
  rating: number; // 1 to 5
  comment?: string | null;
  allowPublicDisplay: boolean;
}

export interface FeedbackResponse {
  id: string;
  rating: number;
  comment: string | null;
  allowPublicDisplay: boolean;
  moderationStatus: FeedbackModerationStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  moderatedAt?: string | null;
  publishedAt?: string | null;
}

export interface PublicFeedbackItem {
  id: string;
  displayName: string;
  rating: number;
  comment: string;
  publishedAt: string;
  avatarUrl?: string | null;
}

export interface PublicFeedbackPageResponse {
  averageRating: number | null;
  ratingCount: number;
  items: PublicFeedbackItem[];
}
