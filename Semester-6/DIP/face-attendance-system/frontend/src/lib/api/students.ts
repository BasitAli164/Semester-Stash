import { apiClient } from './client';
import { Student, CreateStudentData, UpdateStudentData, StudentsResponse, StudentResponse } from '@/types/student';

export const studentsApi = {
  async getAll(): Promise<StudentsResponse> {
    const response = await apiClient.get<StudentsResponse>('/students/'); // Add trailing slash
    return response.data;
  },

  async getById(studentId: number): Promise<StudentResponse> {
    const response = await apiClient.get<StudentResponse>(`/students/${studentId}`);
    return response.data;
  },

  async create(studentData: CreateStudentData): Promise<StudentResponse> {
    const formData = new FormData();
    formData.append('name', studentData.name);
    formData.append('student_id', studentData.student_id);
    formData.append('class', studentData.class || '');
    
    // Append each image file
    studentData.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await apiClient.post<StudentResponse>('/students/', formData, { // Add trailing slash
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
    return response.data;
  },


async update(studentId: number, studentData: UpdateStudentData): Promise<StudentResponse> {
    const response = await apiClient.put<StudentResponse>(`/students/${studentId}`, studentData);
    return response.data;
  },


  async delete(studentId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/students/${studentId}`);
    return response.data;
  },

  async getEmbeddings(): Promise<any> {
    const response = await apiClient.get('/students/embeddings');
    return response.data;
  },
};