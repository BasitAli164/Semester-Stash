'use client';

import { useAppStore } from '@/store/store';

export function Footer() {
  const { systemStatus } = useAppStore();
  
  const currentYear = new Date().getFullYear();
  
  const getSystemStatus = () => {
    if (!systemStatus) return 'Loading...';
    
    const modelStatus = systemStatus.attendance.model_ready ? 'Trained' : 'Not Trained';
    const studentCount = systemStatus.database.students_count;
    
    return `Model: ${modelStatus} | Students: ${studentCount}`;
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-600">
            <p>© {currentYear} Smart Attendance System. All rights reserved.</p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="hidden sm:inline">{getSystemStatus()}</span>
            <span>•</span>
            <span>v1.0.0</span>
            <span>•</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              systemStatus?.attendance.model_ready 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {systemStatus?.attendance.model_ready ? '🟢 Online' : '🟡 Training Required'}
            </span>
          </div>
        </div>
        
        {/* Mobile system status */}
        <div className="sm:hidden py-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 text-center">
            {getSystemStatus()}
          </div>
        </div>
      </div>
    </footer>
  );
}