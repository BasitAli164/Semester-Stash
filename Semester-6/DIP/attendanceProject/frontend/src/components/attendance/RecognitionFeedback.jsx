export function RecognitionFeedback({ result }) {
  if (!result) return null

  return (
    <div className={`p-4 rounded-xl border ${
      result.recognized 
        ? 'border-green-500/30 bg-green-500/10' 
        : 'border-red-500/30 bg-red-500/10'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          result.recognized ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {result.recognized ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white">
            {result.recognized ? 'Attendance Marked Successfully!' : 'Recognition Failed'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {result.message}
          </p>
          {result.confidence && (
            <p className="text-sm text-primary-500 mt-1">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </p>
          )}
          {result.student && (
            <div className="mt-2 p-2 bg-white/5 rounded-lg">
              <p className="text-white text-sm font-medium">{result.student.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                ID: {result.student.student_id} • Username: {result.student.username}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}