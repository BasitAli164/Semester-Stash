import { useUIStore } from '@/lib/store'

export const useToast = () => {
  const { addToast, removeToast, clearToasts } = useUIStore()

  const toast = {
    success: (message: string, duration?: number) => {
      addToast({ type: 'success', message, duration })
    },
    error: (message: string, duration?: number) => {
      addToast({ type: 'error', message, duration })
    },
    warning: (message: string, duration?: number) => {
      addToast({ type: 'warning', message, duration })
    },
    info: (message: string, duration?: number) => {
      addToast({ type: 'info', message, duration })
    },
    remove: removeToast,
    clear: clearToasts,
  }

  return toast
}