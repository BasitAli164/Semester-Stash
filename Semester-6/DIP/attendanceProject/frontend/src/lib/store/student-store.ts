import { create } from 'zustand'
import { studentService } from '@/lib/api'
import { User, Attendance, StudentStats, StudentDashboardData, AttendanceHistoryFilter, PaginatedResponse } from '@/lib/types'

interface StudentState {
  // State
  profile: User | null
  todayAttendance: Attendance | null
  attendanceHistory: Attendance[]
  attendanceStats: StudentStats | null
  dashboardData: StudentDashboardData | null
  attendancePagination: PaginatedResponse<Attendance> | null
  isLoading: boolean
  error: string | null

  // Actions
  getProfile: () => Promise<void>
  updateProfile: (profileData: { name?: string; email?: string }) => Promise<void>
  getTodayAttendance: () => Promise<void>
  getAttendanceHistory: (filters?: AttendanceHistoryFilter) => Promise<void>
  getAttendanceStats: () => Promise<void>
  getDashboard: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useStudentStore = create<StudentState>((set, get) => ({
  // Initial state
  profile: null,
  todayAttendance: null,
  attendanceHistory: [],
  attendanceStats: null,
  dashboardData: null,
  attendancePagination: null,
  isLoading: false,
  error: null,

  // Actions
  getProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await studentService.getProfile()
      set({
        profile: response.data?.user || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch profile',
        profile: null,
      })
      throw error
    }
  },

  updateProfile: async (profileData: { name?: string; email?: string }) => {
    set({ isLoading: true, error: null })
    try {
      const response = await studentService.updateProfile(profileData)
      const updatedProfile = response.data?.user
      
      set({
        profile: updatedProfile || get().profile,
        isLoading: false,
        error: null,
      })

      // Also update dashboard data if it exists
      const { dashboardData } = get()
      if (dashboardData && updatedProfile) {
        set({
          dashboardData: {
            ...dashboardData,
            user: updatedProfile,
          },
        })
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to update profile' })
      throw error
    }
  },

  getTodayAttendance: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await studentService.getTodayAttendance()
      set({
        todayAttendance: response.data?.attendance || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch today\'s attendance',
        todayAttendance: null,
      })
      throw error
    }
  },

  getAttendanceHistory: async (filters: AttendanceHistoryFilter = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await studentService.getAttendanceHistory(filters)
      set({
        attendanceHistory: response.data?.data || [],
        attendancePagination: response.data || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch attendance history',
        attendanceHistory: [],
        attendancePagination: null,
      })
      throw error
    }
  },

  getAttendanceStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await studentService.getAttendanceStats()
      set({
        attendanceStats: response.data?.data || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch attendance stats',
        attendanceStats: null,
      })
      throw error
    }
  },

  getDashboard: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await studentService.getDashboard()
      set({
        dashboardData: response.data?.data || null,
        profile: response.data?.data?.user || get().profile,
        todayAttendance: response.data?.data?.today_attendance || get().todayAttendance,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch dashboard data',
        dashboardData: null,
      })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))