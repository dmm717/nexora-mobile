import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@/api/auth.api';
import { onAuthError } from '@/api/client';
import { LoginRequest, RegisterRequest, UserDto } from '@/api/types';
import { tokenStorage } from '@/services/storage';

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
  const token = await tokenStorage.getAccessToken();
  if (token) {
    const me = await authApi.getMe();
    if (signal.mounted) setUser(me);
  }
  if (signal.mounted) setIsLoading(false);
}

async function hydrateSessionWithFallback(
  signal: { mounted: boolean },
  setUser: (u: UserDto | null) => void,
  setIsLoading: (v: boolean) => void,
) {
  try {
    await hydrateSessionAsync(signal, setUser, setIsLoading);
  } catch {
    if (signal.mounted) {
      await tokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  }
}

async function loginAsync(
  payload: LoginRequest,
  setUser: (u: UserDto | null) => void,
  setIsLoading: (v: boolean) => void,
): Promise<void> {
  setIsLoading(true);
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
): Promise<void> {
  setIsLoading(true);
  try {
    await authApi.logout();
  } finally {
    await tokenStorage.clearTokens();
    setUser(null);
    setIsLoading(false);
  }
}

// ------------------------------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const signal = { mounted: true };

    hydrateSessionWithFallback(signal, setUser, setIsLoading);

    const unsubscribe = onAuthError(() => {
      if (signal.mounted) setUser(null);
    });

    return () => {
      signal.mounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    (payload: LoginRequest) => loginAsync(payload, setUser, setIsLoading),
    [],
  );

  const register = useCallback(
    (payload: RegisterRequest) => authApi.register(payload),
    [],
  );

  const logout = useCallback(
    () => logoutAsync(setUser, setIsLoading),
    [],
  );

  const refreshUser = useCallback(async () => {
    const token = await tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      await tokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

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
