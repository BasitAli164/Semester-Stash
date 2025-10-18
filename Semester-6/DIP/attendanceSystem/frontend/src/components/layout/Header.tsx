'use client';

import { useAppStore } from '@/store/store';

export function Header() {
  const { activeTab } = useAppStore();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'attendance': return 'Take Attendance';
      case 'students': return 'Student Management';
      case 'records': return 'Attendance Records';
      case 'system': return 'System Management';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Smart Face Recognition Attendance System
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}