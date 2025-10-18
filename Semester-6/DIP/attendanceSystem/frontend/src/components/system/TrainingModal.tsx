'use client';

import { useState, useEffect } from 'react';
import { TrainingStatus as TrainingStatusType } from '@/types';
import { Button } from '@/components/ui/button';

interface TrainingModalProps {
  trainingStatus: TrainingStatusType | null;
  onClose: () => void;
  onTrain: () => Promise<void>;
}

export function TrainingModal({ trainingStatus, onClose, onTrain }: TrainingModalProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    try {
      await onTrain();
      setTrainingProgress(100);
      
      // Show success for 2 seconds then close
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Training failed:', error);
      setIsTraining(false);
    }
  };

  const readyStudents = trainingStatus?.ready_students || 0;
  const totalImages = trainingStatus?.total_images || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {isTraining ? 'Training in Progress...' : 'Train Face Recognition Model'}
              </h3>

              {!isTraining ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Training Summary:</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Ready Students:</span>
                        <span className="font-medium">{readyStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Images:</span>
                        <span className="font-medium">{totalImages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Time:</span>
                        <span className="font-medium">1-3 minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Important:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• System may be slower during training</li>
                      <li>• Do not close the browser</li>
                      <li>• Attendance taking will be temporarily disabled</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Training Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Training Progress</span>
                      <span className="font-medium text-gray-900">{trainingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${trainingProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Training Steps */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className={`flex items-center ${trainingProgress >= 20 ? 'text-green-600' : ''}`}>
                      <span className="mr-2">
                        {trainingProgress >= 20 ? '✅' : '⏳'}
                      </span>
                      Loading training data...
                    </div>
                    <div className={`flex items-center ${trainingProgress >= 50 ? 'text-green-600' : ''}`}>
                      <span className="mr-2">
                        {trainingProgress >= 50 ? '✅' : '⏳'}
                      </span>
                      Extracting face features...
                    </div>
                    <div className={`flex items-center ${trainingProgress >= 80 ? 'text-green-600' : ''}`}>
                      <span className="mr-2">
                        {trainingProgress >= 80 ? '✅' : '⏳'}
                      </span>
                      Building recognition model...
                    </div>
                    <div className={`flex items-center ${trainingProgress >= 100 ? 'text-green-600' : ''}`}>
                      <span className="mr-2">
                        {trainingProgress >= 100 ? '✅' : '⏳'}
                      </span>
                      Saving model and optimizing...
                    </div>
                  </div>

                  {trainingProgress >= 100 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-green-600 text-xl mr-2">✅</span>
                        <span className="text-green-800 font-medium">
                          Training completed successfully!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                {!isTraining && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isTraining}
                    className="mt-3 sm:mt-0"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleTrain}
                  loading={isTraining}
                  disabled={isTraining || trainingProgress >= 100}
                  className={isTraining ? 'w-full' : ''}
                >
                  {isTraining 
                    ? trainingProgress >= 100 
                      ? 'Completed!' 
                      : 'Training...' 
                    : 'Start Training'
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}