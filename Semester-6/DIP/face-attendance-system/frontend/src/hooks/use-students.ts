'use client';

import { useState, useCallback } from 'react';
import { Student, CreateStudentData, UpdateStudentData } from '@/types/student';
import { studentsApi } from '@/lib/api/students';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.getAll();
      setStudents(response.students);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch students';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (studentData: CreateStudentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.create(studentData);
      setStudents(prev => [...prev, response.student]);
      return response.student;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create student';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = useCallback(async (studentId: number, studentData: UpdateStudentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.update(studentId, studentData);
      setStudents(prev => prev.map(student => 
        student.id === studentId ? response.student : student
      ));
      return response.student;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update student';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (studentId: number) => {
    try {
      setLoading(true);
      setError(null);
      await studentsApi.delete(studentId);
      setStudents(prev => prev.filter(student => student.id !== studentId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete student';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}