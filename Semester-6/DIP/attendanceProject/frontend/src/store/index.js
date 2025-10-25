import { create } from 'zustand'
import { authStore } from './authStore'
import { studentStore } from './studentStore'
import { attendanceStore } from './attendanceStore'

export const useStore = create((set, get) => ({
  ...authStore(set, get),
  ...studentStore(set, get),
  ...attendanceStore(set, get),
  
  // Global loading state
  loading: false,
  setLoading: (loading) => set({ loading }),
  
  // Global error state
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))