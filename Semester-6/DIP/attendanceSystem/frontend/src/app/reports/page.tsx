'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Download, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app.store';
import { attendanceService } from '@/services/api.service';
import { formatDate } from '@/lib/utils';

interface ReportData {
  date: string;
  present: number;
  absent: number;
  late: number;
  attendance_rate: number;
}

export default function ReportsPage() {
  const { students, attendanceRecords } = useAppStore();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [startDate, endDate]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getAttendanceRange(startDate, endDate);
      if (response.success && response.report) {
        // Transform data for chart display
        const dailyData: ReportData[] = [];
        
        // For demo purposes, create sample data
        const currentDate = new Date(startDate);
        const end = new Date(endDate);
        
        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const dayAttendance = attendanceRecords.filter(record => 
            record.date === dateStr
          );
          
          dailyData.push({
            date: dateStr,
            present: dayAttendance.length,
            absent: students.length - dayAttendance.length,
            late: dayAttendance.filter(a => a.time > '09:30:00').length,
            attendance_rate: students.length > 0 ? 
              Math.round((dayAttendance.length / students.length) * 100) : 0
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setReportData(dailyData);
      }
    } catch (error) {
      console.error('Report data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await attendanceService.exportAttendance();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      useAppStore.getState().addNotification('Report exported successfully!');
    } catch (error) {
      useAppStore.getState().addNotification('Error exporting report');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const overallStats = reportData.reduce(
    (acc, day) => ({
      totalPresent: acc.totalPresent + day.present,
      totalAbsent: acc.totalAbsent + day.absent,
      totalLate: acc.totalLate + day.late,
      days: acc.days + 1
    }),
    { totalPresent: 0, totalAbsent: 0, totalLate: 0, days: 0 }
  );

  const averageAttendance = overallStats.days > 0 
    ? Math.round((overallStats.totalPresent / (overallStats.days * students.length)) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports & Analytics</h1>
          <p className="text-slate-600">
            View attendance statistics and generate reports
          </p>
        </div>
        <Button 
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 sm:mt-0"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <span className="text-slate-500">to</span>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={loadReportData} disabled={loading}>
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Generating report...</p>
        </div>
      ) : (
        <>
          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Average Attendance
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {averageAttendance}%
                </div>
                <p className="text-xs text-slate-500">
                  {overallStats.days} day period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Present
                </CardTitle>
                <Users className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {overallStats.totalPresent}
                </div>
                <p className="text-xs text-slate-500">
                  Across all days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Absent
                </CardTitle>
                <Users className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {overallStats.totalAbsent}
                </div>
                <p className="text-xs text-slate-500">
                  Across all days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Late Arrivals
                </CardTitle>
                <Users className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {overallStats.totalLate}
                </div>
                <p className="text-xs text-slate-500">
                  After 9:30 AM
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Daily Attendance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.length > 0 ? (
                <div className="space-y-4">
                  {reportData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {formatDate(day.date)}
                        </p>
                        <div className="flex space-x-4 mt-2 text-sm text-slate-600">
                          <span>Present: {day.present}</span>
                          <span>Absent: {day.absent}</span>
                          <span>Late: {day.late}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">
                          {day.attendance_rate}%
                        </div>
                        <div className="text-xs text-slate-500">Rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No report data
                  </h3>
                  <p className="text-slate-600">
                    Select a date range and generate a report to view analytics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Performance */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Student Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.slice(0, 10).map((student) => (
                  <div key={student.student_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{student.name}</p>
                      <p className="text-sm text-slate-500">{student.student_id}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">
                        {student.attendance_stats?.attendance_rate || 0}%
                      </div>
                      <div className="text-xs text-slate-500">
                        {student.attendance_stats?.present_days || 0}/{student.attendance_stats?.total_days || 0} days
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}