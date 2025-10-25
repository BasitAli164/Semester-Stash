export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}></div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="text-center">
        <div className="futuristic-card p-8">
          <LoadingSpinner size="xl" className="mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Facial Attendance System</h2>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    </div>
  )
}