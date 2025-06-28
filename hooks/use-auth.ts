import { useState, useEffect, useCallback } from 'react';
import { AuthState, PublicUser, LoginRequest, RegisterRequest } from '@/types/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const user: PublicUser = await response.json();
        setAuthState({
          user,
          loading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<PublicUser> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { user }: { user: PublicUser } = await response.json();
      
      setAuthState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<PublicUser> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const { user }: { user: PublicUser } = await response.json();
      
      setAuthState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<PublicUser>): Promise<PublicUser> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
      }

      const user: PublicUser = await response.json();
      
      setAuthState(prev => ({
        ...prev,
        user,
      }));

      return user;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user: authState.user,
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshAuth,
  };
} 