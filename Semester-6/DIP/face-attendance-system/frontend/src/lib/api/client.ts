import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      console.log('🔐 Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization header set:', config.headers.Authorization);
      } else {
        console.log('❌ No token found in localStorage');
      }
    }
    
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📨 Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('🚨 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('🚨 API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data,
      requestHeaders: error.config?.headers
    });
    
    if (error.response?.status === 401) {
      console.error('🔐 401 Unauthorized - Token issue detected');
      console.log('📋 Response headers:', error.response?.headers);
      console.log('📋 Request headers that were sent:', error.config?.headers);
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error: Backend might be down or CORS issue');
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);