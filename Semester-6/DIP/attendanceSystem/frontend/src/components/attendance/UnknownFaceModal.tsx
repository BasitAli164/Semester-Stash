'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface UnknownFaceModalProps {
  onClose: () => void;
  onRegister: () => void;
}

export function UnknownFaceModal({ onClose, onRegister }: UnknownFaceModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleRegister = () => {
    setIsVisible(false);
    setTimeout(onRegister, 300);
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
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
              <span className="text-lg">❓</span>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Unknown Face Detected
              </h3>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  This person is not registered in the system. To mark attendance, 
                  you need to register them first.
                </p>
                
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Next Steps:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Register the student with their details</li>
                    <li>• Capture multiple face images for training</li>
                    <li>• Train the face recognition model</li>
                    <li>• Then they can be recognized for attendance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={handleRegister}
              className="w-full sm:w-auto"
            >
              Register Student
            </Button>
            <Button
              onClick={handleClose}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}