import { apiClient, API_BASE_URL } from './client';
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
  uploadRawBytes: async (uploadUrl: string, fileBytes: ArrayBuffer | Blob, contentType: string): Promise<void> => {
    let finalUrl = uploadUrl;
    if (uploadUrl.startsWith('/')) {
      try {
        const baseUrlObj = new URL(API_BASE_URL);
        finalUrl = `${baseUrlObj.origin}${uploadUrl}`;
      } catch {
        finalUrl = `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}${uploadUrl}`;
      }
    }

    const response = await fetch(finalUrl, {
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

  get: async (id: string): Promise<ResumeView> => {
    const res = await apiClient.get<any>(`/resumes/${id}`);
    const data = res.data?.data ?? res.data;
    return data as ResumeView;
  },

  /**
   * Xóa một resume
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/resumes/${id}`);
  }
};
