import { useState, useCallback } from 'react'

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
}

export const useApi = <T>(apiCall: (...args: any[]) => Promise<T>, options: UseApiOptions<T> = {}) => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const execute = useCallback(async (...args: any[]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await apiCall(...args)
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      setError(err)
      options.onError?.(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [apiCall, options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  }
}