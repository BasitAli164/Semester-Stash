import { api, handleApiResponse, handleApiError } from './axios-config'
import { Attendance, ApiResponse, PaginatedResponse } from '@/lib/types'

export interface MarkAttendanceData {
  image_data?: string
  image?: File
  threshold?: number
}

export interface MarkManualAttendanceData {
  user_id: number
  date: string
  status: 'present' | 'absent' | 'late'
}

export interface AttendanceReportsFilter {
  page?: number
  per_page?: number
  user_id?: number
  start_date?: string
  end_date?: string
  status?: 'present' | 'absent' | 'late'
}

export interface AdminAttendanceStats {
  overview: {
    total_students: number
    attendance_today: number
    attendance_rate_today: number
  }
  monthly: {
    present: number
    absent: number
    late: number
  }
  last_7_days: Array<{
    date: string
    attendance_count: number
  }>
}

class AttendanceService {
  // Mark attendance using face recognition (Student)
  async markAttendance(data: MarkAttendanceData): Promise<ApiResponse<{ attendance: Attendance; already_marked: boolean }>> {
    try {
      const formData = new FormData()
      
      if (data.image) {
        formData.append('image', data.image)
      } else if (data.image_data) {
        formData.append('image_data', data.image_data)
      }
      
      if (data.threshold) {
        formData.append('threshold', data.threshold.toString())
      }

      const response = await api.post('/api/attendance/mark', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return handleApiResponse<ApiResponse<{ attendance: Attendance; already_marked: boolean }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Manually mark attendance (Admin)
  async markManualAttendance(data: MarkManualAttendanceData): Promise<ApiResponse<{ attendance: Attendance }>> {
    try {
      const response = await api.post('/api/attendance/admin/mark-manual', data)
      return handleApiResponse<ApiResponse<{ attendance: Attendance }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get attendance reports (Admin)
  async getReports(filters: AttendanceReportsFilter = {}): Promise<ApiResponse<PaginatedResponse<Attendance>>> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })

      const response = await api.get(`/api/attendance/admin/reports?${params.toString()}`)
      return handleApiResponse<ApiResponse<PaginatedResponse<Attendance>>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get admin attendance statistics
  async getAdminStats(): Promise<ApiResponse<{ data: AdminAttendanceStats }>> {
    try {
      const response = await api.get('/api/attendance/admin/stats')
      return handleApiResponse<ApiResponse<{ data: AdminAttendanceStats }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Export attendance data to CSV (Admin)
  async exportAttendance(start_date?: string, end_date?: string): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      if (start_date) params.append('start_date', start_date)
      if (end_date) params.append('end_date', end_date)

      const response = await api.get(`/api/attendance/admin/export?${params.toString()}`, {
        responseType: 'blob',
      })
      
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const attendanceService = new AttendanceService()