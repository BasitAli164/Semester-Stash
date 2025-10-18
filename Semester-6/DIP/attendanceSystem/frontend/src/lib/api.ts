import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.message}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Students API
export const studentsApi = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },
  
  getById: async (studentId: string) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },
  
  create: async (studentData: any) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },
  
  update: async (studentId: string, updates: any) => {
    const response = await api.put(`/students/${studentId}`, updates);
    return response.data;
  },
  
  delete: async (studentId: string) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },
  
  captureFaces: async (studentId: string, imageData: string) => {
    const response = await api.post(`/students/${studentId}/capture`, { image: imageData });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/students/stats');
    return response.data;
  },
};

// Attendance API
export const attendanceApi = {
  recognizeFaces: async (imageData: string) => {
    const response = await api.post('/attendance/recognize', { image: imageData });
    return response.data;
  },
  
  markAttendance: async (recognizedFaces: any[]) => {
    const response = await api.post('/attendance/mark', { recognized_faces: recognizedFaces });
    return response.data;
  },
  
  markManual: async (studentId: string, status: string = 'present', notes?: string) => {
    const response = await api.post('/attendance/manual', { 
      student_id: studentId, 
      status, 
      notes 
    });
    return response.data;
  },
  
  getRecords: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get('/attendance', { params });
    return response.data;
  },
  
  getStats: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get('/attendance/stats', { params });
    return response.data;
  },
  
  getRange: async (startDate: string, endDate: string) => {
    const response = await api.get('/attendance/range', { 
      params: { start_date: startDate, end_date: endDate } 
    });
    return response.data;
  },
  
  export: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get('/attendance/export', { params });
    return response.data;
  },
  
  getModelStatus: async () => {
    const response = await api.get('/attendance/model/status');
    return response.data;
  },
};

// System API
export const systemApi = {
  health: async () => {
    const response = await api.get('/system/health');
    return response.data;
  },
  
  status: async () => {
    const response = await api.get('/system/status');
    return response.data;
  },
  
  train: async () => {
    const response = await api.post('/system/train');
    return response.data;
  },
  
  trainingStatus: async () => {
    const response = await api.get('/system/training/status');
    return response.data;
  },
  
  validateTraining: async () => {
    const response = await api.get('/system/training/validate');
    return response.data;
  },
  
  storage: async () => {
    const response = await api.get('/system/storage');
    return response.data;
  },
  
  logs: async (limit: number = 100) => {
    const response = await api.get('/system/logs', { params: { limit } });
    return response.data;
  },
  
  cleanup: async () => {
    const response = await api.post('/system/cleanup');
    return response.data;
  },
};

export default api;