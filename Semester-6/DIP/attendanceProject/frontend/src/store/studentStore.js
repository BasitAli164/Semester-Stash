import { studentAPI } from '../lib/api'

export const studentStore = (set, get) => ({
  students: [],
  currentStudent: null,
  studentsLoading: false,
  studentStats: null,
  
  // Fetch all students
  fetchStudents: async (params = {}) => {
    set({ studentsLoading: true, error: null })
    try {
      const response = await studentAPI.getAll(params)
      set({ 
        students: response.data.data.students,
        studentsLoading: false 
      })
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch students'
      set({ 
        studentsLoading: false, 
        error: errorMessage 
      })
    }
  },
  
  // Register new student
  registerStudent: async (formData) => {
    set({ studentsLoading: true, error: null })
    try {
      const response = await studentAPI.register(formData)
      const newStudent = response.data.student
      
      set(state => ({
        students: [newStudent, ...state.students],
        studentsLoading: false
      }))
      
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to register student'
      set({ 
        studentsLoading: false, 
        error: errorMessage 
      })
      return { success: false, error: errorMessage }
    }
  },
  
  // Fetch student by ID
  fetchStudent: async (id) => {
    set({ studentsLoading: true, error: null })
    try {
      const response = await studentAPI.getById(id)
      set({ 
        currentStudent: response.data.student,
        studentsLoading: false 
      })
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch student'
      set({ 
        studentsLoading: false, 
        error: errorMessage 
      })
    }
  },
  
  // Toggle student active status
  toggleStudentActive: async (id) => {
    set({ error: null })
    try {
      const response = await studentAPI.toggleActive(id)
      const updatedStudent = response.data.student
      
      set(state => ({
        students: state.students.map(student =>
          student.id === id ? updatedStudent : student
        ),
        currentStudent: state.currentStudent?.id === id ? updatedStudent : state.currentStudent
      }))
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update student'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },
  
  // Add face images to student
  addStudentFaces: async (id, formData) => {
    set({ studentsLoading: true, error: null })
    try {
      const response = await studentAPI.addFaces(id, formData)
      
      set(state => ({
        students: state.students.map(student =>
          student.id === id 
            ? { ...student, embedding_count: response.data.total_embeddings }
            : student
        ),
        studentsLoading: false
      }))
      
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add face images'
      set({ 
        studentsLoading: false, 
        error: errorMessage 
      })
      return { success: false, error: errorMessage }
    }
  },
  
  // Fetch student statistics
  fetchStudentStats: async () => {
    try {
      const response = await studentAPI.getStats()
      set({ studentStats: response.data.data })
    } catch (error) {
      console.error('Failed to fetch student stats:', error)
    }
  },
  
  // Clear current student
  clearCurrentStudent: () => set({ currentStudent: null }),
})