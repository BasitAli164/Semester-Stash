'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/store';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '🏠', tab: 'dashboard' },
  { name: 'Take Attendance', href: '/attendance', icon: '📷', tab: 'attendance' },
  { name: 'Students', href: '/students', icon: '👨‍🎓', tab: 'students' },
  { name: 'Records', href: '/records', icon: '📊', tab: 'records' },
  { name: 'System', href: '/system', icon: '⚙️', tab: 'system' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setActiveTab } = useAppStore();

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/attendance')) return 'attendance';
    if (pathname.startsWith('/students')) return 'students';
    if (pathname.startsWith('/records')) return 'records';
    if (pathname.startsWith('/system')) return 'system';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const handleNavigation = (href: string, tab: string) => {
    setActiveTab(tab as any);
    router.push(href);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">
              Smart Attendance
            </h1>
          </div>
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href, item.tab)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors ${
                  activeTab === item.tab
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Sidebar Footer */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Smart Attendance</p>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}