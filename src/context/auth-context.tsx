import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearInterviewSpeechAuthorizationCache } from '@/services/speechTokenManager';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { authApi } from '@/api/auth.api';
import { API_BASE_URL, onAuthError } from '@/api/client';
import { LoginRequest, RegisterRequest, UserDto } from '@/api/types';
import { tokenStorage } from '@/services/storage';
import { logger } from '@/services/logger';

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------- Pure async helpers (defined outside provider so React Compiler can optimize them) ----------

async function hydrateSessionAsync(
  signal: { mounted: boolean },
  setUser: (u: UserDto | null) => void,
  setIsLoading: (v: boolean) => void,
) {
  let token = await tokenStorage.getAccessToken();
  if (!token) {
    try {
      const rt = await tokenStorage.getRefreshToken();
      const payload = rt ? { refreshToken: rt } : {};
      const refreshResponse = await axios.post<{
        data?: { accessToken: string; refreshToken?: string };
        accessToken?: string;
        refreshToken?: string;
      }>(
        `${API_BASE_URL}/auth/mobile/refresh`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const newAccessToken =
        refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;
      const newRefreshToken =
        refreshResponse.data?.data?.refreshToken || refreshResponse.data?.refreshToken;
        
      if (newAccessToken) {
        await tokenStorage.setAccessToken(newAccessToken);
        token = newAccessToken;
      }
      if (newRefreshToken) {
        await tokenStorage.setRefreshToken(newRefreshToken);
      }
    } catch (err: any) {
      logger.warn('Failed to refresh token during hydration', { error: err?.message || err });
      const isNetworkError = err?.originalError?.isAxiosError && !err?.originalError?.response;
      if (!isNetworkError) {
        await tokenStorage.clearTokens();
      }
    }
  }

  if (token) {
    try {
      const me = await authApi.getMe();
      if (signal.mounted) setUser(me);
    } catch (err: any) {
      logger.warn('Failed to fetch user during hydration', { error: err?.message || err });
      if (signal.mounted) {
        const isNetworkError = err?.originalError?.isAxiosError && !err?.originalError?.response;
        if (!isNetworkError) {
          await tokenStorage.clearTokens();
        }
        setUser(null);
      }
    }
  }
  if (signal.mounted) setIsLoading(false);
}

async function hydrateSessionWithFallback(
  signal: { mounted: boolean },
  setUser: (u: UserDto | null) => void,
  setIsLoading: (v: boolean) => void,
  queryClient: QueryClient,
) {
  try {
    await hydrateSessionAsync(signal, setUser, setIsLoading);
  } catch (err: any) {
    logger.warn('Hydration fallback catch triggered', { error: err?.message || err });
    if (signal.mounted) {
      await tokenStorage.clearTokens();
      queryClient.clear();
      setUser(null);
      setIsLoading(false);
    }
  }
}

async function loginAsync(
  payload: LoginRequest,
  setUser: (u: UserDto | null) => void,
  setIsLoading: (v: boolean) => void,
  queryClient: QueryClient,
): Promise<void> {
  setIsLoading(true);
  clearInterviewSpeechAuthorizationCache();
  queryClient.clear(); // Flush cached data from any previous account session
  const res = await authApi.login(payload);
  if (res.accessToken) {
    await tokenStorage.setAccessToken(res.accessToken);
  }
  if (res.refreshToken) {
    await tokenStorage.setRefreshToken(res.refreshToken);
  }
  if (res.user) {
    setUser(res.user);
  } else {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      const me = await authApi.getMe();
      setUser(me);
    }
  }
  setIsLoading(false);
}

async function logoutAsync(
  setUser: (u: UserDto | null) => void,
  setIsLoading: (v: boolean) => void,
  queryClient: QueryClient,
): Promise<void> {
  setIsLoading(true);
  try {
    await authApi.logout();
  } finally {
    await tokenStorage.clearTokens();
    queryClient.clear(); // Flush all cached React Query data on logout
    clearInterviewSpeechAuthorizationCache(); // Phase 4.9: Clear Azure Speech token
    setUser(null);
    setIsLoading(false);
  }
}

// ------------------------------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const signal = { mounted: true };

    hydrateSessionWithFallback(signal, setUser, setIsLoading, queryClient);

    const unsubscribe = onAuthError(() => {
      if (signal.mounted) {
        clearInterviewSpeechAuthorizationCache();
        queryClient.clear();
        setUser(null);
      }
    });

    return () => {
      signal.mounted = false;
      unsubscribe();
    };
  }, [queryClient]);

  const login = useCallback(
    (payload: LoginRequest) => loginAsync(payload, setUser, setIsLoading, queryClient),
    [queryClient],
  );

  const register = useCallback(
    (payload: RegisterRequest) => authApi.register(payload),
    [],
  );

  const logout = useCallback(
    () => logoutAsync(setUser, setIsLoading, queryClient),
    [queryClient],
  );

  const refreshUser = useCallback(async () => {
    const token = await tokenStorage.getAccessToken();
    if (!token) {
      queryClient.clear();
      setUser(null);
      return;
    }
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch (error: any) {
      logger.warn('Failed to refresh user', { error: error?.message || error });
      await tokenStorage.clearTokens();
      queryClient.clear();
      setUser(null);
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
