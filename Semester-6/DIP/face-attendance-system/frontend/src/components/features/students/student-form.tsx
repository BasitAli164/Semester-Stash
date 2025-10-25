'use client';

import React, { useState } from 'react';
import { Student, StudentFormData } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ImageUpload } from './image-upload';

interface StudentFormProps {
  student?: Student; // For edit mode
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    student_id: student?.student_id || '',
    class: student?.class || '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
    }

    if (!student && images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        images,
      });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImagesChange = (files: File[]) => {
    setImages(files);
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {student ? 'Edit Student' : 'Register New Student'}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter student's full name"
              required
              disabled={isLoading}
            />

            <Input
              label="Student ID"
              value={formData.student_id}
              onChange={(e) => handleInputChange('student_id', e.target.value)}
              error={errors.student_id}
              placeholder="Enter student ID"
              required
              disabled={isLoading || !!student} // Disable editing student_id in edit mode
            />

            <Input
              label="Class"
              value={formData.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
              error={errors.class}
              placeholder="Enter class name"
              disabled={isLoading}
            />
          </div>

          {!student && (
            <ImageUpload
              onImagesChange={handleImagesChange}
              maxImages={5}
            />
          )}

          {errors.images && (
            <p className="text-sm text-red-600">{errors.images}</p>
          )}

          {student && (
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> To update face recognition data, you'll need to 
                re-register the student with new images.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {student ? 'Update Student' : 'Register Student'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};