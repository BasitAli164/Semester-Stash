import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/lib/api'
import { 
  User, 
  LoginData, 
  RegisterData, 
  ChangePasswordData, 
  UpdateProfileData,
  ApiResponse 
} from '@/lib/types'

interface AuthState {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginData) => Promise<void>
  register: (userData: RegisterData) => Promise<ApiResponse<{ user: User }>>
  logout: () => void
  updateProfile: (profileData: UpdateProfileData) => Promise<void>
  changePassword: (passwordData: ChangePasswordData) => Promise<void>
  verifyToken: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void

  // Computed
  isAdmin: boolean
  isStudent: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Computed properties
      get isAdmin() {
        return get().user?.role === 'admin'
      },
      get isStudent() {
        return get().user?.role === 'student'
      },

      // Actions
      login: async (credentials: LoginData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(credentials)
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
            isAuthenticated: false,
            user: null,
            token: null,
          })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register(userData)
          // After successful registration, we don't automatically login
          set({ isLoading: false, error: null })
          return response
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Registration failed' })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      updateProfile: async (profileData: UpdateProfileData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.updateProfile(profileData)
          set({
            user: response.data?.user || get().user,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Profile update failed' })
          throw error
        }
      },

      changePassword: async (passwordData: ChangePasswordData) => {
        set({ isLoading: true, error: null })
        try {
          await authService.changePassword(passwordData)
          set({ isLoading: false, error: null })
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Password change failed' })
          throw error
        }
      },

      verifyToken: async () => {
        set({ isLoading: true })
        try {
          const response = await authService.verifyToken()
          set({
            user: response.data?.user || null,
            isAuthenticated: !!response.data?.user,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          // Token is invalid, clear auth state
          authService.logout()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Token verification failed',
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)