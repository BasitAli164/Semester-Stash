'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle, XCircle, User } from 'lucide-react'
import { FaceRecognitionResult } from '@/types/attendance'

interface RecognitionResultsProps {
  results: FaceRecognitionResult[]
}

export function RecognitionResults({ results }: RecognitionResultsProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recognition Results</CardTitle>
          <CardDescription>
            No faces detected yet. Capture an image to see results.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const recognizedFaces = results.filter(r => r.status === 'recognized')
  const unknownFaces = results.filter(r => r.status === 'unknown')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Recognition Results</span>
          <Badge variant="secondary">
            {results.length} face{results.length !== 1 ? 's' : ''} detected
          </Badge>
        </CardTitle>
        <CardDescription>
          {recognizedFaces.length} recognized, {unknownFaces.length} unknown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recognized Faces */}
        {recognizedFaces.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Recognized Students
            </h4>
            <div className="space-y-3">
              {recognizedFaces.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-800">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{result.name}</p>
                      <p className="text-xs text-muted-foreground">{result.student_id}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {Math.round(result.confidence)}% match
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unknown Faces */}
        {unknownFaces.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-amber-600">
              <XCircle className="h-4 w-4" />
              Unknown Faces
            </h4>
            <div className="space-y-3">
              {unknownFaces.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-amber-100 text-amber-800">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">Unknown Person</p>
                      <p className="text-xs text-muted-foreground">Not registered in system</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Unrecognized
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-800">{recognizedFaces.length}</p>
              <p className="text-xs text-blue-600">Recognized</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="font-semibold text-amber-800">{unknownFaces.length}</p>
              <p className="text-xs text-amber-600">Unknown</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}