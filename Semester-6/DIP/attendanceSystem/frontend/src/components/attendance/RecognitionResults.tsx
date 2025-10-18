import { FaceRecognitionResult } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RecognitionResultsProps {
  results: FaceRecognitionResult[];
}

export function RecognitionResults({ results }: RecognitionResultsProps) {
  if (results.length === 0) {
    return null;
  }

  const recognizedResults = results.filter(r => r.status === 'recognized');
  const unknownResults = results.filter(r => r.status === 'unknown');

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          Recognition Results ({results.length} faces detected)
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recognized Faces */}
          {recognizedResults.length > 0 && (
            <div>
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Recognized Students ({recognizedResults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recognizedResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-green-200 bg-green-50 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{result.name}</h4>
                        <p className="text-sm text-gray-600">ID: {result.student_id}</p>
                        <p className="text-sm text-gray-600">
                          Confidence: {result.confidence}%
                        </p>
                      </div>
                      <div className="text-right">
                        {result.attendance_marked ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Marked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Processing
                          </span>
                        )}
                      </div>
                    </div>
                    {result.attendance_time && (
                      <p className="text-xs text-gray-500 mt-2">
                        Time: {result.attendance_time}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unknown Faces */}
          {unknownResults.length > 0 && (
            <div>
              <h3 className="font-medium text-yellow-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Unknown Faces ({unknownResults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unknownResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-yellow-200 bg-yellow-50 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">Unknown Person</h4>
                        <p className="text-sm text-gray-600">
                          Confidence: {result.confidence}%
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          This person is not registered in the system
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ❓ Unknown
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}