import { api, handleApiResponse, handleApiError } from './axios-config'
import { User, Attendance, ApiResponse, PaginatedResponse } from '@/lib/types'

export interface StudentStats {
  current_month: {
    total_days: number
    present_days: number
    absent_days: number
    attendance_rate: number
  }
  current_streak: number
  total_attendance: number
}

export interface AttendanceHistoryFilter {
  page?: number
  per_page?: number
  start_date?: string
  end_date?: string
}

export interface StudentDashboardData {
  today_attendance: Attendance | null
  recent_attendance: Attendance[]
  monthly_stats: {
    present_days: number
    total_days: number
    attendance_rate: number
  }
  user: User
}

class StudentService {
  // Get student profile
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.get('/api/student/profile')
      return handleApiResponse<ApiResponse<{ user: User }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Update student profile
  async updateProfile(profileData: { name?: string; email?: string }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.put('/api/student/profile', profileData)
      return handleApiResponse<ApiResponse<{ user: User }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get today's attendance
  async getTodayAttendance(): Promise<ApiResponse<{ attendance: Attendance | null; date: string }>> {
    try {
      const response = await api.get('/api/student/attendance/today')
      return handleApiResponse<ApiResponse<{ attendance: Attendance | null; date: string }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get attendance history
  async getAttendanceHistory(filters: AttendanceHistoryFilter = {}): Promise<ApiResponse<PaginatedResponse<Attendance>>> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })

      const response = await api.get(`/api/student/attendance/history?${params.toString()}`)
      return handleApiResponse<ApiResponse<PaginatedResponse<Attendance>>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get attendance statistics
  async getAttendanceStats(): Promise<ApiResponse<{ data: StudentStats }>> {
    try {
      const response = await api.get('/api/student/attendance/stats')
      return handleApiResponse<ApiResponse<{ data: StudentStats }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get student dashboard data
  async getDashboard(): Promise<ApiResponse<{ data: StudentDashboardData }>> {
    try {
      const response = await api.get('/api/student/dashboard')
      return handleApiResponse<ApiResponse<{ data: StudentDashboardData }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const studentService = new StudentService()