import api from './client'
import { ApiResponse } from '@/types/api'

export interface SystemStatus {
  model_trained: boolean
  total_students: number
  total_faces: number
  last_training: string
  system_health: 'healthy' | 'degraded' | 'down'
}

export const systemService = {
  // Train face recognition model
  trainModel: (): Promise<ApiResponse<{ training_time: number; faces_processed: number }>> =>
    api.post('/system/train').then(res => res.data),

  // Get system status
  getStatus: (): Promise<ApiResponse<SystemStatus>> =>
    api.get('/system/status').then(res => res.data),

  // Health check
  healthCheck: (): Promise<ApiResponse<{ status: string; timestamp: string }>> =>
    api.get('/system/health').then(res => res.data),
}