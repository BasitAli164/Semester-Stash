import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authAPI } from '@/lib/api';
import { LoginCredentials } from '@/types';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, setLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const signIn = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, access_token } = response.data;
      
      login(userData, access_token);
      return { success: true, data: userData };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  const validateToken = async () => {
    if (!token) return false;
    
    try {
      const response = await authAPI.validateToken();
      return response.data.valid;
    } catch (error) {
      logout();
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    validateToken,
  };
};