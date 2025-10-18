import { SystemStatus } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SystemHealthProps {
  systemStatus: SystemStatus | null;
  systemLoading: boolean;
}

export function SystemHealth({ systemStatus, systemLoading }: SystemHealthProps) {
  if (systemLoading || !systemStatus) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
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

  const healthItems = [
    {
      label: 'Face Recognition Model',
      status: systemStatus.attendance.model_ready ? 'Operational' : 'Not Ready',
      color: systemStatus.attendance.model_ready ? 'green' : 'red',
      icon: systemStatus.attendance.model_ready ? '✅' : '❌'
    },
    {
      label: 'Database Connection',
      status: 'Connected',
      color: 'green',
      icon: '✅'
    },
    {
      label: 'File System',
      status: 'Healthy',
      color: 'green',
      icon: '✅'
    },
    {
      label: 'API Server',
      status: 'Running',
      color: 'green',
      icon: '✅'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.status}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.color === 'green' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.color === 'green' ? 'Healthy' : 'Issue'}
              </span>
            </div>
          ))}
        </div>

        {/* System Configuration */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">System Configuration</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Min Images for Training:</span>
              <span className="ml-2 font-medium text-gray-900">
                {systemStatus.system.min_images_for_training}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Confidence Threshold:</span>
              <span className="ml-2 font-medium text-gray-900">
                {systemStatus.system.recognition_confidence_threshold}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Students:</span>
              <span className="ml-2 font-medium text-gray-900">
                {systemStatus.database.students_count}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Model Status:</span>
              <span className="ml-2 font-medium text-gray-900">
                {systemStatus.attendance.model_ready ? 'Trained' : 'Not Trained'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}