'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAppStore } from '@/store/app.store';
import { useEffect } from 'react';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notifications, clearNotifications, initializeApp } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-80"
            >
              <span>{notification}</span>
              <button
                onClick={clearNotifications}
                className="text-slate-400 hover:text-white ml-4"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}