import { apiClient } from './client';
import { PresignUploadRequest, UploadIntent, FinalizeResumeRequest, ResumeView } from './types';

export const resumesApi = {
  /**
   * Yêu cầu presigned URL để upload file (S3)
   */
  presign: async (request: PresignUploadRequest): Promise<UploadIntent> => {
    const res = await apiClient.post<{ data?: UploadIntent } | UploadIntent>('/uploads/presign', request);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as UploadIntent);
  },

  /**
   * Upload file bytes (binary) lên URL đã presigned
   */
  uploadRawBytes: async (uploadUrl: string, fileBytes: ArrayBuffer, contentType: string): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: fileBytes,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  },

  /**
   * Xác nhận hoàn tất upload resume
   */
  finalize: async (request: FinalizeResumeRequest): Promise<ResumeView> => {
    const res = await apiClient.post<{ data?: ResumeView } | ResumeView>('/resumes', request);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ResumeView);
  },

  /**
   * Lấy danh sách resumes
   */
  list: async (): Promise<ResumeView[]> => {
    const res = await apiClient.get<{ data?: ResumeView[] } | ResumeView[]>('/resumes');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ResumeView[]);
  },

  /**
   * Lấy chi tiết resume
   */
  get: async (id: string): Promise<ResumeView> => {
    const res = await apiClient.get<{ data?: ResumeView } | ResumeView>(`/resumes/${id}`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ResumeView);
  }
};
