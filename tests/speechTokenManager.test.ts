import { createSpeechTokenManager, SPEECH_TOKEN_MIN_VALIDITY_MS } from '../src/services/speechTokenManager';

describe('speechTokenManager', () => {
  const getFutureDate = (ms: number = 2 * SPEECH_TOKEN_MIN_VALIDITY_MS) => 
    new Date(Date.now() + ms).toISOString();
  
  const getPastDate = () => new Date(Date.now() - 1000).toISOString();

  it('từ chối token hết hạn hoặc malformed', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      token: 'fake',
      region: 'fake',
      expiresAt: getPastDate() // Đã hết hạn
    });

    const manager = createSpeechTokenManager(mockFetcher);
    
    await expect(manager.getInterviewSpeechAuthorization('123')).rejects.toThrow('Speech authorization is malformed or expires too soon.');
    
    // Malformed
    const mockFetcher2 = jest.fn().mockResolvedValue({
      token: '', // rỗng
      region: 'fake',
      expiresAt: getFutureDate()
    });
    const manager2 = createSpeechTokenManager(mockFetcher2);
    await expect(manager2.getInterviewSpeechAuthorization('123')).rejects.toThrow('Speech authorization is malformed or expires too soon.');
  });

  it('đảm bảo single-flight khi gọi đồng thời', async () => {
    const mockFetcher = jest.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve({
        token: 'valid_token',
        region: 'valid_region',
        expiresAt: getFutureDate()
      }), 100));
    });

    const manager = createSpeechTokenManager(mockFetcher);

    // Gọi đồng thời 3 lần
    const promise1 = manager.getInterviewSpeechAuthorization('456');
    const promise2 = manager.getInterviewSpeechAuthorization('456');
    const promise3 = manager.getInterviewSpeechAuthorization('456');

    await Promise.all([promise1, promise2, promise3]);

    // fetcher chỉ được gọi đúng 1 lần
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('clear cache hoạt động', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      token: 'valid',
      region: 'valid',
      expiresAt: getFutureDate()
    });

    const manager = createSpeechTokenManager(mockFetcher);

    await manager.getInterviewSpeechAuthorization('789'); // Gọi lần 1, lưu cache
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    await manager.getInterviewSpeechAuthorization('789'); // Trúng cache
    expect(mockFetcher).toHaveBeenCalledTimes(1); 

    manager.clearInterviewSpeechAuthorizationCache('789'); // Xóa cache
    await manager.getInterviewSpeechAuthorization('789'); // Phải gọi lại
    expect(mockFetcher).toHaveBeenCalledTimes(2);
    
    // Xóa toàn bộ cache
    await manager.getInterviewSpeechAuthorization('111');
    manager.clearInterviewSpeechAuthorizationCache(); 
    await manager.getInterviewSpeechAuthorization('111');
    expect(mockFetcher).toHaveBeenCalledTimes(4); // Lần 3 và 4
  });
});
