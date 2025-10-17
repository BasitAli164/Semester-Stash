'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Camera, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app.store';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function StudentsPage() {
  const { students, studentsLoading, refreshData } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (studentsLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Students</h1>
          <p className="text-slate-600">
            Manage student profiles and face data
          </p>
        </div>
        <Link href="/students/register">
          <Button className="bg-blue-600 hover:bg-blue-700 mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search students by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {students.length}
              </div>
              <div className="text-sm text-slate-600">Total Students</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.student_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{student.name}</CardTitle>
                    <p className="text-sm text-slate-600">{student.student_id}</p>
                  </div>
                  <Badge variant={student.face_images_count > 0 ? 'success' : 'secondary'}>
                    {student.face_images_count > 0 ? 'Face Data' : 'No Faces'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-slate-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{student.department || 'No department'}</span>
                </div>
                
                {student.email && (
                  <div className="text-sm text-slate-600 truncate">
                    📧 {student.email}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Registered: {formatDate(student.registration_date)}
                  </span>
                  <span className="text-slate-500">
                    {student.face_images_count} images
                  </span>
                </div>

                {student.attendance_stats && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Attendance Rate</span>
                      <span className={`font-medium ${getAttendanceColor(student.attendance_stats.attendance_rate)}`}>
                        {student.attendance_stats.attendance_rate}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Link href={`/students/register?studentId=${student.student_id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Camera className="w-4 h-4 mr-1" />
                      Add Faces
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No students found' : 'No students registered'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by registering your first student'
              }
            </p>
            <Link href="/students/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add First Student
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}