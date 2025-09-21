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
      const token = localStorage.getItem('auth-token');
      const userStr = localStorage.getItem('admin-user');

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
          localStorage.removeItem('auth-token');
          localStorage.removeItem('admin-user');
        }
      }
    };

    checkAuthentication();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if we should use API or local validation
      const useAPI = import.meta.env.VITE_USE_API === 'true';

      if (useAPI) {
        // Use API for authentication
        const response = await apiClient.login(credentials);

        if (response.success && response.data) {
          const { user, token } = response.data;

          setState(prev => ({
            ...prev,
            user,
            loading: false,
          }));

          // Store authentication data
          localStorage.setItem('auth-token', token);
          localStorage.setItem('admin-user', JSON.stringify(user));
          apiClient.setAuthToken(token);

          return true;
        } else {
          throw new Error(response.error || 'Login failed');
        }
      } else {
        // Local validation for development/fallback
        const validCredentials = {
          email: import.meta.env.VITE_ADMIN_EMAIL || 'info.sustainable.politics@gmail.com',
          password: import.meta.env.VITE_ADMIN_PASSWORD || 'Cspa2@24',
          keyword: import.meta.env.VITE_ADMIN_KEYWORD || 'info2024'
        };

        // Debug logging for troubleshooting
        console.log('Login attempt:', {
          provided: { email: credentials.email, password: '***', keyword: credentials.keyword },
          expected: { email: validCredentials.email, password: '***', keyword: validCredentials.keyword }
        });

        if (
          credentials.email === validCredentials.email &&
          credentials.password === validCredentials.password &&
          credentials.keyword === validCredentials.keyword
        ) {
          const user: AdminUser = {
            email: credentials.email,
            authenticated: true,
          };

          const mockToken = 'mock-token-' + Date.now();

          setState(prev => ({
            ...prev,
            user,
            loading: false,
          }));

          // Store authentication data
          localStorage.setItem('auth-token', mockToken);
          localStorage.setItem('admin-user', JSON.stringify(user));
          apiClient.setAuthToken(mockToken);

          return true;
        } else {
          throw new Error('Invalid credentials. Please check email, password, and keyword.');
        }
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

    try {
      // Try to call logout API if available
      const useAPI = import.meta.env.VITE_USE_API === 'true';

      if (useAPI && state.user) {
        await apiClient.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local state and storage
      setState({
        user: null,
        loading: false,
        error: null,
      });

      localStorage.removeItem('auth-token');
      localStorage.removeItem('admin-user');
      apiClient.setAuthToken(null);
    }
  }, [state.user]);

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
