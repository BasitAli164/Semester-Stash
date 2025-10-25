import { authAPI } from '../lib/api'

export const authStore = (set, get) => ({
  user: null,
  isAuthenticated: false,
  authLoading: false,
  
  login: async (credentials) => {
    set({ authLoading: true, error: null })
    try {
      const response = await authAPI.login(credentials)
      const { access_token, user } = response.data
      
      localStorage.setItem('auth_token', access_token)
      set({ 
        user, 
        isAuthenticated: true, 
        authLoading: false 
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      set({ 
        authLoading: false, 
        error: errorMessage 
      })
      return { success: false, error: errorMessage }
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ 
      user: null, 
      isAuthenticated: false 
    })
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      set({ isAuthenticated: false })
      return
    }
    
    set({ authLoading: true })
    try {
      const response = await authAPI.verifyToken()
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        authLoading: false 
      })
    } catch (error) {
      localStorage.removeItem('auth_token')
      set({ 
        user: null, 
        isAuthenticated: false, 
        authLoading: false 
      })
    }
  },
})