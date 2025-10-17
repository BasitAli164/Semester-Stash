'use client';

import { useEffect, useState } from 'react';
import { Camera, Users, Download, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app.store';
import { attendanceService } from '@/services/api.service';
import { formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  attendance_rate: number;
  total_students: number;
}

export default function AttendancePage() {
  const { attendanceRecords, refreshData, modelReady } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      await refreshData();
      
      // Get stats for selected date
      const statsResponse = await attendanceService.getAttendanceStats(selectedDate);
      if (statsResponse.success && statsResponse.stats) {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Attendance data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await attendanceService.exportAttendance(selectedDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `attendance_${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      useAppStore.getState().addNotification('Attendance exported successfully!');
    } catch (error) {
      useAppStore.getState().addNotification('Error exporting attendance');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Attendance</h1>
          <p className="text-slate-600">
            View and manage attendance records
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button 
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Link href="/attendance/take">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              disabled={!modelReady}
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {attendanceRecords.length}
              </div>
              <div className="text-sm text-slate-600">Present Today</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.present}
              </div>
              <div className="text-sm text-slate-600">Present</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {stats.absent}
              </div>
              <div className="text-sm text-slate-600">Absent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {stats.late}
              </div>
              <div className="text-sm text-slate-600">Late</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.attendance_rate}%
              </div>
              <div className="text-sm text-slate-600">Attendance Rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Attendance Records - {formatDate(selectedDate)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading attendance records...</p>
            </div>
          ) : attendanceRecords.length > 0 ? (
            <div className="space-y-4">
              {attendanceRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{record.name}</p>
                      <p className="text-sm text-slate-500">{record.student_id}</p>
                      {record.department && (
                        <p className="text-xs text-slate-400">{record.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{formatTime(record.time)}</p>
                      <p className="text-xs text-slate-500">Marked at</p>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No attendance records
              </h3>
              <p className="text-slate-600 mb-6">
                {selectedDate === new Date().toISOString().split('T')[0]
                  ? 'Take attendance using facial recognition to get started'
                  : 'No records found for the selected date'
                }
              </p>
              {selectedDate === new Date().toISOString().split('T')[0] && (
                <Link href="/attendance/take">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Attendance
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}