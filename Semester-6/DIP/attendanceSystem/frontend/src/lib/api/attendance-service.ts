import api from './client'
import { ApiResponse } from '@/types/api'
import { AttendanceRecord, AttendanceStats, FaceRecognitionResult } from '@/types/attendance'

export const attendanceService = {
  // Recognize faces from image
  recognizeFaces: (imageData: string): Promise<ApiResponse<FaceRecognitionResult[]>> =>
    api.post('/attendance/recognize', { image: imageData }).then(res => res.data),

  // Mark attendance
  markAttendance: (recognizedFaces: FaceRecognitionResult[]): Promise<ApiResponse<{ marked_count: number }>> =>
    api.post('/attendance/mark', { recognized_faces: recognizedFaces }).then(res => res.data),

  // Get attendance by date
  getAttendanceByDate: (date: string): Promise<ApiResponse<AttendanceRecord[]>> =>
    api.get(`/attendance?date=${date}`).then(res => res.data),

  // Get attendance statistics
  getStats: (date?: string): Promise<ApiResponse<AttendanceStats>> => {
    const url = date ? `/attendance/stats?date=${date}` : '/attendance/stats'
    return api.get(url).then(res => res.data)
  },

  // Export attendance data
  exportAttendance: (startDate: string, endDate: string): Promise<Blob> =>
    api.get(`/attendance/export?start_date=${startDate}&end_date=${endDate}`, {
      responseType: 'blob'
    }).then(res => res.data),
}