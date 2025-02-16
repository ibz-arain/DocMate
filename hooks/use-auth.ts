import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const user = await response.json();
        setAuthState({ user, loading: false });
      } else {
        setAuthState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setAuthState({ user: null, loading: false });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
      }

      const { user } = await response.json();
      setAuthState({ user, loading: false });
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      setAuthState({ user: null, loading: false });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    login,
    logout,
    register,
  };
} 