// lib/api.ts
import axios from 'axios';
import { 
  Student, 
  StudentFormData, 
  AttendanceReport, 
  RecognitionResponse, 
  MarkAttendanceResponse,
  SystemStatus,
  TrainingStatus,
  StorageStats,
  TrainingResponse,
  HealthCheck,
  StudentsResponse,
  StudentResponse,
  AttendanceResponse,
  CaptureFacesResponse,
  DeleteFacesResponse,
  StudentStatsResponse,
  AttendanceStatsResponse,
  AttendanceRangeResponse,
  ModelStatusResponse,
  SystemStatusResponse,
  TrainingStatusResponse,
  ValidateTrainingResponse,
  StorageResponse,
  LogsResponse,
  CleanupResponse
} from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Students API
export const studentsApi = {
  // Get all students
  getAll: async (includeStats?: boolean): Promise<StudentsResponse> => {
    const params = includeStats ? { include_stats: 'true' } : {};
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Get student by ID
  getById: async (studentId: string): Promise<StudentResponse> => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  // Register new student
  create: async (studentData: StudentFormData): Promise<StudentResponse> => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  // Update student
  update: async (studentId: string, updateData: Partial<StudentFormData & { is_active: boolean }>): Promise<StudentResponse> => {
    const response = await api.put(`/students/${studentId}`, updateData);
    return response.data;
  },

  // Delete student (deactivate)
  delete: async (studentId: string): Promise<StudentResponse> => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },

  // Capture face images for student
  captureFaces: async (studentId: string, imageData: string): Promise<CaptureFacesResponse> => {
    const response = await api.post(`/students/${studentId}/capture`, { image: imageData });
    return response.data;
  },

  // Delete all face images for student
  deleteFaces: async (studentId: string): Promise<DeleteFacesResponse> => {
    const response = await api.delete(`/students/${studentId}/faces`);
    return response.data;
  },

  // Get student statistics
  getStats: async (): Promise<StudentStatsResponse> => {
    const response = await api.get('/students/stats');
    return response.data;
  },
};

// Attendance API
export const attendanceApi = {
  // Recognize faces in image
  recognizeFaces: async (imageData: string): Promise<RecognitionResponse> => {
    const response = await api.post('/attendance/recognize', { image: imageData });
    return response.data;
  },

  // Mark attendance for recognized students
  markAttendance: async (recognizedFaces: any[]): Promise<MarkAttendanceResponse> => {
    const response = await api.post('/attendance/mark', { recognized_faces: recognizedFaces });
    return response.data;
  },

  // Manually mark attendance
  markManual: async (studentId: string, status: string = 'present', notes?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/attendance/manual', { student_id: studentId, status, notes });
    return response.data;
  },

  // Get attendance records
  getRecords: async (date?: string): Promise<AttendanceResponse> => {
    const params = date ? { date } : {};
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  // Get attendance statistics
  getStats: async (date?: string): Promise<AttendanceStatsResponse> => {
    const params = date ? { date } : {};
    const response = await api.get('/attendance/stats', { params });
    return response.data;
  },

  // Get attendance records for date range
  getRange: async (startDate: string, endDate: string): Promise<AttendanceRangeResponse> => {
    const response = await api.get('/attendance/range', { 
      params: { start_date: startDate, end_date: endDate } 
    });
    return response.data;
  },

  // Export attendance to CSV
  export: async (date?: string): Promise<Blob> => {
    const params = date ? { date } : {};
    const response = await api.get('/attendance/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Check if face recognition model is ready
  getModelStatus: async (): Promise<ModelStatusResponse> => {
    const response = await api.get('/attendance/model/status');
    return response.data;
  },
};

// System API
export const systemApi = {
  // Health check
  getHealth: async (): Promise<HealthCheck> => {
    const response = await api.get('/system/health');
    return response.data;
  },

  // Complete system status
  getStatus: async (): Promise<SystemStatusResponse> => {
    const response = await api.get('/system/status');
    return response.data;
  },

  // Train face recognition model
  trainModel: async (): Promise<TrainingResponse> => {
    const response = await api.post('/system/train');
    return response.data;
  },

  // Get training status
  getTrainingStatus: async (): Promise<TrainingStatusResponse> => {
    const response = await api.get('/system/training/status');
    return response.data;
  },

  // Validate training data readiness
  validateTraining: async (): Promise<ValidateTrainingResponse> => {
    const response = await api.get('/system/training/validate');
    return response.data;
  },

  // Get storage information
  getStorage: async (): Promise<StorageResponse> => {
    const response = await api.get('/system/storage');
    return response.data;
  },

  // Get system logs
  getLogs: async (limit: number = 100): Promise<LogsResponse> => {
    const response = await api.get('/system/logs', { params: { limit } });
    return response.data;
  },

  // Clean up temporary files
  cleanup: async (): Promise<CleanupResponse> => {
    const response = await api.post('/system/cleanup');
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Convert file to base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  // Validate image size (5MB limit)
  validateImageSize: (base64String: string): boolean => {
    // Remove data URL prefix if present
    const base64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;
    
    // Calculate approximate size (base64 is about 4/3 of original size)
    const imageSize = (base64.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return imageSize <= maxSize;
  },

  // Format date for API (YYYY-MM-DD)
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },
};

export default api;