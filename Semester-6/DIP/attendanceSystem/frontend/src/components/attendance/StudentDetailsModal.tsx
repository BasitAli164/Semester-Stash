'use client';

import { useEffect, useState } from 'react';
import { Student } from '@/types';
import { Button } from '@/components/ui/button';

interface StudentDetailsModalProps {
  student: any;
  onClose: () => void;
}

export function StudentDetailsModal({ student, onClose }: StudentDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <span className="text-lg">✅</span>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Attendance Marked Successfully!
              </h3>
              
              <div className="mt-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {student.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Confidence:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {student.confidence}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {student.attendance_time || new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {student.attendance_message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">{student.attendance_message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              onClick={handleClose}
              className="w-full sm:ml-3 sm:w-auto"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}