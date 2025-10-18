'use client';

import { Student } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StudentDetailsProps {
  student: Student;
}

export function StudentDetails({ student }: StudentDetailsProps) {
  const getTrainingStatus = () => {
    if (student.face_images_captured >= 5) {
      return {
        status: 'Ready',
        color: 'green',
        description: 'Student has enough face images for training'
      };
    } else {
      return {
        status: 'Not Ready',
        color: 'yellow',
        description: `Need ${5 - student.face_images_captured} more face images`
      };
    }
  };

  const trainingStatus = getTrainingStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Basic Information */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {student.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                <p className="text-gray-600">{student.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Student ID</label>
                <p className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded mt-1">
                  {student.student_id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-sm text-gray-900 mt-1">{student.department}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900 mt-1">
                  {student.phone || 'Not provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-sm mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Registration Date</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(student.registration_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(student.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Status */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Training Status</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              trainingStatus.color === 'green' 
                ? 'border-green-200 bg-green-50' 
                : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${
                  trainingStatus.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                } mr-2`}></div>
                <span className={`font-medium ${
                  trainingStatus.color === 'green' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {trainingStatus.status}
                </span>
              </div>
              <p className={`text-sm mt-2 ${
                trainingStatus.color === 'green' ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {trainingStatus.description}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Face Images Captured</span>
                <span className="font-medium text-gray-900">
                  {student.face_images_captured} / 5
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    student.face_images_captured >= 5 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${(student.face_images_captured / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Minimum 5 face images required</li>
                <li>• Different angles and lighting</li>
                <li>• Clear face visibility</li>
                <li>• No glasses/hats that obstruct face</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}