'use client'

import { useRouter } from 'next/navigation'
import { Shield, Home, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          403
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Access Forbidden
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You don't have permission to access this resource. Please contact an administrator if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:border-primary-600 hover:text-primary-600 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}