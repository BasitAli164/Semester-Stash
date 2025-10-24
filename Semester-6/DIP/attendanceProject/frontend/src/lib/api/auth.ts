import { api, handleApiResponse, handleApiError } from './axios-config'
import { AuthResponse, User, ApiResponse } from '@/lib/types'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  name: string
  username: string
  password: string
  role: 'admin' | 'student'
  email?: string
  image_dir?: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

export interface UpdateProfileData {
  name?: string
  email?: string
  image_dir?: string
}

class AuthService {
  // Login user
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', credentials)
      const data = handleApiResponse<AuthResponse>(response)
      
      // Store token and user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      
      return data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Register new user (Admin only)
  async register(userData: RegisterData): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.post('/api/auth/register', userData)
      return handleApiResponse<ApiResponse<{ user: User }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.get('/api/auth/profile')
      return handleApiResponse<ApiResponse<{ user: User }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Update current user profile
  async updateProfile(profileData: UpdateProfileData): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.put('/api/auth/profile', profileData)
      return handleApiResponse<ApiResponse<{ user: User }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Change password
  async changePassword(passwordData: ChangePasswordData): Promise<ApiResponse> {
    try {
      const response = await api.post('/api/auth/change-password', passwordData)
      return handleApiResponse<ApiResponse>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Verify JWT token
  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.get('/api/auth/verify-token')
      return handleApiResponse<ApiResponse<{ user: User }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Logout user (client-side only)
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  }

  // Get stored user from localStorage
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  // Get stored token from localStorage
  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getStoredToken()
  }

  // Check if user has admin role
  isAdmin(user?: User | null): boolean {
    const currentUser = user || this.getStoredUser()
    return currentUser?.role === 'admin'
  }

  // Check if user has student role
  isStudent(user?: User | null): boolean {
    const currentUser = user || this.getStoredUser()
    return currentUser?.role === 'student'
  }
}

export const authService = new AuthService()