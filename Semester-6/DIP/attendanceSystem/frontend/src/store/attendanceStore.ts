import { create } from 'zustand';
import { studentsApi, attendanceApi, systemApi } from '@/lib/api';
import { Student, AttendanceRecord, AttendanceStats, SystemStatus, TrainingStatus, FaceRecognitionResult } from '@/types';

interface AttendanceState {
  // Students
  students: Student[];
  selectedStudent: Student | null;
  
  // Attendance
  attendanceRecords: AttendanceRecord[];
  attendanceStats: AttendanceStats | null;
  recognitionResults: FaceRecognitionResult[];
  
  // System
  systemStatus: SystemStatus | null;
  trainingStatus: TrainingStatus | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  success: string | null;

  // API Actions
  // Students
  fetchStudents: () => Promise<void>;
  fetchStudent: (studentId: string) => Promise<void>;
  createStudent: (studentData: any) => Promise<boolean>;
  updateStudent: (studentId: string, updates: any) => Promise<boolean>;
  deleteStudent: (studentId: string) => Promise<boolean>;
  captureStudentFaces: (studentId: string, imageData: string) => Promise<boolean>;

  // Attendance
  fetchAttendance: (date?: string) => Promise<void>;
  fetchAttendanceStats: (date?: string) => Promise<void>;
  recognizeFaces: (imageData: string) => Promise<boolean>;
  markAttendance: (recognizedFaces: any[]) => Promise<boolean>;
  markManualAttendance: (studentId: string, status?: string, notes?: string) => Promise<boolean>;

  // System
  fetchSystemStatus: () => Promise<void>;
  fetchTrainingStatus: () => Promise<void>;
  trainModel: () => Promise<boolean>;
  validateTraining: () => Promise<any>;
  fetchStorage: () => Promise<any>;
  fetchLogs: (limit?: number) => Promise<any>;
  cleanupSystem: () => Promise<boolean>;

  // UI Actions
  clearError: () => void;
  clearSuccess: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  // Initial State
  students: [],
  selectedStudent: null,
  attendanceRecords: [],
  attendanceStats: null,
  recognitionResults: [],
  systemStatus: null,
  trainingStatus: null,
  loading: false,
  error: null,
  success: null,

  // Students API Actions
  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await studentsApi.getAll();
      if (response.success) {
        set({ students: response.students, loading: false });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch students', 
        loading: false 
      });
    }
  },

  fetchStudent: async (studentId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await studentsApi.getById(studentId);
      if (response.success) {
        set({ selectedStudent: response.student, loading: false });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch student', 
        loading: false 
      });
    }
  },

  createStudent: async (studentData: any) => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await studentsApi.create(studentData);
      if (response.success) {
        set({ 
          success: response.message, 
          loading: false 
        });
        // Refresh students list
        get().fetchStudents();
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create student', 
        loading: false 
      });
      return false;
    }
  },

  updateStudent: async (studentId: string, updates: any) => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await studentsApi.update(studentId, updates);
      if (response.success) {
        set({ 
          success: response.message, 
          loading: false 
        });
        // Refresh students list and selected student
        get().fetchStudents();
        if (get().selectedStudent?.student_id === studentId) {
          get().fetchStudent(studentId);
        }
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update student', 
        loading: false 
      });
      return false;
    }
  },

  deleteStudent: async (studentId: string) => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await studentsApi.delete(studentId);
      if (response.success) {
        set({ 
          success: response.message, 
          loading: false 
        });
        // Refresh students list
        get().fetchStudents();
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete student', 
        loading: false 
      });
      return false;
    }
  },

  captureStudentFaces: async (studentId: string, imageData: string) => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await studentsApi.captureFaces(studentId, imageData);
      if (response.success) {
        set({ 
          success: `Captured ${response.images_captured} face images successfully`, 
          loading: false 
        });
        // Refresh students list to update face count
        get().fetchStudents();
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to capture faces', 
        loading: false 
      });
      return false;
    }
  },

  // Attendance API Actions
  fetchAttendance: async (date?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await attendanceApi.getRecords(date);
      if (response.success) {
        set({ 
          attendanceRecords: response.report.attendance, 
          attendanceStats: response.report.stats,
          loading: false 
        });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch attendance', 
        loading: false 
      });
    }
  },

  fetchAttendanceStats: async (date?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await attendanceApi.getStats(date);
      if (response.success) {
        set({ 
          attendanceStats: response.stats,
          loading: false 
        });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch attendance stats', 
        loading: false 
      });
    }
  },

  recognizeFaces: async (imageData: string) => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await attendanceApi.recognizeFaces(imageData);
      if (response.success) {
        set({ 
          recognitionResults: response.results,
          success: response.message,
          loading: false 
        });
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to recognize faces', 
        loading: false 
      });
      return false;
    }
  },

  markAttendance: async (recognizedFaces: any[]) => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await attendanceApi.markAttendance(recognizedFaces);
      if (response.success) {
        set({ 
          success: response.message,
          loading: false 
        });
        // Refresh attendance data
        get().fetchAttendance();
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to mark attendance', 
        loading: false 
      });
      return false;
    }
  },

  markManualAttendance: async (studentId: string, status: string = 'present', notes?: string) => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await attendanceApi.markManual(studentId, status, notes);
      if (response.success) {
        set({ 
          success: response.message,
          loading: false 
        });
        // Refresh attendance data
        get().fetchAttendance();
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to mark manual attendance', 
        loading: false 
      });
      return false;
    }
  },

  // System API Actions
  fetchSystemStatus: async () => {
    set({ loading: true, error: null });
    try {
      const response = await systemApi.status();
      if (response.success) {
        set({ 
          systemStatus: response.status,
          loading: false 
        });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch system status', 
        loading: false 
      });
    }
  },

  fetchTrainingStatus: async () => {
    set({ loading: true, error: null });
    try {
      const response = await systemApi.trainingStatus();
      if (response.success) {
        set({ 
          trainingStatus: response.status,
          loading: false 
        });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch training status', 
        loading: false 
      });
    }
  },

  trainModel: async () => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await systemApi.train();
      if (response.success) {
        set({ 
          success: response.message,
          loading: false 
        });
        // Refresh training status
        get().fetchTrainingStatus();
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to train model', 
        loading: false 
      });
      return false;
    }
  },

  validateTraining: async () => {
    set({ loading: true, error: null });
    try {
      const response = await systemApi.validateTraining();
      set({ loading: false });
      return response;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to validate training', 
        loading: false 
      });
      return null;
    }
  },

  fetchStorage: async () => {
    set({ loading: true, error: null });
    try {
      const response = await systemApi.storage();
      set({ loading: false });
      return response;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch storage info', 
        loading: false 
      });
      return null;
    }
  },

  fetchLogs: async (limit: number = 100) => {
    set({ loading: true, error: null });
    try {
      const response = await systemApi.logs(limit);
      set({ loading: false });
      return response;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch logs', 
        loading: false 
      });
      return null;
    }
  },

  cleanupSystem: async () => {
    set({ loading: true, error: null, success: null });
    try {
      const response = await systemApi.cleanup();
      if (response.success) {
        set({ 
          success: response.message,
          loading: false 
        });
        return true;
      } else {
        set({ error: response.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to cleanup system', 
        loading: false 
      });
      return false;
    }
  },

  // UI Actions
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),
  setLoading: (loading: boolean) => set({ loading }),
}));