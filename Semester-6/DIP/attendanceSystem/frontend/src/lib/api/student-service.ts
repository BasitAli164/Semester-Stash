import api from './client'
import { ApiResponse, PaginatedResponse } from '@/types/api'
import { Student } from '@/types/student'

export const studentService = {
  // Get all students - FIXED VERSION
  getAllStudents: (): Promise<ApiResponse<Student[]>> =>
    api.get('/students').then(res => {
      const response = res.data
      console.log('🔧 StudentService - Raw API response:', response)
      
      // ✅ Extract students array from different possible response formats
      let studentsData: Student[] = []
      
      if (Array.isArray(response)) {
        // Format 1: Response is directly the array
        studentsData = response
      } else if (response && Array.isArray(response.data)) {
        // Format 2: Response has data property with array
        studentsData = response.data
      } else if (response && Array.isArray(response.students)) {
        // Format 3: Response has students property with array  
        studentsData = response.students
      } else if (response && response.success && Array.isArray(response.data?.students)) {
        // Format 4: Nested structure { data: { students: [] }, success: true }
        studentsData = response.data.students
      } else if (response && response.success && Array.isArray(response.students)) {
        // Format 5: { students: [], success: true }
        studentsData = response.students
      }
      
      console.log('🔧 StudentService - Extracted students:', studentsData.length)
      
      return {
        success: true,
        data: studentsData
      }
    }),

  // Get student by ID
  getStudentById: (id: string): Promise<ApiResponse<Student>> =>
    api.get(`/students/${id}`).then(res => res.data),

  // Register new student
  registerStudent: (studentData: Omit<Student, 'id' | 'created_at' | 'registration_date'>): Promise<ApiResponse> =>
    api.post('/students', studentData).then(res => res.data),

  // Update student
  updateStudent: (id: string, studentData: Partial<Student>): Promise<ApiResponse> =>
    api.put(`/students/${id}`, studentData).then(res => res.data),

  // Delete student
  deleteStudent: (id: string): Promise<ApiResponse> =>
    api.delete(`/students/${id}`).then(res => res.data),

  // Capture face images
  captureFaceImages: (studentId: string, images: string[]): Promise<ApiResponse<{ images_captured: number }>> =>
    api.post(`/students/${studentId}/capture`, { images }).then(res => res.data),
}