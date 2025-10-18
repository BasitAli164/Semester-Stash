import { TrainingStatus as TrainingStatusType } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TrainingStatusProps {
  trainingStatus: TrainingStatusType | null;
  systemLoading: boolean;
}

export function TrainingStatus({ trainingStatus, systemLoading }: TrainingStatusProps) {
  if (systemLoading || !trainingStatus) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Training Status</h2>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    total_students,
    ready_students,
    not_ready_students,
    total_images,
    model_trained,
    can_train,
    min_images_required
  } = trainingStatus;

  const trainingReady = can_train && ready_students > 0;
  const progress = total_students > 0 ? (ready_students / total_students) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Training Status</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            model_trained 
              ? 'bg-green-100 text-green-800' 
              : trainingReady
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {model_trained ? 'Model Trained' : trainingReady ? 'Ready to Train' : 'Not Ready'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Training Readiness</span>
              <span className="font-medium text-gray-900">
                {ready_students} / {total_students} students ready
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  progress >= 80 ? 'bg-green-500' :
                  progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Minimum {min_images_required} face images required per student
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{total_students}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{ready_students}</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{not_ready_students}</div>
              <div className="text-sm text-gray-600">Not Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{total_images}</div>
              <div className="text-sm text-gray-600">Total Images</div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Training Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• At least {min_images_required} face images per student</li>
              <li>• Minimum 1 student ready for training</li>
              <li>• Sufficient storage space available</li>
              <li>• System resources available</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}