import { apiClient } from './client';

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
}

export const authService = {
  async login(credentials: LoginData) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async changePassword(data: { current_password: string; new_password: string }) {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },
};