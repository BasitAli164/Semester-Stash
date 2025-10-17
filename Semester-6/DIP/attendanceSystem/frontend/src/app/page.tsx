'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app.store';

export default function Home() {
  const router = useRouter();
  const { initializeApp } = useAppStore();

  useEffect(() => {
    initializeApp();
    router.push('/dashboard');
  }, [initializeApp, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <div className="w-10 h-10 bg-white rounded-lg"></div>
        </div>
        <h1 className="text-4xl font-bold mb-4">SmartAttend</h1>
        <p className="text-xl opacity-90">Loading your dashboard...</p>
        <div className="mt-8">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}