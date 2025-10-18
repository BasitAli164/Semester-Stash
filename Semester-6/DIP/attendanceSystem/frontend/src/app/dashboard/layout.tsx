'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/use-app-store'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchStudents, fetchTodayAttendance } = useAppStore()

  useEffect(() => {
    fetchStudents()
    fetchTodayAttendance()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Smart Attendance</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link href="/dashboard/students" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                Students
              </Link>
              <Link href="/dashboard/attendance" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                Attendance
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}