'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Student, UpdateStudentData } from '@/types/student';

interface EditStudentFormProps {
  student: Student;
  onSubmit: (studentId: number, data: UpdateStudentData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const EditStudentForm: React.FC<EditStudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: student.name,
    student_id: student.student_id,
    class: student.class || '',
  });
  const [error, setError] = useState('');

  // Update form when student prop changes
  useEffect(() => {
    setFormData({
      name: student.name,
      student_id: student.student_id,
      class: student.class || '',
    });
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.student_id) {
      setError('Name and Student ID are required');
      return;
    }

    try {
      await onSubmit(student.id, formData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Edit Student
        </h2>
        <p className="text-center text-gray-600">
          Update student information
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Full Name *"
              name="name"
              type="text"
              placeholder="Enter student's full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
            
            <Input
              label="Student ID *"
              name="student_id"
              type="text"
              placeholder="Enter student ID"
              value={formData.student_id}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <Input
              label="Class/Group"
              name="class"
              type="text"
              placeholder="Enter class or group name"
              value={formData.class}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Student Information Display */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium text-gray-900">Current Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Registration Date:</span>{' '}
                {new Date(student.registration_date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Face Data:</span>{' '}
                <span className={`px-2 py-1 text-xs rounded-full ${
                  student.has_face_embedding 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {student.has_face_embedding ? 'Registered' : 'Not Registered'}
                </span>
              </div>
              <div>
                <span className="font-medium">Images:</span> {student.image_paths.length}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={loading}
              className="flex-1"
            >
              Update Student
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};