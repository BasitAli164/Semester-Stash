import { create } from 'zustand'
import { attendanceService } from '@/lib/api'
import { 
  Attendance, 
  AdminAttendanceStats, 
  AttendanceReportsFilter, 
  PaginatedResponse, 
  MarkAttendanceData, 
  MarkManualAttendanceData,
  ApiResponse 
} from '@/lib/types'

interface AttendanceState {
  // State
  attendanceRecords: Attendance[]
  adminStats: AdminAttendanceStats | null
  reportsPagination: PaginatedResponse<Attendance> | null
  isLoading: boolean
  error: string | null
  lastMarkedAttendance: Attendance | null

  // Actions - Fix return types
  markAttendance: (data: MarkAttendanceData) => Promise<ApiResponse<{ attendance: Attendance; already_marked: boolean }>>
  markManualAttendance: (data: MarkManualAttendanceData) => Promise<ApiResponse<{ attendance: Attendance }>>
  getReports: (filters?: AttendanceReportsFilter) => Promise<void>
  getAdminStats: () => Promise<void>
  exportAttendance: (start_date?: string, end_date?: string) => Promise<void>
  clearLastMarkedAttendance: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  // Initial state
  attendanceRecords: [],
  adminStats: null,
  reportsPagination: null,
  isLoading: false,
  error: null,
  lastMarkedAttendance: null,

  // Actions
  markAttendance: async (data: MarkAttendanceData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await attendanceService.markAttendance(data)
      const attendance = response.data?.attendance
      
      set({
        lastMarkedAttendance: attendance || null,
        isLoading: false,
        error: null,
      })

      return response
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to mark attendance',
        lastMarkedAttendance: null,
      })
      throw error
    }
  },

  markManualAttendance: async (data: MarkManualAttendanceData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await attendanceService.markManualAttendance(data)
      const newAttendance = response.data?.attendance
      
      // Add to records if it's for current user or in admin view
      if (newAttendance) {
        const { attendanceRecords } = get()
        set({
          attendanceRecords: [newAttendance, ...attendanceRecords],
          isLoading: false,
          error: null,
        })
      } else {
        set({ isLoading: false, error: null })
      }

      return response
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to mark manual attendance' })
      throw error
    }
  },

  getReports: async (filters: AttendanceReportsFilter = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await attendanceService.getReports(filters)
      set({
        attendanceRecords: response.data?.data || [],
        reportsPagination: response.data || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch attendance reports',
        attendanceRecords: [],
        reportsPagination: null,
      })
      throw error
    }
  },

  getAdminStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await attendanceService.getAdminStats()
      set({
        adminStats: response.data?.data || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch admin stats',
        adminStats: null,
      })
      throw error
    }
  },

  exportAttendance: async (start_date?: string, end_date?: string) => {
    set({ isLoading: true, error: null })
    try {
      const blob = await attendanceService.exportAttendance(start_date, end_date)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      set({ isLoading: false, error: null })
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to export attendance' })
      throw error
    }
  },

  clearLastMarkedAttendance: () => {
    set({ lastMarkedAttendance: null })
  },

  clearError: () => {
    set({ error: null })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))