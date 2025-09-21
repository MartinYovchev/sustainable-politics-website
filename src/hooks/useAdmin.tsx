import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AdminState, AdminUser, LoginRequest } from '../types/index';
import { apiClient } from '../utils/api';
import { AdminContext } from '../contexts/AdminContext';

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [state, setState] = useState<AdminState>({
    user: null,
    loading: false,
    error: null,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthentication = () => {
      const token = sessionStorage.getItem('auth-token');
      const userStr = sessionStorage.getItem('admin-user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as AdminUser;
          setState(prev => ({
            ...prev,
            user,
          }));
          apiClient.setAuthToken(token);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          sessionStorage.removeItem('auth-token');
          sessionStorage.removeItem('admin-user');
        }
      }
    };

    checkAuthentication();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Use environment-based validation for production simplicity
      const validCredentials = {
        email: import.meta.env.VITE_ADMIN_EMAIL || 'info.sustainable.politics@gmail.com',
        password: import.meta.env.VITE_ADMIN_PASSWORD || 'Cspa2@24',
        keyword: import.meta.env.VITE_ADMIN_KEYWORD || 'info2024'
      };

      if (
        credentials.email === validCredentials.email &&
        credentials.password === validCredentials.password &&
        credentials.keyword === validCredentials.keyword
      ) {
        const user: AdminUser = {
          email: credentials.email,
          authenticated: true,
        };

        const token = 'auth-token-' + Date.now();

        setState(prev => ({
          ...prev,
          user,
          loading: false,
        }));

        // Store authentication data in session storage
        sessionStorage.setItem('auth-token', token);
        sessionStorage.setItem('admin-user', JSON.stringify(user));
        apiClient.setAuthToken(token);

        return true;
      } else {
        throw new Error('Invalid credentials. Please check email, password, and keyword.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));

    // Clear local state and storage
    setState({
      user: null,
      loading: false,
      error: null,
    });

    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('admin-user');
    apiClient.setAuthToken(null);
  }, []);

  const checkAuth = useCallback((): boolean => {
    return !!state.user?.authenticated;
  }, [state.user]);

  const value = {
    ...state,
    login,
    logout,
    checkAuth,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
