// lib/store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AppState, 
  Student, 
  AttendanceRecord, 
  AttendanceStats, 
  FaceRecognitionResult, 
  SystemStatus,
  TrainingStatus,
  StorageStats
} from '@/types';
import { studentsApi, attendanceApi, systemApi } from '@/lib/api';

interface AppStore extends AppState {
  // Student Actions
  setStudents: (students: Student[]) => void;
  setCurrentStudent: (student: Student | null) => void;
  setStudentsLoading: (loading: boolean) => void;
  setStudentsError: (error: string | null) => void;
  
  // Attendance Actions
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  setAttendanceStats: (stats: AttendanceStats | null) => void;
  setRecognitionResults: (results: FaceRecognitionResult[]) => void;
  setIsMarkingAttendance: (marking: boolean) => void;
  setAttendanceLoading: (loading: boolean) => void;
  
  // System Actions
  setSystemStatus: (status: SystemStatus | null) => void;
  setIsTraining: (training: boolean) => void;
  setTrainingStatus: (status: TrainingStatus | null) => void;
  setStorageStats: (stats: StorageStats | null) => void;
  setSystemLoading: (loading: boolean) => void;
  
  // UI Actions
  setActiveTab: (tab: AppState['activeTab']) => void;
  setCameraActive: (active: boolean) => void;
  setModal: (modal: AppState['modal']) => void;
  closeModal: () => void;
  
  // Async Actions - Students
  fetchStudents: (includeStats?: boolean) => Promise<void>;
  fetchStudent: (studentId: string) => Promise<void>;
  registerStudent: (studentData: any) => Promise<boolean>;
  updateStudent: (studentId: string, updateData: any) => Promise<boolean>;
  deleteStudent: (studentId: string) => Promise<boolean>;
  captureStudentFaces: (studentId: string, imageData: string) => Promise<boolean>;
  deleteStudentFaces: (studentId: string) => Promise<boolean>;
  
  // Async Actions - Attendance
  recognizeFaces: (imageData: string) => Promise<FaceRecognitionResult[]>;
  markAttendance: (recognizedFaces: FaceRecognitionResult[]) => Promise<number>;
  fetchAttendance: (date?: string) => Promise<void>;
  fetchAttendanceStats: (date?: string) => Promise<void>;
  markManualAttendance: (studentId: string, status?: string, notes?: string) => Promise<boolean>;
  exportAttendance: (date?: string) => Promise<void>;
  
  // Async Actions - System
  fetchSystemStatus: () => Promise<void>;
  fetchTrainingStatus: () => Promise<void>;
  fetchStorageStats: () => Promise<void>;
  trainModel: () => Promise<boolean>;
  validateTraining: () => Promise<{ canTrain: boolean; issues: string[] }>;
  cleanupSystem: () => Promise<boolean>;
  
  // Utility Actions
  resetRecognitionResults: () => void;
  resetStudents: () => void;
  resetAttendance: () => void;
  resetSystem: () => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      students: [],
      currentStudent: null,
      studentsLoading: false,
      studentsError: null,
      
      attendanceRecords: [],
      attendanceStats: null,
      recognitionResults: [],
      isMarkingAttendance: false,
      attendanceLoading: false,
      
      systemStatus: null,
      isTraining: false,
      trainingStatus: null,
      storageStats: null,
      systemLoading: false,
      
      activeTab: 'dashboard',
      cameraActive: false,
      modal: { type: null, data: null },
      
      // Synchronous Actions
      setStudents: (students) => set({ students }),
      setCurrentStudent: (student) => set({ currentStudent: student }),
      setStudentsLoading: (loading) => set({ studentsLoading: loading }),
      setStudentsError: (error) => set({ studentsError: error }),
      
      setAttendanceRecords: (records) => set({ attendanceRecords: records }),
      setAttendanceStats: (stats) => set({ attendanceStats: stats }),
      setRecognitionResults: (results) => set({ recognitionResults: results }),
      setIsMarkingAttendance: (marking) => set({ isMarkingAttendance: marking }),
      setAttendanceLoading: (loading) => set({ attendanceLoading: loading }),
      
      setSystemStatus: (status) => set({ systemStatus: status }),
      setIsTraining: (training) => set({ isTraining: training }),
      setTrainingStatus: (status) => set({ trainingStatus: status }),
      setStorageStats: (stats) => set({ storageStats: stats }),
      setSystemLoading: (loading) => set({ systemLoading: loading }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCameraActive: (active) => set({ cameraActive: active }),
      setModal: (modal) => set({ modal }),
      closeModal: () => set({ modal: { type: null, data: null } }),
      
      // Async Actions - Students
      fetchStudents: async (includeStats = false) => {
        set({ studentsLoading: true, studentsError: null });
        try {
          const response = await studentsApi.getAll(includeStats);
          if (response.success) {
            set({ students: response.students });
          } else {
            set({ studentsError: response.message });
          }
        } catch (error: any) {
          set({ studentsError: error.response?.data?.message || 'Failed to fetch students' });
        } finally {
          set({ studentsLoading: false });
        }
      },
      
      fetchStudent: async (studentId: string) => {
        set({ studentsLoading: true, studentsError: null });
        try {
          const response = await studentsApi.getById(studentId);
          if (response.success) {
            set({ currentStudent: response.student });
          } else {
            set({ studentsError: response.message });
          }
        } catch (error: any) {
          set({ studentsError: error.response?.data?.message || 'Failed to fetch student' });
        } finally {
          set({ studentsLoading: false });
        }
      },
      
      registerStudent: async (studentData) => {
        set({ studentsLoading: true, studentsError: null });
        try {
          const response = await studentsApi.create(studentData);
          if (response.success) {
            // Refresh students list
            get().fetchStudents();
            return true;
          } else {
            set({ studentsError: response.message });
            return false;
          }
        } catch (error: any) {
          set({ studentsError: error.response?.data?.message || 'Failed to register student' });
          return false;
        } finally {
          set({ studentsLoading: false });
        }
      },
      
      updateStudent: async (studentId, updateData) => {
        set({ studentsLoading: true, studentsError: null });
        try {
          const response = await studentsApi.update(studentId, updateData);
          if (response.success) {
            // Refresh students list and current student
            get().fetchStudents();
            if (get().currentStudent?.student_id === studentId) {
              get().fetchStudent(studentId);
            }
            return true;
          } else {
            set({ studentsError: response.message });
            return false;
          }
        } catch (error: any) {
          set({ studentsError: error.response?.data?.message || 'Failed to update student' });
          return false;
        } finally {
          set({ studentsLoading: false });
        }
      },
      
      deleteStudent: async (studentId) => {
        set({ studentsLoading: true, studentsError: null });
        try {
          const response = await studentsApi.delete(studentId);
          if (response.success) {
            // Refresh students list
            get().fetchStudents();
            return true;
          } else {
            set({ studentsError: response.message });
            return false;
          }
        } catch (error: any) {
          set({ studentsError: error.response?.data?.message || 'Failed to delete student' });
          return false;
        } finally {
          set({ studentsLoading: false });
        }
      },
      
      captureStudentFaces: async (studentId, imageData) => {
        set({ studentsLoading: true, studentsError: null });
        try {
          const response = await studentsApi.captureFaces(studentId, imageData);
          if (response.success) {
            // Refresh student data
            get().fetchStudent(studentId);
            get().fetchStudents();
            return true;
          } else {
            set({ studentsError: response.message });
            return false;
          }
        } catch (error: any) {
          set({ studentsError: error.response?.data?.message || 'Failed to capture faces' });
          return false;
        } finally {
          set({ studentsLoading: false });
        }
      },
      
      deleteStudentFaces: async (studentId) => {
        set({ studentsLoading: true, studentsError: null });
        try {
          const response = await studentsApi.deleteFaces(studentId);
          if (response.success) {
            // Refresh student data
            get().fetchStudent(studentId);
            get().fetchStudents();
            return true;
          } else {
            set({ studentsError: response.message });
            return false;
          }
        } catch (error: any) {
          set({ studentsError: error.response?.data?.message || 'Failed to delete faces' });
          return false;
        } finally {
          set({ studentsLoading: false });
        }
      },
      
      // Async Actions - Attendance
      recognizeFaces: async (imageData) => {
        set({ attendanceLoading: true });
        try {
          const response = await attendanceApi.recognizeFaces(imageData);
          if (response.success) {
            set({ recognitionResults: response.results });
            return response.results;
          }
          return [];
        } catch (error: any) {
          console.error('Face recognition failed:', error);
          return [];
        } finally {
          set({ attendanceLoading: false });
        }
      },
      
      markAttendance: async (recognizedFaces) => {
        set({ isMarkingAttendance: true });
        try {
          const response = await attendanceApi.markAttendance(recognizedFaces);
          if (response.success) {
            set({ recognitionResults: response.detailed_results });
            return response.marked_count;
          }
          return 0;
        } catch (error: any) {
          console.error('Mark attendance failed:', error);
          return 0;
        } finally {
          set({ isMarkingAttendance: false });
        }
      },
      
      fetchAttendance: async (date) => {
        set({ attendanceLoading: true });
        try {
          const response = await attendanceApi.getRecords(date);
          if (response.success) {
            set({ 
              attendanceRecords: response.report.attendance,
              attendanceStats: response.report.stats
            });
          }
        } catch (error: any) {
          console.error('Fetch attendance failed:', error);
        } finally {
          set({ attendanceLoading: false });
        }
      },
      
      fetchAttendanceStats: async (date) => {
        try {
          const response = await attendanceApi.getStats(date);
          if (response.success) {
            set({ attendanceStats: response.stats });
          }
        } catch (error: any) {
          console.error('Fetch attendance stats failed:', error);
        }
      },
      
      markManualAttendance: async (studentId, status = 'present', notes) => {
        try {
          const response = await attendanceApi.markManual(studentId, status, notes);
          return response.success;
        } catch (error: any) {
          console.error('Manual attendance failed:', error);
          return false;
        }
      },
      
      exportAttendance: async (date) => {
        try {
          const blob = await attendanceApi.export(date);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `attendance_${date || new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error: any) {
          console.error('Export attendance failed:', error);
        }
      },
      
      // Async Actions - System
      fetchSystemStatus: async () => {
        set({ systemLoading: true });
        try {
          const response = await systemApi.getStatus();
          if (response.success) {
            set({ systemStatus: response.status });
          }
        } catch (error: any) {
          console.error('Fetch system status failed:', error);
        } finally {
          set({ systemLoading: false });
        }
      },
      
      fetchTrainingStatus: async () => {
        try {
          const response = await systemApi.getTrainingStatus();
          if (response.success) {
            set({ trainingStatus: response.status });
          }
        } catch (error: any) {
          console.error('Fetch training status failed:', error);
        }
      },
      
      fetchStorageStats: async () => {
        try {
          const response = await systemApi.getStorage();
          if (response.success) {
            set({ storageStats: response.storage });
          }
        } catch (error: any) {
          console.error('Fetch storage stats failed:', error);
        }
      },
      
      trainModel: async () => {
        set({ isTraining: true });
        try {
          const response = await systemApi.trainModel();
          if (response.success) {
            // Refresh system status after training
            get().fetchSystemStatus();
            get().fetchTrainingStatus();
            return true;
          }
          return false;
        } catch (error: any) {
          console.error('Model training failed:', error);
          return false;
        } finally {
          set({ isTraining: false });
        }
      },
      
      validateTraining: async () => {
        try {
          const response = await systemApi.validateTraining();
          return {
            canTrain: response.can_train,
            issues: response.issues
          };
        } catch (error: any) {
          console.error('Training validation failed:', error);
          return { canTrain: false, issues: ['Validation failed'] };
        }
      },
      
      cleanupSystem: async () => {
        try {
          const response = await systemApi.cleanup();
          return response.success;
        } catch (error: any) {
          console.error('System cleanup failed:', error);
          return false;
        }
      },
      
      // Utility Actions
      resetRecognitionResults: () => set({ recognitionResults: [] }),
      resetStudents: () => set({ students: [], currentStudent: null, studentsError: null }),
      resetAttendance: () => set({ 
        attendanceRecords: [], 
        attendanceStats: null, 
        recognitionResults: [],
        isMarkingAttendance: false 
      }),
      resetSystem: () => set({ 
        systemStatus: null, 
        trainingStatus: null, 
        storageStats: null 
      }),
    }),
    {
      name: 'app-storage',
    }
  )
);