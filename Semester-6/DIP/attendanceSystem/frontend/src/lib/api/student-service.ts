import api from './client'
import { ApiResponse, PaginatedResponse } from '@/types/api'
import { Student } from '@/types/student'

export const studentService = {
  // Get all students
  getAllStudents: (): Promise<ApiResponse<Student[]>> =>
    api.get('/students').then(res => res.data),

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