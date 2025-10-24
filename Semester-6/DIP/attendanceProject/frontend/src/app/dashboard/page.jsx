// app/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  };

  const loadDashboardData = async () => {
    try {
      const [attendanceRes, statsRes] = await Promise.all([
        apiService.getTodayAttendance(),
        apiService.getAttendanceStats()
      ]);
      
      setTodayAttendance(attendanceRes.attendance);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      // This would integrate with webcam capture in a real implementation
      const response = await apiService.markAttendance();
      setTodayAttendance(response.attendance);
      alert('Attendance marked successfully!');
    } catch (error) {
      alert('Failed to mark attendance: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.name}</span>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Today's Attendance Status */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Today's Attendance
                </h3>
                <div className="mt-4">
                  {todayAttendance ? (
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-green-800">
                        ✅ Marked at {todayAttendance.time}
                      </p>
                      <p className="text-sm text-green-600">
                        Confidence: {todayAttendance.confidence || 'N/A'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="text-yellow-800">⏳ Not marked yet</p>
                      <button
                        onClick={handleMarkAttendance}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Mark Attendance
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            {stats && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Monthly Overview
                  </h3>
                  <div className="mt-4 space-y-2">
                    <p>Present: {stats.monthly?.present || 0} days</p>
                    <p>Attendance Rate: {stats.overview?.attendance_rate_today || 0}%</p>
                    <p>Current Streak: {stats.current_streak || 0} days</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quick Actions
                </h3>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => router.push('/attendance')}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded text-left"
                  >
                    View Attendance History
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded text-left"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}