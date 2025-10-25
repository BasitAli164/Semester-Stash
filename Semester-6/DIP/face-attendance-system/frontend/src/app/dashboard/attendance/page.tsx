"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAttendance } from "@/hooks/use-attendance";
import { useFaceRecognition } from "@/hooks/use-face-recognition";
import { Button } from "@/components/ui/button";
import { AttendanceTable } from "@/components/features/attendance/attendance-table";
import { StatsCards } from "@/components/features/attendance/stats-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AttendancePage() {
  const router = useRouter();
  const {
    todayAttendance,
    loading,
    error,
    fetchTodayAttendance,
    getAttendanceStats,
  } = useAttendance();
  const { systemStatus, getSystemStatus } = useFaceRecognition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchTodayAttendance();
    getSystemStatus();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTodayAttendance();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTodayAttendance, getSystemStatus]);

  const stats = getAttendanceStats();

  const handleRefresh = () => {
    fetchTodayAttendance();
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Attendance Management
              </h1>
              <p className="text-sm text-gray-600">
                Today's attendance -{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/attendance/history")}
              >
                View History
              </Button>
              <Button onClick={() => router.push("/dashboard/attendance/mark")}>
                Mark Attendance
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* System Status */}
          {systemStatus && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        systemStatus.status === "operational"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="font-medium">Face Recognition System</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {systemStatus.students.with_embeddings} /{" "}
                    {systemStatus.students.total} students with face data
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="mb-8">
            <StatsCards stats={stats} />
          </div>

          {/* Last Updated */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Today's Attendance Records
            </h2>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Attendance</h3>
                <span className="text-sm text-gray-600">
                  {todayAttendance.length} records
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                  {error}
                </div>
              )}

              <AttendanceTable records={todayAttendance} loading={loading} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
