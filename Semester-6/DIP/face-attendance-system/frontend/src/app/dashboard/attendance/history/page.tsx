"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useAttendanceHistory,
  HistoryFilters,
} from "@/hooks/use-attendance-history";
import { AttendanceRecord } from "@/types/attendance";

export default function AttendanceHistoryPage() {
  const router = useRouter();
  const {
    attendanceHistory,
    stats,
    loading,
    error,
    fetchAttendanceHistory,
    fetchAttendanceStats,
    exportToCSV,
  } = useAttendanceHistory();

  const [filters, setFilters] = useState<HistoryFilters>({
    start_date: "",
    end_date: "",
    student_id: "",
    class: "",
    status: "",
  });

  useEffect(() => {
    // Load initial data
    fetchAttendanceHistory();
    fetchAttendanceStats();
  }, [fetchAttendanceHistory, fetchAttendanceStats]);

  useEffect(() => {
    // Debounced filter update
    const timeoutId = setTimeout(() => {
      fetchAttendanceHistory(filters);
      if (filters.start_date || filters.end_date) {
        fetchAttendanceStats({
          start_date: filters.start_date,
          end_date: filters.end_date,
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters, fetchAttendanceHistory, fetchAttendanceStats]);

  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      student_id: "",
      class: "",
      status: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats from current data
  const currentStats = {
    present: attendanceHistory.filter((r) => r.status === "Present").length,
    absent: attendanceHistory.filter((r) => r.status === "Absent").length,
    late: attendanceHistory.filter((r) => r.status === "Late").length,
    total: attendanceHistory.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Attendance History
              </h1>
              <p className="text-sm text-gray-600">
                View and analyze attendance records
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => exportToCSV()}
                disabled={attendanceHistory.length === 0}
              >
                Export CSV
              </Button>
              <Button onClick={() => router.push("/dashboard/attendance")}>
                Today's View
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Display */}
          {error && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Filters</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    handleFilterChange("start_date", e.target.value)
                  }
                />
                <Input
                  label="End Date"
                  type="date"
                  value={filters.end_date}
                  onChange={(e) =>
                    handleFilterChange("end_date", e.target.value)
                  }
                />
                <Input
                  label="Student ID"
                  placeholder="Search by ID"
                  value={filters.student_id}
                  onChange={(e) =>
                    handleFilterChange("student_id", e.target.value)
                  }
                />
                <Input
                  label="Class"
                  placeholder="Search by class"
                  value={filters.class}
                  onChange={(e) => handleFilterChange("class", e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-blue-600">
                  {currentStats.total}
                </p>
                <p className="text-sm text-gray-600">Total Records</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-green-600">
                  {currentStats.present}
                </p>
                <p className="text-sm text-gray-600">Present</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-red-600">
                  {currentStats.absent}
                </p>
                <p className="text-sm text-gray-600">Absent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-yellow-600">
                  {currentStats.late}
                </p>
                <p className="text-sm text-gray-600">Late</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Attendance Records</h2>
                <span className="text-sm text-gray-600">
                  {loading
                    ? "Loading..."
                    : `Showing ${attendanceHistory.length} records`}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {loading && attendanceHistory.length === 0 ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center space-x-4 p-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : attendanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No records found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Date & Time
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Student ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Class
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((record) => (
                        <tr
                          key={record.id} // Now we can safely use record.id since it's always included
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(record.timestamp)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(record.timestamp)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {record.student_id}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {record.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {record.class}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
