import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { authService } from '@/lib/api'

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    verifyToken,
    clearError,
    setLoading,
    isAdmin,
    isStudent,
  } = useAuthStore()

  // Auto-login from stored token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getStoredToken()
      const storedUser = authService.getStoredUser()
      
      if (storedToken && storedUser && !isAuthenticated) {
        setLoading(true)
        try {
          await verifyToken()
        } catch (error) {
          // Token is invalid, clear storage
          authService.logout()
        } finally {
          setLoading(false)
        }
      }
    }

    initializeAuth()
  }, [isAuthenticated, verifyToken, setLoading])

  // Enhanced logout with redirect
  const enhancedLogout = () => {
    logout()
    // Redirect to login page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // Check if user can access a specific route
  const canAccess = (requiredRole?: 'admin' | 'student') => {
    if (!isAuthenticated) return false
    if (!requiredRole) return true
    return user?.role === requiredRole
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isStudent,

    // Actions
    login,
    register,
    logout: enhancedLogout,
    updateProfile,
    changePassword,
    verifyToken,
    clearError,
    setLoading,

    // Utilities
    canAccess,
  }
}