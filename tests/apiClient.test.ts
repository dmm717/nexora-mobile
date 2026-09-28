import { apiClient } from '../src/api/client';
import axios from 'axios';
import { tokenStorage } from '../src/services/storage';

// Mock các module
jest.mock('axios', () => {
  const originalAxios = jest.requireActual('axios');
  const mockAxiosInstance = Object.assign(jest.fn().mockResolvedValue('success'), {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: { headers: {} },
    get: jest.fn(),
    post: jest.fn(),
  });
  return {
    ...originalAxios,
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(),
  };
});

jest.mock('../src/services/storage', () => ({
  tokenStorage: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setAccessToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

jest.mock('../src/components/ui/toast/ToastProvider', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

// Lấy tham chiếu đến interceptor
const responseInterceptor = (apiClient.interceptors.response.use as jest.Mock).mock.calls[0][1];

describe('apiClient Interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('không trigger refresh token khi 401 ở /auth/login', async () => {
    const error = {
      response: { status: 401 },
      config: { url: '/auth/login' },
    };
    
    await expect(responseInterceptor(error)).rejects.toThrow();
    expect(tokenStorage.getRefreshToken).not.toHaveBeenCalled();
  });

  it('đảm bảo single-flight queue hoạt động cho 401', async () => {
    // Giả lập axios.post (/auth/refresh) mất một chút thời gian
    (axios.post as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: { data: { accessToken: 'new-token' } }
      }), 100))
    );
    
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue('old-rt');
    
    // Tạo 3 request bị 401 đồng thời
    const req1 = responseInterceptor({
      response: { status: 401 },
      config: { url: '/user/profile', headers: {} },
    });
    
    // Các request sau vào queue (isRefreshing = true)
    const req2 = responseInterceptor({
      response: { status: 401 },
      config: { url: '/user/settings', headers: {} },
    });

    // Mock apiClient thực thi lại request sau khi có token
    
    await Promise.all([req1, req2]);
    
    // post /auth/refresh chỉ gọi 1 lần
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(tokenStorage.setAccessToken).toHaveBeenCalledWith('new-token');
  });
});
