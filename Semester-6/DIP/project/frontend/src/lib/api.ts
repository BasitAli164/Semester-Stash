import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/api/login', credentials),
  validateToken: () => api.get('/api/validate-token'),
  logout: () => api.post('/api/logout'),
};

export const studentAPI = {
  register: (data: any) => api.post('/api/register-student', data),
  uploadImages: (studentId: number, formData: FormData) =>
    api.post(`/api/upload-images?student_id=${studentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  preprocess: (studentId: number) => 
    api.post('/api/preprocess', { student_id: studentId }),
  train: (studentId: number) => 
    api.post('/api/train', { student_id: studentId }),
  getAll: () => api.get('/api/students'),
  getProfile: (userId: number) => api.get(`/api/profile/${userId}`),
  updateProfile: (data: any) => api.put('/api/update-profile', data),
};

export const attendanceAPI = {
  mark: (imageData: string | FormData) => {
    if (typeof imageData === 'string') {
      return api.post('/api/mark-attendance', { image_data: imageData });
    }
    return api.post('/api/mark-attendance', imageData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getReports: (params?: any) => api.get('/api/reports', { params }),
  getStats: () => api.get('/api/attendance-stats'),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/api/admin/dashboard-stats'),
  exportReports: (params?: any) => api.get('/api/admin/export-reports', { params }),
  retrainModel: () => api.post('/api/admin/retrain-model'),
  getSystemStatus: () => api.get('/api/admin/system-status'),
};