import { StorageStats } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StorageInfoProps {
  storageStats: StorageStats | null;
  systemLoading: boolean;
}

export function StorageInfo({ storageStats, systemLoading }: StorageInfoProps) {
  if (systemLoading || !storageStats) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Storage Information</h2>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    total_images,
    total_size_mb,
    students_with_faces,
    model_size_mb
  } = storageStats;

  const storageUsagePercent = Math.min((total_size_mb / 1000) * 100, 100); // Assuming 1GB max for demo

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Storage Information</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Storage Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Storage Usage</span>
              <span className="font-medium text-gray-900">
                {total_size_mb.toFixed(1)} MB / 1000 MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  storageUsagePercent >= 90 ? 'bg-red-500' :
                  storageUsagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${storageUsagePercent}%` }}
              ></div>
            </div>
          </div>

          {/* Storage Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{total_images}</div>
              <div className="text-sm text-blue-700">Face Images</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{students_with_faces}</div>
              <div className="text-sm text-green-700">Students with Faces</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{total_size_mb.toFixed(1)} MB</div>
              <div className="text-sm text-purple-700">Total Size</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{model_size_mb.toFixed(1)} MB</div>
              <div className="text-sm text-orange-700">Model Size</div>
            </div>
          </div>

          {/* Storage Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">Storage Tips:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Regularly clean up unused face images</li>
              <li>• Export and archive old attendance records</li>
              <li>• Monitor storage usage to avoid system issues</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}