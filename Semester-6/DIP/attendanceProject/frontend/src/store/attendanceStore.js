import { attendanceAPI, faceAPI } from '../lib/api'

export const attendanceStore = (set, get) => ({
  attendance: [],
  attendanceStats: null,
  todayAttendance: [],
  attendanceLoading: false,
  recognitionResult: null,
  
  // Mark attendance via face recognition
  markAttendance: async (imageData) => {
    set({ attendanceLoading: true, error: null, recognitionResult: null })
    try {
      const response = await attendanceAPI.mark({ image_data: imageData })
      const result = response.data
      
      set({ 
        attendanceLoading: false,
        recognitionResult: result
      })
      
      // Refresh today's attendance
      get().fetchTodayAttendance()
      
      return { success: true, data: result }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance'
      set({ 
        attendanceLoading: false, 
        error: errorMessage 
      })
      return { success: false, error: errorMessage }
    }
  },
  
  // Mark manual attendance
  markManualAttendance: async (data) => {
    set({ attendanceLoading: true, error: null })
    try {
      const response = await attendanceAPI.markManual(data)
      
      set({ attendanceLoading: false })
      
      // Refresh today's attendance
      get().fetchTodayAttendance()
      
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark manual attendance'
      set({ 
        attendanceLoading: false, 
        error: errorMessage 
      })
      return { success: false, error: errorMessage }
    }
  },
  
  // Fetch attendance reports
  fetchAttendanceReports: async (params = {}) => {
    set({ attendanceLoading: true, error: null })
    try {
      const response = await attendanceAPI.getReports(params)
      set({ 
        attendance: response.data.data.attendance,
        attendanceLoading: false 
      })
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance reports'
      set({ 
        attendanceLoading: false, 
        error: errorMessage 
      })
    }
  },
  
  // Fetch attendance statistics
  fetchAttendanceStats: async () => {
    try {
      const response = await attendanceAPI.getStats()
      set({ attendanceStats: response.data.data })
    } catch (error) {
      console.error('Failed to fetch attendance stats:', error)
    }
  },
  
  // Fetch today's attendance
  fetchTodayAttendance: async () => {
    try {
      const response = await attendanceAPI.getToday()
      set({ todayAttendance: response.data.data.attendance })
    } catch (error) {
      console.error('Failed to fetch today\'s attendance:', error)
    }
  },
  
  // Verify face against specific student
  verifyFace: async (studentId, imageData) => {
    set({ attendanceLoading: true, error: null })
    try {
      const response = await faceAPI.verify({
        student_id: studentId,
        image_data: imageData
      })
      
      set({ attendanceLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Face verification failed'
      set({ 
        attendanceLoading: false, 
        error: errorMessage 
      })
      return { success: false, error: errorMessage }
    }
  },
  
  // Clear recognition result
  clearRecognitionResult: () => set({ recognitionResult: null }),
})