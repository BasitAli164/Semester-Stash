import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  // State
  theme: Theme
  sidebarOpen: boolean
  modals: {
    [key: string]: boolean
  }
  toastQueue: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>

  // Actions
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  closeAllModals: () => void
  addToast: (toast: Omit<UIState['toastQueue'][0], 'id'>) => void
  removeToast: (toastId: string) => void
  clearToasts: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: false,
      modals: {},
      toastQueue: [],

      // Actions
      setTheme: (theme) => {
        set({ theme })
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      openModal: (modalId: string) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: true,
          },
        }))
      },

      closeModal: (modalId: string) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: false,
          },
        }))
      },

      closeAllModals: () => {
        set({ modals: {} })
      },

      addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9)
        set((state) => ({
          toastQueue: [...state.toastQueue, { ...toast, id }],
        }))

        // Auto-remove toast after duration
        setTimeout(() => {
          get().removeToast(id)
        }, toast.duration || 5000)
      },

      removeToast: (toastId: string) => {
        set((state) => ({
          toastQueue: state.toastQueue.filter((toast) => toast.id !== toastId),
        }))
      },

      clearToasts: () => {
        set({ toastQueue: [] })
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)