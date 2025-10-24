import { api, handleApiResponse, handleApiError } from './axios-config'
import { User, ApiResponse, PaginatedResponse } from '@/lib/types'

export interface AdminStats {
  total_users: number
  total_students: number
  total_admins: number
  active_users: number
}

export interface UsersFilter {
  page?: number
  per_page?: number
  role?: 'admin' | 'student'
}

class AdminService {
  // Get all users with pagination and filtering
  async getUsers(filters: UsersFilter = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })

      const response = await api.get(`/api/admin/users?${params.toString()}`)
      return handleApiResponse<ApiResponse<PaginatedResponse<User>>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get specific user details
  async getUser(userId: number): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.get(`/api/admin/users/${userId}`)
      return handleApiResponse<ApiResponse<{ user: User }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Toggle user active status
  async toggleUserActive(userId: number): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.put(`/api/admin/users/${userId}/toggle-active`)
      return handleApiResponse<ApiResponse<{ user: User }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get admin dashboard statistics
  async getStats(): Promise<ApiResponse<{ data: AdminStats }>> {
    try {
      const response = await api.get('/api/admin/stats')
      return handleApiResponse<ApiResponse<{ data: AdminStats }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const adminService = new AdminService()