import { apiClient } from './client';
import { PresignUploadRequest, UploadIntent, FinalizeResumeRequest, ResumeView } from './types';

export const resumesApi = {
  /**
   * Yêu cầu presigned URL để upload file (S3)
   */
  presign: async (request: PresignUploadRequest): Promise<UploadIntent> => {
    const res = await apiClient.post<any>('/uploads/presign', request);
    const data = res.data?.data ?? res.data;
    return data as UploadIntent;
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
    const res = await apiClient.post<any>('/resumes', request);
    const data = res.data?.data ?? res.data;
    return data as ResumeView;
  },

  /**
   * Lấy danh sách resumes (Bảo đảm luôn trả về mảng hợp lệ)
   */
  list: async (): Promise<ResumeView[]> => {
    try {
      const res = await apiClient.get<any>('/resumes');
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.data)) return raw.data;
      if (raw && Array.isArray(raw.items)) return raw.items;
      return [];
    } catch (err: any) {
      if (err?.status === 404 || err?.code === 'NOT_FOUND' || err?.response?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  /**
   * Lấy chi tiết resume
   */
  get: async (id: string): Promise<ResumeView> => {
    const res = await apiClient.get<any>(`/resumes/${id}`);
    const data = res.data?.data ?? res.data;
    return data as ResumeView;
  }
};
