'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ImageUpload } from './image-upload';
import { CreateStudentData } from '@/types/student';

interface StudentFormProps {
  onSubmit: (data: CreateStudentData) => Promise<void>;
  loading?: boolean;
  initialData?: {
    name?: string;
    student_id?: string;
    class?: string;
  };
}

export const StudentForm: React.FC<StudentFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    student_id: initialData?.student_id || '',
    class: initialData?.class || '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.student_id) {
      setError('Name and Student ID are required');
      return;
    }

    if (images.length === 0) {
      setError('At least one image is required');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        images,
      });
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
          Register New Student
        </h2>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <Input
            label="Class/Group"
            name="class"
            type="text"
            placeholder="Enter class or group name"
            value={formData.class}
            onChange={handleChange}
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Images *
            </label>
            <ImageUpload
              onImagesChange={setImages}
              maxImages={5}
            />
            <p className="text-sm text-gray-500 mt-2">
              Upload clear face images for better recognition accuracy
            </p>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={loading}
            className="w-full"
          >
            Register Student
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};