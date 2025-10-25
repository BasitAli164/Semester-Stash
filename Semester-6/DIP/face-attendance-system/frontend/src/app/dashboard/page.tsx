'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAttendance } from '@/hooks/use-attendance';
import { useStudents } from '@/hooks/use-students';
import { useFaceRecognition } from '@/hooks/use-face-recognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Use your custom hooks to fetch real data
  const { todayAttendance, fetchTodayAttendance } = useAttendance();
  const { students, fetchStudents } = useStudents();
  const { systemStatus, getSystemStatus } = useFaceRecognition();
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchTodayAttendance(),
          fetchStudents(),
          getSystemStatus()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
        setLastUpdated(new Date());
      }
    };

    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTodayAttendance, fetchStudents, getSystemStatus]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRefresh = () => {
    fetchTodayAttendance();
    fetchStudents();
    getSystemStatus();
    setLastUpdated(new Date());
  };

  // Calculate statistics
  const todayPresentCount = todayAttendance.filter(record => record.status === 'Present').length;
  const totalStudentsCount = students.length;
  const studentsWithFaceData = students.filter(student => student.has_face_embedding).length;

  // Get recent activity (last 5 attendance records)
  const recentActivity = todayAttendance.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Face Attendance System
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.username}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Last Updated */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Dashboard Overview</h2>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Today's Attendance */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Today's Attendance</h3>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-blue-600">{todayPresentCount}</p>
                    <p className="text-sm text-gray-600">
                      {todayPresentCount === 1 ? 'Student' : 'Students'} marked present today
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total records: {todayAttendance.length}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Students */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Total Students</h3>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-green-600">{totalStudentsCount}</p>
                    <p className="text-sm text-gray-600">Registered students</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {studentsWithFaceData} with face data
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">System Status</h3>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : systemStatus ? (
                  <>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        systemStatus.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium capitalize">{systemStatus.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {studentsWithFaceData} / {totalStudentsCount} students ready
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Unknown</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">System status unavailable</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Face Recognition Ready */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Face Recognition</h3>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-purple-600">{studentsWithFaceData}</p>
                    <p className="text-sm text-gray-600">Faces registered</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalStudentsCount > 0 
                        ? Math.round((studentsWithFaceData / totalStudentsCount) * 100) 
                        : 0
                      }% completion
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/attendance/mark')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold">Mark Attendance</h3>
                  <p className="text-sm text-gray-600 mt-1">Use face recognition</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/students/register')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold">Register Student</h3>
                  <p className="text-sm text-gray-600 mt-1">Add new student</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/attendance')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold">View Attendance</h3>
                  <p className="text-sm text-gray-600 mt-1">Check today's records</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/recognition')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold">System Status</h3>
                  <p className="text-sm text-gray-600 mt-1">View detailed status</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/dashboard/attendance')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No recent activity to display</p>
                  <p className="text-sm mt-2">Mark some attendance to see activity here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{record.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • {record.class}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'Present' 
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'Late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}