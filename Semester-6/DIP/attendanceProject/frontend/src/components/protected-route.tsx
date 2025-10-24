'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield, UserX } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/lib/api'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'student'
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, verifyToken } = useAuth()
  const [isVerifying, setIsVerifying] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we have a stored token but no user in state, verify it
        if (authService.isAuthenticated() && !user) {
          await verifyToken()
        }
        
        setIsVerifying(false)
        
        // Redirect if not authenticated
        if (!isAuthenticated && !authService.isAuthenticated()) {
          router.push(fallbackPath)
          return
        }

        // Check role if required
        if (requiredRole && user && user.role !== requiredRole) {
          router.push('/unauthorized')
          return
        }
      } catch (error) {
        setIsVerifying(false)
        router.push(fallbackPath)
      }
    }

    checkAuth()
  }, [isAuthenticated, user, requiredRole, router, fallbackPath, verifyToken])

  // Show loading while verifying authentication
  if (isVerifying || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Verifying authentication...
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Please wait while we check your credentials
          </p>
        </div>
      </div>
    )
  }

  // Show unauthorized if role doesn't match
  if (requiredRole && user && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserX className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. This area requires{' '}
            <strong>{requiredRole}</strong> privileges.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors duration-200 font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Render children if authenticated and authorized
  return <>{children}</>
}