'use client';

import React, { useState } from 'react';
import { User, Mail, Building, Phone, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentService } from '@/services/api.service';
import { useAppStore } from '@/store/app.store';
import { generateStudentId, validateEmail, validateStudentId } from '@/lib/utils';

interface StudentFormProps {
  onSuccess?: () => void;
}

export function StudentForm({ onSuccess }: StudentFormProps) {
  const { addNotification, refreshData } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: generateStudentId(),
    name: '',
    email: '',
    department: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
    } else if (!validateStudentId(formData.student_id)) {
      newErrors.student_id = 'Student ID can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await studentService.registerStudent(formData);
      
      if (response.success) {
        addNotification('Student registered successfully!');
        setFormData({
          student_id: generateStudentId(),
          name: '',
          email: '',
          department: '',
          phone: ''
        });
        setErrors({});
        await refreshData();
        onSuccess?.();
      } else {
        addNotification(response.message || 'Failed to register student');
        if (response.message?.includes('already exists')) {
          setErrors({ student_id: 'Student ID already exists' });
        }
      }
    } catch (error) {
      addNotification('Error registering student');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <User className="w-6 h-6 mr-2" />
          Register New Student
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student ID */}
            <div className="space-y-2">
              <Label htmlFor="student_id" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Student ID *
              </Label>
              <Input
                id="student_id"
                value={formData.student_id}
                onChange={(e) => handleChange('student_id', e.target.value)}
                placeholder="Enter student ID"
                className={errors.student_id ? 'border-red-500' : ''}
              />
              {errors.student_id && (
                <p className="text-red-500 text-sm">{errors.student_id}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Department
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Enter department"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Registering...' : 'Register Student'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}