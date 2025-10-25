'use client';

import React from 'react';
import { Student, UpdateStudentData } from '@/types/student';
import { EditStudentForm } from './edit-student-form';

interface EditStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (studentId: number, data: UpdateStudentData) => Promise<void>;
  loading?: boolean;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdate,
  loading = false,
}) => {
  if (!isOpen || !student) return null;

  const handleSubmit = async (studentId: number, data: UpdateStudentData) => {
    await onUpdate(studentId, data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <EditStudentForm
          student={student}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </div>
  );
};