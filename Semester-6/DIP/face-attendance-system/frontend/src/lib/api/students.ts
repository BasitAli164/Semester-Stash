import { apiClient } from './client';
import { Student, StudentFormData, StudentsResponse } from '@/types/student';

export const studentsApi = {
  async getAllStudents(): Promise<StudentsResponse> {
    const response = await apiClient.get<StudentsResponse>('/students');
    return response.data;
  },

  async getStudentById(id: number): Promise<{ student: Student }> {
    const response = await apiClient.get<{ student: Student }>(`/students/${id}`);
    return response.data;
  },

  async registerStudent(formData: FormData): Promise<{ message: string; student: Student }> {
    const response = await apiClient.post<{ message: string; student: Student }>(
      '/students',
      formData
      // Remove the headers object - let axios handle FormData automatically
    );
    return response.data;
  },

  async updateStudent(id: number, data: { name?: string; class?: string }): Promise<{ message: string; student: Student }> {
    const response = await apiClient.put<{ message: string; student: Student }>(
      `/students/${id}`,
      data
    );
    return response.data;
  },

  async deleteStudent(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/students/${id}`);
    return response.data;
  },

  async getEmbeddings(): Promise<{ embeddings: any; count: number }> {
    const response = await apiClient.get('/students/embeddings');
    return response.data;
  },
};