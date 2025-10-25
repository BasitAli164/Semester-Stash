'use client';

import { useState, useCallback } from 'react';
import { Student, StudentFormData } from '@/types/student';
import { studentsApi } from '@/lib/api/students';
import { healthApi } from '@/lib/api/health';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBackendConnection = useCallback(async () => {
    try {
      await healthApi.checkBackendHealth();
      return true;
    } catch (err) {
      setError('Backend server is not running. Please start the backend server on port 5000.');
      return false;
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if backend is reachable first
      const isBackendReady = await checkBackendConnection();
      if (!isBackendReady) {
        return [];
      }

      const response = await studentsApi.getAllStudents();
      setStudents(response.students);
      return response.students;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch students. Check if backend is running.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [checkBackendConnection]);

  const registerStudent = useCallback(async (formData: StudentFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if backend is reachable first
      const isBackendReady = await checkBackendConnection();
      if (!isBackendReady) {
        throw new Error('Backend server is not running');
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('student_id', formData.student_id);
      data.append('class', formData.class);
      
      formData.images.forEach((image) => {
        data.append('images', image);
      });

      console.log('📤 Sending student registration request...');
      const response = await studentsApi.registerStudent(data);
      
      console.log('✅ Student registered successfully');
      // Refresh students list
      await fetchStudents();
      
      return response;
    } catch (err: any) {
      console.error('❌ Student registration failed:', err);
      
      // Don't redirect for FormData errors, just show the error
      if (err.status === 401) {
        const errorMessage = 'Authentication failed. Please check if your session is valid.';
        setError(errorMessage);
        throw new Error(errorMessage);
      } else {
        const errorMessage = err.message || 'Failed to register student';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchStudents, checkBackendConnection]);

  // ... rest of the hook remains the same
  const updateStudent = useCallback(async (id: number, data: { name?: string; class?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await studentsApi.updateStudent(id, data);
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === id ? response.student : student
      ));
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update student';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await studentsApi.deleteStudent(id);
      
      // Remove from local state
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    students,
    isLoading,
    error,
    fetchStudents,
    registerStudent,
    updateStudent,
    deleteStudent,
    clearError,
  };
}