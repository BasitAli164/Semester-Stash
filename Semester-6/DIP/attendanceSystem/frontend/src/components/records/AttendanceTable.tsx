import { AttendanceRecord } from '@/types';
import { Button } from '@/components/ui/button';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  loading: boolean;
  viewMode: 'daily' | 'range';
}

export function AttendanceTable({ records, loading, viewMode }: AttendanceTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
        <p className="text-gray-500">
          {viewMode === 'daily' 
            ? 'No attendance records for the selected date.' 
            : 'No attendance records for the selected date range.'
          }
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return '✅';
      case 'absent':
        return '❌';
      case 'late':
        return '⏰';
      default:
        return '❓';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Student</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Department</th>
            {viewMode === 'range' && (
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
            )}
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {record.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{record.name}</p>
                    <p className="text-sm text-gray-500">{record.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <code className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {record.student_id}
                </code>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-gray-700">{record.department}</span>
              </td>
              {viewMode === 'range' && (
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-700">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </td>
              )}
              <td className="py-4 px-4">
                <span className="text-sm text-gray-700">{record.time}</span>
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                  <span className="mr-1">{getStatusIcon(record.status)}</span>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-gray-500 max-w-xs truncate">
                  {record.notes || '-'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination would go here in a real app */}
      <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {records.length} records
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}