'use client';

import { useEffect, useState } from 'react';
import { useAttendanceStore } from '@/store/attendanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaceRecognition } from '@/components/face-recognition';
import { StudentsManagement } from '@/components/students-management';
import { AttendanceView } from '@/components/attendance-view';
import { SystemMonitor } from '@/components/system-monitor';
import { 
  Users, 
  Calendar, 
  Camera, 
  Brain, 
  Activity,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const { 
    students, 
    attendanceStats, 
    systemStatus, 
    trainingStatus,
    loading,
    error,
    success,
    fetchStudents, 
    fetchAttendance, 
    fetchSystemStatus, 
    fetchTrainingStatus,
    clearError,
    clearSuccess
  } = useAttendanceStore();
  
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Load initial data
    fetchStudents();
    fetchAttendance();
    fetchSystemStatus();
    fetchTrainingStatus();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') {
        fetchAttendance();
        fetchTrainingStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => clearSuccess(), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: Users,
      description: 'Registered students',
      color: 'text-blue-600'
    },
    {
      title: 'Present Today',
      value: attendanceStats?.present_today || 0,
      icon: UserCheck,
      description: 'Students present',
      color: 'text-green-600'
    },
    {
      title: 'Absent Today',
      value: attendanceStats?.absent_today || 0,
      icon: UserX,
      description: 'Students absent',
      color: 'text-red-600'
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceStats?.attendance_rate || 0}%`,
      icon: TrendingUp,
      description: 'Today\'s rate',
      color: 'text-purple-600'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentsManagement />;
      case 'attendance':
        return <AttendanceView />;
      case 'recognition':
        return <FaceRecognition />;
      case 'system':
        return <SystemMonitor />;
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-gray-400">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Training Status */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>AI Model Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Model Trained</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        trainingStatus?.model_trained 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trainingStatus?.model_trained ? 'Ready' : 'Not Trained'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ready Students</span>
                      <span className="text-sm">
                        {trainingStatus?.ready_students || 0} / {trainingStatus?.total_students || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Images</span>
                      <span className="text-sm">{trainingStatus?.total_images || 0}</span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      disabled={!trainingStatus?.can_train || loading}
                      onClick={() => useAttendanceStore.getState().trainModel()}
                    >
                      {loading ? 'Training...' : 'Train Model'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className="h-20 flex-col bg-white/5 hover:bg-white/10 border border-white/10"
                      onClick={() => setActiveTab('recognition')}
                    >
                      <Camera className="h-6 w-6 mb-2" />
                      <span className="text-sm">Face Recognition</span>
                    </Button>
                    <Button 
                      className="h-20 flex-col bg-white/5 hover:bg-white/10 border border-white/10"
                      onClick={() => setActiveTab('students')}
                    >
                      <Users className="h-6 w-6 mb-2" />
                      <span className="text-sm">Manage Students</span>
                    </Button>
                    <Button 
                      className="h-20 flex-col bg-white/5 hover:bg-white/10 border border-white/10"
                      onClick={() => setActiveTab('attendance')}
                    >
                      <Calendar className="h-6 w-6 mb-2" />
                      <span className="text-sm">View Attendance</span>
                    </Button>
                    <Button 
                      className="h-20 flex-col bg-white/5 hover:bg-white/10 border border-white/10"
                      onClick={() => setActiveTab('system')}
                    >
                      <Brain className="h-6 w-6 mb-2" />
                      <span className="text-sm">System Status</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Smart Attendance</h1>
                <p className="text-sm text-gray-300">AI-Powered Face Recognition System</p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              {['dashboard', 'students', 'attendance', 'recognition', 'system'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "ghost"}
                  className={`capitalize ${
                    activeTab === tab 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Messages */}
      {(error || success) && (
        <div className="container mx-auto px-6 pt-4">
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto text-red-400 hover:text-red-300">
                ×
              </Button>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-2 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span>{success}</span>
              <Button variant="ghost" size="sm" onClick={clearSuccess} className="ml-auto text-green-400 hover:text-green-300">
                ×
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 rounded-lg p-6 text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}