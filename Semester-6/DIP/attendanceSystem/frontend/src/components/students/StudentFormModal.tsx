'use client';

import { useEffect, useState } from 'react';
import { Student, StudentFormData } from '@/types';
import { useAppStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Make sure this is your custom Input component

interface StudentFormModalProps {
  student?: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function StudentFormModal({ student, onClose, onSuccess }: StudentFormModalProps) {
  // Initialize with empty strings instead of undefined
  const [formData, setFormData] = useState<StudentFormData>({
    student_id: '',
    name: '',
    email: '',
    department: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerStudent, updateStudent } = useAppStore();

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id,
        name: student.name,
        email: student.email,
        department: student.department,
        phone: student.phone || '' // Ensure phone is never undefined
      });
    }
  }, [student]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare data for API - remove empty optional fields
      const submitData: StudentFormData = {
        student_id: formData.student_id,
        name: formData.name,
        email: formData.email || '', // Ensure email is never undefined
        department: formData.department || '', // Ensure department is never undefined
        phone: formData.phone || undefined // Only include phone if it has value
      };

      const success = student 
        ? await updateStudent(student.student_id, submitData)
        : await registerStudent(submitData);

      if (success) {
        onSuccess();
      } else {
        alert('Failed to save student. Please try again.');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isEditing = !!student;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {isEditing ? 'Edit Student' : 'Register New Student'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Student ID"
                    value={formData.student_id}
                    onChange={(e) => handleChange('student_id', e.target.value)}
                    error={errors.student_id}
                    disabled={isEditing}
                    placeholder="e.g., 20230001"
                  />

                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="e.g., John Doe"
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    placeholder="e.g., john.doe@university.edu"
                  />

                  <Input
                    label="Department"
                    value={formData.department || ''}
                    onChange={(e) => handleChange('department', e.target.value)}
                    error={errors.department}
                    placeholder="e.g., Computer Science"
                  />

                  <Input
                    label="Phone (Optional)"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="e.g., +1234567890"
                  />
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="mt-3 sm:mt-0"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? 'Saving...' 
                      : isEditing 
                        ? 'Update Student' 
                        : 'Register Student'
                    }
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}