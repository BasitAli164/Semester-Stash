'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { User, LoginCredentials, AuthState } from '@/types/auth';
import { authApi } from '@/lib/api/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE_AUTH'; payload: { user: User | null; token: string | null } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      };
    
    case 'INITIALIZE_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token && !!action.payload.user,
        isLoading: false,
      };
    
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const initializeAuth = () => {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'INITIALIZE_AUTH', payload: { user, token } });
      } else {
        dispatch({ type: 'INITIALIZE_AUTH', payload: { user: null, token: null } });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      dispatch({ type: 'INITIALIZE_AUTH', payload: { user: null, token: null } });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authApi.login(credentials);
      
      // Store token and user data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      
      const errorMessage = error.response?.data?.error || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Call logout API (optional - for server-side session cleanup)
    authApi.logout().catch(console.error);
    
    dispatch({ type: 'LOGOUT' });
  };

  // Initialize auth on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // 🔥 INSERT THE REDIRECT useEffect HERE - right after the existing useEffect
  // Inside AuthProvider component, after the existing useEffect:
useEffect(() => {
  if (state.isAuthenticated && !state.isLoading && typeof window !== 'undefined') {
    // Check if we're on the login page and redirect to dashboard
    if (window.location.pathname === '/login') {
      window.location.href = '/dashboard';
    }
  }
}, [state.isAuthenticated, state.isLoading]);
  const value: AuthContextType = {
    ...state,
    login,
    logout,
    initializeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}