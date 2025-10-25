'use client'
import { useEffect } from 'react'
import { useStore } from '../../store'
import { PageLoader } from './LoadingSpinner'
import { useRouter } from 'next/navigation'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading, checkAuth } = useStore()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}