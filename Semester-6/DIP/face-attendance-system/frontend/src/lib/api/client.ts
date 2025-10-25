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
      if (token) {
        // For FormData requests, we need to set Authorization header manually
        // and remove Content-Type to let browser set it with boundary
        if (config.data instanceof FormData) {
          config.headers.Authorization = `Bearer ${token}`;
          delete config.headers['Content-Type']; // Let browser set it
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
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
      responseData: error.response?.data
    });
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error: Backend might be down or CORS issue');
    }
    
    if (error.response?.status === 401) {
      console.error('🔐 Unauthorized: Token might be invalid or missing');
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
    
    // Return a consistent error format
    return Promise.reject({
      message: error.response?.data?.error || error.message || 'Network error',
      status: error.response?.status,
      code: error.code
    });
  }
);