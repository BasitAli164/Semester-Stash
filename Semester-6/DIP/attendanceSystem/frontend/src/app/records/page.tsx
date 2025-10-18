'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AttendanceTable } from '@/components/records/AttendanceTable';
import { AttendanceStats } from '@/components/records/AttendanceStats';
import { DateRangePicker } from '@/components/records/DateRangePicker';

export default function RecordsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'daily' | 'range'>('daily');
  
  const { 
    attendanceRecords, 
    attendanceStats,
    attendanceLoading,
    fetchAttendance,
    fetchAttendanceStats,
    exportAttendance
  } = useAppStore();

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchAttendance(selectedDate);
      fetchAttendanceStats(selectedDate);
    } else {
      // For range view, we'll fetch the first day to show some data
      // In a real app, you'd have a separate API for range data
      fetchAttendance(dateRange.start);
    }
  }, [selectedDate, dateRange, viewMode, fetchAttendance, fetchAttendanceStats]);

  const handleExport = async () => {
    const dateToExport = viewMode === 'daily' ? selectedDate : undefined;
    await exportAttendance(dateToExport);
  };

  const filteredRecords = attendanceRecords.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getViewTitle = () => {
    if (viewMode === 'daily') {
      return new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      return `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-600 mt-1">
            View and manage attendance history
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          Export CSV
        </Button>
      </div>

      {/* View Mode Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'daily' ? 'default' : 'outline'}
                onClick={() => setViewMode('daily')}
                size="sm"
              >
                Daily View
              </Button>
              <Button
                variant={viewMode === 'range' ? 'default' : 'outline'}
                onClick={() => setViewMode('range')}
                size="sm"
              >
                Date Range
              </Button>
            </div>
            
            {viewMode === 'daily' ? (
              <div className="flex-1 max-w-xs">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
            ) : (
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <AttendanceStats 
        stats={attendanceStats}
        viewMode={viewMode}
        dateRange={dateRange}
      />

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {getViewTitle()}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredRecords.length} records found
              </p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search by name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 sm:min-w-64"
              />
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="whitespace-nowrap"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceTable
            records={filteredRecords}
            loading={attendanceLoading}
            viewMode={viewMode}
          />
        </CardContent>
      </Card>
    </div>
  );
}