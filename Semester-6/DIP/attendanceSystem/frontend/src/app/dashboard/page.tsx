'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Camera, 
  CheckCircle, 
  BarChart3,
  TrendingUp,
  Clock,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app.store';
import { studentService, attendanceService, systemService } from '@/services/api.service';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface DashboardStats {
  totalStudents: number;
  studentsWithFaces: number;
  todayAttendance: number;
  totalAttendance: number;
  modelReady: boolean;
  systemHealth: boolean;
}

export default function Dashboard() {
  const { 
    systemStatus, 
    modelReady, 
    students, 
    attendanceRecords,
    initializeApp,
    refreshData 
  } = useAppStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    studentsWithFaces: 0,
    todayAttendance: 0,
    totalAttendance: 0,
    modelReady: false,
    systemHealth: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [systemStatus, students, attendanceRecords]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await initializeApp();
      await refreshData();

      // Calculate stats
      const studentsWithFaces = students.filter(s => s.face_images_count > 0).length;
      const todayAttendance = attendanceRecords.length;

      setStats({
        totalStudents: students.length,
        studentsWithFaces,
        todayAttendance,
        totalAttendance: todayAttendance, // Simplified for demo
        modelReady,
        systemHealth: true
      });
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Take Attendance',
      description: 'Mark attendance using facial recognition',
      icon: Camera,
      href: '/attendance/take',
      color: 'bg-green-500',
      enabled: modelReady
    },
    {
      title: 'Register Student',
      description: 'Add new student with face capture',
      icon: Users,
      href: '/students/register',
      color: 'bg-blue-500',
      enabled: true
    },
    {
      title: 'View Reports',
      description: 'Check attendance statistics and analytics',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-purple-500',
      enabled: true
    },
    {
      title: 'Train Model',
      description: 'Train face recognition model',
      icon: TrendingUp,
      href: '#',
      onClick: () => trainModel(),
      color: 'bg-orange-500',
      enabled: systemStatus?.training.can_train
    }
  ];

  const trainModel = async () => {
    try {
      const response = await systemService.trainModel();
      if (response.success) {
        useAppStore.getState().addNotification('Model training started successfully!');
        await loadDashboardData();
      } else {
        useAppStore.getState().addNotification(response.message || 'Training failed');
      }
    } catch (error) {
      useAppStore.getState().addNotification('Error training model');
      console.error('Training error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Welcome to Smart Attendance System • {formatDate(new Date())}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Students
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalStudents}</div>
              <p className="text-xs text-slate-500">
                {stats.studentsWithFaces} with face data
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Today's Attendance
              </CardTitle>
              <UserCheck className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.todayAttendance}</div>
              <p className="text-xs text-slate-500">
                Present today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Model Status
              </CardTitle>
              <CheckCircle className={`w-4 h-4 ${modelReady ? 'text-green-600' : 'text-orange-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {modelReady ? 'Ready' : 'Training Needed'}
              </div>
              <p className="text-xs text-slate-500">
                {modelReady ? 'System active' : 'Train to enable recognition'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                System Health
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">Healthy</div>
              <p className="text-xs text-slate-500">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className={`border-slate-200 hover:shadow-lg transition-all duration-200 ${
                  !action.enabled ? 'opacity-50' : 'cursor-pointer hover:border-slate-300'
                }`}
                onClick={action.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">
                        {action.description}
                      </p>
                      {action.href ? (
                        <Link href={action.href}>
                          <Button 
                            size="sm" 
                            disabled={!action.enabled}
                            className="w-full"
                          >
                            Start
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          disabled={!action.enabled}
                          className="w-full"
                        >
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length > 0 ? (
                <div className="space-y-3">
                  {attendanceRecords.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{record.name}</p>
                        <p className="text-sm text-slate-500">{record.student_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">{record.time}</p>
                        <p className="text-xs text-slate-500">Present</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No attendance records for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemStatus ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Training Data</span>
                    <span className="font-medium">
                      {systemStatus.training.ready_students}/{systemStatus.training.total_students} ready
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Face Images</span>
                    <span className="font-medium">{systemStatus.storage.total_images}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Storage Used</span>
                    <span className="font-medium">{systemStatus.storage.total_size_mb} MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Model Status</span>
                    <span className={`font-medium ${
                      systemStatus.attendance.model_ready ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {systemStatus.attendance.model_ready ? 'Trained' : 'Needs Training'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Loading system status...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}