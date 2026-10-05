import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { userApi } from '@/api/user.api';
import { useAuth } from '@/context/auth-context';
import { PersonalInformationCard } from '@/components/account/PersonalInformationCard';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));
jest.mock('expo-file-system/legacy', () => ({ deleteAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/api/user.api', () => ({ userApi: { uploadAvatar: jest.fn().mockResolvedValue({}) } }));
jest.mock('@/context/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('@/components/ui/toast/ToastProvider', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/ui/user-avatar', () => ({ UserAvatar: () => null }));
jest.mock('@/components/themed-text', () => ({ ThemedText: require('react-native').Text }));
jest.mock('@/components/ui/glass-card', () => ({ GlassCard: require('react-native').View }));
jest.mock('@/components/ui/touchable-scale', () => ({ TouchableScale: require('react-native').Pressable }));

describe('avatar system picker', () => {
  const originalFetch = global.fetch;
  const refreshUser = jest.fn().mockResolvedValue(undefined);
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ refreshUser });
    global.fetch = jest.fn().mockResolvedValue({ blob: async () => ({ size: 1024 }) });
  });
  afterEach(() => { global.fetch = originalFetch; });

  async function openPicker() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    const view = await render(
      <QueryClientProvider client={client}>
        <PersonalInformationCard currentUserData={{ displayName: 'Test' }} colors={{}} />
      </QueryClientProvider>,
    );
    await fireEvent.press(view.getByText('Thay ảnh'));
    return view;
  }

  it('selects, crops and uploads the returned image without requesting gallery permission', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false, assets: [{ uri: 'file:///cache/avatar.jpg', mimeType: 'image/jpeg', fileName: 'avatar.jpg' }],
    });
    await openPicker();
    await waitFor(() => expect(refreshUser).toHaveBeenCalled());
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
    expect(userApi.uploadAvatar).toHaveBeenCalledWith('file:///cache/avatar.jpg', 'image/jpeg', 'avatar.jpg');
  });

  it('leaves the avatar unchanged when the system picker is cancelled', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });
    await openPicker();
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
    expect(userApi.uploadAvatar).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
