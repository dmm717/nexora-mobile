import React from 'react';
import { Text, Button } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { tokenStorage } from '@/services/storage';
import { authApi } from '@/api/auth.api';
import { clearInterviewSpeechAuthorizationCache } from '@/services/speechTokenManager';

jest.mock('@/api/client', () => ({ API_BASE_URL: 'https://api.test/api/v1', onAuthError: () => () => {} }));
jest.mock('@/api/auth.api', () => ({ authApi: {
  getMe: jest.fn().mockResolvedValue({ id: 'user-1', email: 'test@example.com' }),
  logout: jest.fn(),
} }));
jest.mock('@/services/storage', () => ({ tokenStorage: {
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
  getHasSeenWelcome: jest.fn().mockResolvedValue('true'),
  clearTokens: jest.fn().mockResolvedValue(undefined),
} }));
jest.mock('@/services/speechTokenManager', () => ({ clearInterviewSpeechAuthorizationCache: jest.fn() }));

function Harness() {
  const { user, clearSession } = useAuth();
  return <><Text>{user ? 'signed in' : 'signed out'}</Text><Button title="clear session" onPress={clearSession} /></>;
}

it('clears tokens, query cache, speech credentials and user without an API call after deletion', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = await render(<QueryClientProvider client={client}><AuthProvider><Harness /></AuthProvider></QueryClientProvider>);
  await waitFor(() => expect(view.getByText('signed in')).toBeTruthy());
  client.setQueryData(['personal-data'], { cv: 'mock personal content' });
  await fireEvent.press(view.getByText('clear session'));
  await waitFor(() => expect(view.getByText('signed out')).toBeTruthy());
  expect(tokenStorage.clearTokens).toHaveBeenCalled();
  expect(clearInterviewSpeechAuthorizationCache).toHaveBeenCalled();
  expect(client.getQueryData(['personal-data'])).toBeUndefined();
  expect(authApi.logout).not.toHaveBeenCalled();
});
