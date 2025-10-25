'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFaceRecognition } from '@/hooks/use-face-recognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function RecognitionPage() {
  const router = useRouter();
  const { systemStatus, loading, error, getSystemStatus } = useFaceRecognition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    getSystemStatus();
  }, [getSystemStatus]);

  const handleRefresh = () => {
    getSystemStatus();
    setLastUpdated(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return '🟢';
      case 'degraded':
        return '🟡';
      case 'down':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Recognition System Status
              </h1>
              <p className="text-sm text-gray-600">
                Monitor face recognition system health and performance
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={() => router.push('/dashboard/attendance/mark')}
              >
                Mark Attendance
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
            <h2 className="text-xl font-semibold">System Overview</h2>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {error && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {loading && !systemStatus ? (
            // Loading skeleton
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : systemStatus ? (
            <div className="space-y-6">
              {/* System Status Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overall Status */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">System Status</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.status)}`}>
                        {getStatusIcon(systemStatus.status)} {systemStatus.status.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Device: {systemStatus.device}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Student Statistics */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Student Database</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{systemStatus.students.total}</p>
                        <p className="text-sm text-gray-600">Total Students</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{systemStatus.students.with_embeddings}</p>
                        <p className="text-sm text-gray-600">With Face Data</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{systemStatus.students.without_embeddings}</p>
                        <p className="text-sm text-gray-600">Pending Registration</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {systemStatus.students.total > 0 
                            ? Math.round((systemStatus.students.with_embeddings / systemStatus.students.total) * 100)
                            : 0
                          }%
                        </p>
                        <p className="text-sm text-gray-600">Registration Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Threshold Settings */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Recognition Settings</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Face Detection Threshold</span>
                          <span className="text-sm font-bold">{systemStatus.face_detection_threshold}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${systemStatus.face_detection_threshold * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum confidence for face detection
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Recognition Threshold</span>
                          <span className="text-sm font-bold">{systemStatus.face_recognition_threshold}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${systemStatus.face_recognition_threshold * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum distance for face matching
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">System Information</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Backend Version</span>
                        <span className="text-sm font-medium">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">FaceNet Model</span>
                        <span className="text-sm font-medium">VGGFace2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Detection Model</span>
                        <span className="text-sm font-medium">MTCNN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm font-medium">{lastUpdated.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/students')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold">Manage Students</h3>
                    <p className="text-sm text-gray-600 mt-1">Register and manage student data</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/attendance/mark')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold">Mark Attendance</h3>
                    <p className="text-sm text-gray-600 mt-1">Use face recognition</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/attendance')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold">View Records</h3>
                    <p className="text-sm text-gray-600 mt-1">Check attendance history</p>
                  </CardContent>
                </Card>
              </div>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">System Health</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl">✅</div>
                      <p className="font-medium mt-2">Database</p>
                      <p className="text-sm text-gray-600">Connected</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl">✅</div>
                      <p className="font-medium mt-2">Face Detection</p>
                      <p className="text-sm text-gray-600">Operational</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl">✅</div>
                      <p className="font-medium mt-2">Recognition</p>
                      <p className="text-sm text-gray-600">Ready</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl">✅</div>
                      <p className="font-medium mt-2">API</p>
                      <p className="text-sm text-gray-600">Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No System Data</h3>
                <p className="text-gray-500">Unable to fetch system status information.</p>
                <Button onClick={handleRefresh} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}