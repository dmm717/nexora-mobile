import React, { createContext, useContext, useEffect, useState } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      await tokenStorage.clearTokens();
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          const me = await authApi.getMe();
          if (isMounted) setUser(me);
        }
      } catch {
        if (isMounted) {
          await tokenStorage.clearTokens();
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydrateSession();

    // Attach global 401 refresh failure listener
    const unsubscribe = onAuthError(() => {
      if (isMounted) {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (payload: LoginRequest) => {
    setIsLoading(true);
    try {
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
        await fetchUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterRequest) => {
    await authApi.register(payload);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      await tokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser: fetchUser,
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
