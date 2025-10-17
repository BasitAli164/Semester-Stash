import { create } from 'zustand';
import { Student, AttendanceRecord, SystemStatus, FaceRecognitionResult } from '@/types';

interface AppState {
  // Students state
  students: Student[];
  selectedStudent: Student | null;
  studentsLoading: boolean;
  
  // Attendance state
  attendanceRecords: AttendanceRecord[];
  currentAttendance: FaceRecognitionResult[];
  attendanceLoading: boolean;
  
  // System state
  systemStatus: SystemStatus | null;
  modelReady: boolean;
  systemLoading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  currentView: string;
  notifications: string[];
  
  // Actions
  setStudents: (students: Student[]) => void;
  setSelectedStudent: (student: Student | null) => void;
  setStudentsLoading: (loading: boolean) => void;
  
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  setCurrentAttendance: (attendance: FaceRecognitionResult[]) => void;
  setAttendanceLoading: (loading: boolean) => void;
  
  setSystemStatus: (status: SystemStatus) => void;
  setModelReady: (ready: boolean) => void;
  setSystemLoading: (loading: boolean) => void;
  
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: string) => void;
  addNotification: (message: string) => void;
  clearNotifications: () => void;
  
  // Combined actions
  initializeApp: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  students: [],
  selectedStudent: null,
  studentsLoading: false,
  
  attendanceRecords: [],
  currentAttendance: [],
  attendanceLoading: false,
  
  systemStatus: null,
  modelReady: false,
  systemLoading: false,
  
  sidebarOpen: false,
  currentView: 'dashboard',
  notifications: [],
  
  // Actions
  setStudents: (students) => set({ students }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  setStudentsLoading: (loading) => set({ studentsLoading: loading }),
  
  setAttendanceRecords: (records) => set({ attendanceRecords: records }),
  setCurrentAttendance: (attendance) => set({ currentAttendance: attendance }),
  setAttendanceLoading: (loading) => set({ attendanceLoading: loading }),
  
  setSystemStatus: (status) => set({ systemStatus: status }),
  setModelReady: (ready) => set({ modelReady: ready }),
  setSystemLoading: (loading) => set({ systemLoading: loading }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentView: (view) => set({ currentView: view }),
  addNotification: (message) => 
    set((state) => ({ 
      notifications: [...state.notifications, message] 
    })),
  clearNotifications: () => set({ notifications: [] }),
  
  // Combined actions
  initializeApp: async () => {
    const { systemService, attendanceService } = await import('@/services/api.service');
    
    try {
      set({ systemLoading: true });
      
      // Check system health
      const healthResponse = await systemService.healthCheck();
      if (!healthResponse.success) {
        throw new Error('System health check failed');
      }
      
      // Check model status
      const modelResponse = await attendanceService.getModelStatus();
      set({ modelReady: modelResponse.data?.model_ready || false });
      
      // Get system status
      const statusResponse = await systemService.getSystemStatus();
      if (statusResponse.success && statusResponse.data) {
        set({ systemStatus: statusResponse.data });
      }
      
      set({ systemLoading: false });
    } catch (error) {
      set({ systemLoading: false });
      get().addNotification('Failed to initialize app');
      console.error('Initialization error:', error);
    }
  },
  
  refreshData: async () => {
    const { studentService, attendanceService } = await import('@/services/api.service');
    
    try {
      // Refresh students
      set({ studentsLoading: true });
      const studentsResponse = await studentService.getStudents(true);
      if (studentsResponse.success) {
        set({ students: studentsResponse.students || [] });
      }
      set({ studentsLoading: false });
      
      // Refresh today's attendance
      set({ attendanceLoading: true });
      const attendanceResponse = await attendanceService.getAttendance();
      if (attendanceResponse.success && attendanceResponse.report) {
        set({ attendanceRecords: attendanceResponse.report.attendance || [] });
      }
      set({ attendanceLoading: false });
      
    } catch (error) {
      set({ studentsLoading: false, attendanceLoading: false });
      get().addNotification('Failed to refresh data');
      console.error('Refresh error:', error);
    }
  },
}));