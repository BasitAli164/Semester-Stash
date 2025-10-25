import { apiClient } from './client';

export const healthApi = {
  async checkBackendHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend is not reachable');
    }
  },

  async testConnection(): Promise<{ status: string; timestamp: string; cors: string }> {
    try {
      const response = await apiClient.get('/test');
      return response.data;
    } catch (error) {
      throw new Error('Test endpoint failed');
    }
  },
};