import { create } from 'zustand'
import { Student, StudentFormData } from '@/types/student'
import { AttendanceRecord, AttendanceStats, FaceRecognitionResult } from '@/types/attendance'
import { studentService } from '@/lib/api/student-service'
import { attendanceService } from '@/lib/api/attendance-service'
import { systemService, SystemStatus } from '@/lib/api/system-service'

interface AppState {
  // Students state
  students: Student[]
  selectedStudent: Student | null
  isStudentsLoading: boolean
  studentsError: string | null
  
  // Attendance state
  attendanceRecords: AttendanceRecord[]
  todayAttendance: AttendanceRecord[]
  attendanceStats: AttendanceStats | null
  isAttendanceLoading: boolean
  attendanceError: string | null
  
  // System state
  systemStatus: SystemStatus | null
  isTraining: boolean
  isSystemLoading: boolean
  
  // Actions
  // Student actions
  setStudents: (students: Student[]) => void
  setSelectedStudent: (student: Student | null) => void
  addStudent: (student: Student) => void
  updateStudent: (id: string, student: Partial<Student>) => void
  removeStudent: (id: string) => void
  
  // Attendance actions
  setAttendanceRecords: (records: AttendanceRecord[]) => void
  setTodayAttendance: (records: AttendanceRecord[]) => void
  setAttendanceStats: (stats: AttendanceStats) => void
  
  // System actions
  setSystemStatus: (status: SystemStatus) => void
  setTraining: (training: boolean) => void
  
  // Loading states
  setStudentsLoading: (loading: boolean) => void
  setAttendanceLoading: (loading: boolean) => void
  setSystemLoading: (loading: boolean) => void
  
  // Error handling
  setStudentsError: (error: string | null) => void
  setAttendanceError: (error: string | null) => void
  
  // Async actions
  fetchStudents: () => Promise<void>
  registerStudent: (data: StudentFormData) => Promise<boolean>
  deleteStudent: (id: string) => Promise<boolean>
  
  fetchTodayAttendance: () => Promise<void>
  fetchAttendanceStats: () => Promise<void>
  markAttendance: (imageData: string) => Promise<FaceRecognitionResult[]>
  
  fetchSystemStatus: () => Promise<void>
  trainModel: () => Promise<boolean>
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  students: [],
  selectedStudent: null,
  isStudentsLoading: false,
  studentsError: null,
  
  attendanceRecords: [],
  todayAttendance: [],
  attendanceStats: null,
  isAttendanceLoading: false,
  attendanceError: null,
  
  systemStatus: null,
  isTraining: false,
  isSystemLoading: false,

  // Synchronous actions
  setStudents: (students) => set({ students }),
  setSelectedStudent: (selectedStudent) => set({ selectedStudent }),
  addStudent: (student) => set((state) => ({ 
    students: [...state.students, student] 
  })),
  updateStudent: (id, updatedStudent) => set((state) => ({
    students: state.students.map(s => 
      s.id === id ? { ...s, ...updatedStudent } : s
    ),
    selectedStudent: state.selectedStudent?.id === id 
      ? { ...state.selectedStudent, ...updatedStudent }
      : state.selectedStudent
  })),
  removeStudent: (id) => set((state) => ({
    students: state.students.filter(s => s.id !== id),
    selectedStudent: state.selectedStudent?.id === id ? null : state.selectedStudent
  })),
  
  setAttendanceRecords: (attendanceRecords) => set({ attendanceRecords }),
  setTodayAttendance: (todayAttendance) => set({ todayAttendance }),
  setAttendanceStats: (attendanceStats) => set({ attendanceStats }),
  
  setSystemStatus: (systemStatus) => set({ systemStatus }),
  setTraining: (isTraining) => set({ isTraining }),
  
  setStudentsLoading: (isStudentsLoading) => set({ isStudentsLoading }),
  setAttendanceLoading: (isAttendanceLoading) => set({ isAttendanceLoading }),
  setSystemLoading: (isSystemLoading) => set({ isSystemLoading }),
  
  setStudentsError: (studentsError) => set({ studentsError }),
  setAttendanceError: (attendanceError) => set({ attendanceError }),

  // Async actions
  fetchStudents: async () => {
    set({ isStudentsLoading: true, studentsError: null })
    try {
      const response = await studentService.getAllStudents()
      if (response.success) {
        set({ students: response.data || [] })
      } else {
        set({ studentsError: response.message || 'Failed to fetch students' })
      }
    } catch (error: any) {
      set({ studentsError: error.message || 'Failed to fetch students' })
    } finally {
      set({ isStudentsLoading: false })
    }
  },

  registerStudent: async (data) => {
    set({ studentsError: null })
    try {
      const response = await studentService.registerStudent(data)
      if (response.success) {
        // Refresh students list
        await get().fetchStudents()
        return true
      } else {
        set({ studentsError: response.message || 'Failed to register student' })
        return false
      }
    } catch (error: any) {
      set({ studentsError: error.message || 'Failed to register student' })
      return false
    }
  },

  deleteStudent: async (id) => {
    set({ studentsError: null })
    try {
      const response = await studentService.deleteStudent(id)
      if (response.success) {
        get().removeStudent(id)
        return true
      } else {
        set({ studentsError: response.message || 'Failed to delete student' })
        return false
      }
    } catch (error: any) {
      set({ studentsError: error.message || 'Failed to delete student' })
      return false
    }
  },

  fetchTodayAttendance: async () => {
    set({ isAttendanceLoading: true, attendanceError: null })
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await attendanceService.getAttendanceByDate(today)
      if (response.success) {
        set({ todayAttendance: response.data || [] })
      } else {
        set({ attendanceError: response.message || 'Failed to fetch attendance' })
      }
    } catch (error: any) {
      set({ attendanceError: error.message || 'Failed to fetch attendance' })
    } finally {
      set({ isAttendanceLoading: false })
    }
  },

  fetchAttendanceStats: async () => {
    try {
      const response = await attendanceService.getStats()
      if (response.success) {
        set({ attendanceStats: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch attendance stats:', error)
    }
  },

  markAttendance: async (imageData) => {
    set({ attendanceError: null })
    try {
      const response = await attendanceService.recognizeFaces(imageData)
      if (response.success && response.data) {
        // Mark attendance for recognized faces
        if (response.data.length > 0) {
          await attendanceService.markAttendance(response.data)
          // Refresh today's attendance
          await get().fetchTodayAttendance()
          await get().fetchAttendanceStats()
        }
        return response.data
      } else {
        set({ attendanceError: response.message || 'Recognition failed' })
        return []
      }
    } catch (error: any) {
      set({ attendanceError: error.message || 'Recognition failed' })
      return []
    }
  },

  fetchSystemStatus: async () => {
    set({ isSystemLoading: true })
    try {
      const response = await systemService.getStatus()
      if (response.success) {
        set({ systemStatus: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch system status:', error)
    } finally {
      set({ isSystemLoading: false })
    }
  },

  trainModel: async () => {
    set({ isTraining: true })
    try {
      const response = await systemService.trainModel()
      if (response.success) {
        // Refresh system status after training
        await get().fetchSystemStatus()
        return true
      }
      return false
    } catch (error: any) {
      console.error('Training failed:', error)
      return false
    } finally {
      set({ isTraining: false })
    }
  },
}))