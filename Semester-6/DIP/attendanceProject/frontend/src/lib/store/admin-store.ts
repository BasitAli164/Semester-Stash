import { create } from 'zustand'
import { adminService } from '@/lib/api'
import { User, AdminStats, UsersFilter, PaginatedResponse } from '@/lib/types'

interface AdminState {
  // State
  users: User[]
  selectedUser: User | null
  stats: AdminStats | null
  usersPagination: PaginatedResponse<User> | null
  isLoading: boolean
  error: string | null

  // Actions
  getUsers: (filters?: UsersFilter) => Promise<void>
  getUser: (userId: number) => Promise<void>
  toggleUserActive: (userId: number) => Promise<void>
  getStats: () => Promise<void>
  clearSelectedUser: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  users: [],
  selectedUser: null,
  stats: null,
  usersPagination: null,
  isLoading: false,
  error: null,

  // Actions
  getUsers: async (filters: UsersFilter = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await adminService.getUsers(filters)
      set({
        users: response.data?.data || [],
        usersPagination: response.data || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch users',
        users: [],
        usersPagination: null,
      })
      throw error
    }
  },

  getUser: async (userId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await adminService.getUser(userId)
      set({
        selectedUser: response.data?.user || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch user',
        selectedUser: null,
      })
      throw error
    }
  },

  toggleUserActive: async (userId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await adminService.toggleUserActive(userId)
      const updatedUser = response.data?.user
      
      // Update users list if user exists in it
      if (updatedUser) {
        const { users } = get()
        const updatedUsers = users.map(user => 
          user.id === userId ? updatedUser : user
        )
        set({ users: updatedUsers })
      }

      // Update selected user if it's the same user
      const { selectedUser } = get()
      if (selectedUser && selectedUser.id === userId) {
        set({ selectedUser: updatedUser || null })
      }

      set({ isLoading: false, error: null })
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to update user status' })
      throw error
    }
  },

  getStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await adminService.getStats()
      set({
        stats: response.data?.data || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch stats',
        stats: null,
      })
      throw error
    }
  },

  clearSelectedUser: () => {
    set({ selectedUser: null })
  },

  clearError: () => {
    set({ error: null })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))