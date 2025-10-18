'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, User, Camera } from 'lucide-react'
import { Student } from '@/types/student'
import { useAppStore } from '@/store/use-app-store'

interface StudentTableProps {
  students: Student[]
}

export function StudentTable({ students }: StudentTableProps) {
  const { deleteStudent } = useAppStore()

  // ✅ ADD DEBUG LOG
  console.log('🎯 StudentTable received students:', students.length)
  console.log('📊 StudentTable data:', students)

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No students found</h3>
        <p className="text-muted-foreground">Get started by registering your first student</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Face Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.student_id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {student.name}
                </div>
              </TableCell>
              <TableCell>{student.department || '-'}</TableCell>
              <TableCell>
                {new Date(student.registration_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge variant={student.face_images_captured ? "default" : "secondary"}>
                  <Camera className="h-3 w-3 mr-1" />
                  {student.face_images_captured ? 'Registered' : 'Pending'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={student.is_active ? "default" : "secondary"}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}