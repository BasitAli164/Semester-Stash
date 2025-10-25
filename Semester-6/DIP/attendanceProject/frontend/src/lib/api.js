import axios from 'axios'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verifyToken: () => api.get('/auth/verify-token'),
}

export const studentAPI = {
  register: (formData) => api.post('/student/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/student/list', { params }),
  getById: (id) => api.get(`/student/${id}`),
  toggleActive: (id) => api.put(`/student/${id}/toggle-active`),
  addFaces: (id, formData) => api.post(`/student/${id}/add-faces`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/student/stats'),
}

export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  markManual: (data) => api.post('/attendance/manual', data),
  getReports: (params) => api.get('/attendance/reports', { params }),
  getStats: () => api.get('/attendance/stats'),
  getToday: () => api.get('/attendance/today'),
}

export const faceAPI = {
  verify: (data) => api.post('/face/verify', data),
}