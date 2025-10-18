'use client';

import { useState, useEffect } from 'react';
import { TrainingStatus as TrainingStatusType } from '@/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TrainingModalProps {
  trainingStatus: TrainingStatusType | null;
  onClose: () => void;
  onTrain: () => Promise<void>;
}

export function TrainingModal({ trainingStatus, onClose, onTrain }: TrainingModalProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const router = useRouter();

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
    setTrainingError(null);
    
    try {
      console.log('🚀 Starting training process...');
      await onTrain();
      console.log('✅ Training process completed');
      setTrainingProgress(100);
      
      // Show success for 2 seconds then close
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('❌ Training failed:', error);
      setTrainingError('Training failed. Please check the console for details.');
      setIsTraining(false);
    }
  };

  // Safe defaults for training status
  const readyStudents = trainingStatus?.ready_students || 0;
  const totalStudents = trainingStatus?.total_students || 0;
  const totalImages = trainingStatus?.total_images || 0;
  const canTrain = trainingStatus?.can_train || false;
  const minImagesRequired = trainingStatus?.min_images_required || 5;

  const handleNavigateToStudents = () => {
    onClose();
    router.push('/students');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">
            {isTraining ? 'Training in Progress...' : 'Train Face Recognition Model'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isTraining}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {trainingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">❌</span>
                <span className="text-red-800 font-medium">
                  {trainingError}
                </span>
              </div>
            </div>
          )}

          {!isTraining ? (
            <div className="space-y-4">
              {/* Training Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Training Summary:</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Ready Students:</span>
                    <span className="font-medium">{readyStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Students:</span>
                    <span className="font-medium">{totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Images:</span>
                    <span className="font-medium">{totalImages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Images Required:</span>
                    <span className="font-medium">{minImagesRequired} per student</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${canTrain ? 'text-green-600' : 'text-red-600'}`}>
                      {canTrain ? 'Ready to Train' : 'Not Ready'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Show different content based on readiness */}
              {canTrain ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Ready to Train! 🎉</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• You have {readyStudents} students with sufficient images</li>
                    <li>• Total of {totalImages} face images available</li>
                    <li>• Estimated training time: 1-3 minutes</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">Training Requirements Not Met</h4>
                  <div className="text-sm text-orange-800 space-y-2">
                    <p>To train the face recognition model, you need:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• At least 3 registered students</li>
                      <li>• Each student needs {minImagesRequired} face images</li>
                      <li>• Clear, well-lit face photos</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Current status:</strong> {totalStudents} students registered, {readyStudents} ready for training
                    </p>
                  </div>
                </div>
              )}

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• System may be slower during training</li>
                  <li>• Do not close the browser during training</li>
                  <li>• Attendance taking will be temporarily disabled</li>
                  {!canTrain && (
                    <li>• Register students and capture face images first</li>
                  )}
                </ul>
              </div>

              {/* Action for when not ready */}
              {!canTrain && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    You need to register students with face images before training.
                  </p>
                  <Button
                    onClick={handleNavigateToStudents}
                    variant="outline"
                  >
                    📝 Go to Students Page
                  </Button>
                </div>
              )}
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
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          {!isTraining && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isTraining}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleTrain}
            loading={isTraining}
            disabled={isTraining || trainingProgress >= 100 || !canTrain}
            className={isTraining ? 'w-full' : ''}
          >
            {isTraining 
              ? trainingProgress >= 100 
                ? 'Completed!' 
                : 'Training...' 
              : canTrain 
                ? 'Start Training' 
                : 'Requirements Not Met'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}