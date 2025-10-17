'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download, Filter, BarChart3 } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { format, subDays } from 'date-fns'

export default function ReportsPage() {
  const { attendanceRecords, fetchTodayAttendance, attendanceStats } = useAppStore()
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])

  useEffect(() => {
    fetchTodayAttendance()
    // In real app, you'd fetch records for date range
    setFilteredRecords(attendanceRecords)
  }, [fetchTodayAttendance, attendanceRecords])

  const handleExport = () => {
    // In real app, this would call the export API
    const csvContent = "data:text/csv;charset=utf-8," +
      "Student ID,Name,Date,Time,Status\n" +
      filteredRecords.map(record => 
        `${record.student_id},${record.name},${record.date},${record.time},${record.status}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `attendance_${startDate}_to_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      present: { class: 'bg-green-100 text-green-800', label: 'Present' },
      absent: { class: 'bg-red-100 text-red-800', label: 'Absent' },
      late: { class: 'bg-yellow-100 text-yellow-800', label: 'Late' }
    }
    
    const variant = variants[status as keyof typeof variants] || variants.present
    return <Badge className={variant.class}>{variant.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
          <p className="text-muted-foreground">View and export attendance analytics</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceStats?.attendance_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Attendance percentage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats?.present_today || 0}</div>
            <p className="text-xs text-muted-foreground">Marked present</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attendanceStats?.absent_today || 0}</div>
            <p className="text-xs text-muted-foreground">Not present</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} records from {startDate} to {endDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.student_id}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.time}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No records found</h3>
              <p className="text-muted-foreground">
                No attendance records for the selected period
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}