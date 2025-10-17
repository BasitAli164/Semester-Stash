import api from '@/lib/api';
import { 
  Student, 
  AttendanceRecord, 
  AttendanceReport, 
  AttendanceStats, 
  FaceRecognitionResult,
  SystemStatus,
  ApiResponse 
} from '@/types';

// Student Services
export const studentService = {
  // Register new student
  registerStudent: async (studentData: Partial<Student>): Promise<ApiResponse> => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  // Get all students
  getStudents: async (includeStats = false): Promise<ApiResponse<Student[]>> => {
    const response = await api.get(`/students?include_stats=${includeStats}`);
    return response.data;
  },

  // Get student by ID
  getStudent: async (studentId: string): Promise<ApiResponse<Student>> => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  // Capture face images
  captureFaces: async (studentId: string, imageData: string): Promise<ApiResponse> => {
    const response = await api.post(`/students/${studentId}/capture`, { image: imageData });
    return response.data;
  },

  // Update student
  updateStudent: async (studentId: string, updateData: Partial<Student>): Promise<ApiResponse> => {
    const response = await api.put(`/students/${studentId}`, updateData);
    return response.data;
  },

  // Delete student faces
  deleteStudentFaces: async (studentId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/students/${studentId}/faces`);
    return response.data;
  },

  // Get student statistics
  getStudentStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/students/stats');
    return response.data;
  },
};

// Attendance Services
export const attendanceService = {
  // Recognize faces
  recognizeFaces: async (imageData: string): Promise<ApiResponse<FaceRecognitionResult[]>> => {
    const response = await api.post('/attendance/recognize', { image: imageData });
    return response.data;
  },

  // Mark attendance
  markAttendance: async (recognizedFaces: FaceRecognitionResult[]): Promise<ApiResponse> => {
    const response = await api.post('/attendance/mark', { recognized_faces: recognizedFaces });
    return response.data;
  },

  // Manual attendance
  markManualAttendance: async (studentId: string, status = 'present', notes?: string): Promise<ApiResponse> => {
    const response = await api.post('/attendance/manual', { student_id: studentId, status, notes });
    return response.data;
  },

  // Get attendance records
  getAttendance: async (date?: string): Promise<ApiResponse<AttendanceReport>> => {
    const url = date ? `/attendance?date=${date}` : '/attendance';
    const response = await api.get(url);
    return response.data;
  },

  // Get attendance range
  getAttendanceRange: async (startDate: string, endDate: string): Promise<ApiResponse> => {
    const response = await api.get(`/attendance/range?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  },

  // Get attendance statistics
  getAttendanceStats: async (date?: string): Promise<ApiResponse<AttendanceStats>> => {
    const url = date ? `/attendance/stats?date=${date}` : '/attendance/stats';
    const response = await api.get(url);
    return response.data;
  },

  // Export attendance
  exportAttendance: async (date?: string): Promise<Blob> => {
    const url = date ? `/attendance/export?date=${date}` : '/attendance/export';
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  },

  // Check model status
  getModelStatus: async (): Promise<ApiResponse<{ model_ready: boolean }>> => {
    const response = await api.get('/attendance/model/status');
    return response.data;
  },
};

// System Services
export const systemService = {
  // Health check
  healthCheck: async (): Promise<ApiResponse> => {
    const response = await api.get('/system/health');
    return response.data;
  },

  // Train model
  trainModel: async (): Promise<ApiResponse> => {
    const response = await api.post('/system/train');
    return response.data;
  },

  // Get system status
  getSystemStatus: async (): Promise<ApiResponse<SystemStatus>> => {
    const response = await api.get('/system/status');
    return response.data;
  },

  // Get training status
  getTrainingStatus: async (): Promise<ApiResponse> => {
    const response = await api.get('/system/training/status');
    return response.data;
  },

  // Validate training data
  validateTrainingData: async (): Promise<ApiResponse> => {
    const response = await api.get('/system/training/validate');
    return response.data;
  },

  // Get storage info
  getStorageInfo: async (): Promise<ApiResponse> => {
    const response = await api.get('/system/storage');
    return response.data;
  },

  // Get system logs
  getSystemLogs: async (limit = 100): Promise<ApiResponse> => {
    const response = await api.get(`/system/logs?limit=${limit}`);
    return response.data;
  },

  // Cleanup system
  cleanupSystem: async (): Promise<ApiResponse> => {
    const response = await api.post('/system/cleanup');
    return response.data;
  },
};