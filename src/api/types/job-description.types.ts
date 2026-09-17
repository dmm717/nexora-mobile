export interface JobDescriptionView {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateJobDescriptionRequest {
  title: string;
  content: string;
}
