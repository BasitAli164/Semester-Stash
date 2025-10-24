import { api, handleApiResponse, handleApiError } from './axios-config'
import { User, ApiResponse } from '@/lib/types'

export interface RegisterFacesData {
  user_id: number
  images: File[]
}

export interface RecognizeFaceData {
  image?: File
  image_data?: string
  threshold?: number
}

export interface VerifyFaceData {
  image?: File
  image_data?: string
  threshold?: number
}

export interface FaceRecognitionResponse {
  message: string
  recognized: boolean
  user?: User
  confidence?: number
}

export interface FaceVerificationResponse {
  message: string
  verified: boolean
  confidence: number
}

class FaceRecognitionService {
  // Register faces for a user (Admin only)
  async registerFaces(data: RegisterFacesData): Promise<ApiResponse<{ images_processed: number; embeddings_created: number }>> {
    try {
      const formData = new FormData()
      formData.append('user_id', data.user_id.toString())
      
      data.images.forEach((image) => {
        formData.append('images', image)
      })

      const response = await api.post('/api/face/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return handleApiResponse<ApiResponse<{ images_processed: number; embeddings_created: number }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Recognize a face from image
  async recognizeFace(data: RecognizeFaceData): Promise<ApiResponse<FaceRecognitionResponse>> {
    try {
      const formData = new FormData()
      
      if (data.image) {
        formData.append('image', data.image)
      } else if (data.image_data) {
        formData.append('image_data', data.image_data)
      }
      
      if (data.threshold) {
        formData.append('threshold', data.threshold.toString())
      }

      const response = await api.post('/api/face/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return handleApiResponse<ApiResponse<FaceRecognitionResponse>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Verify if face matches current user
  async verifyFace(data: VerifyFaceData): Promise<ApiResponse<FaceVerificationResponse>> {
    try {
      const formData = new FormData()
      
      if (data.image) {
        formData.append('image', data.image)
      } else if (data.image_data) {
        formData.append('image_data', data.image_data)
      }
      
      if (data.threshold) {
        formData.append('threshold', data.threshold.toString())
      }

      const response = await api.post('/api/face/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return handleApiResponse<ApiResponse<FaceVerificationResponse>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get embedding count for a user (Admin only)
  async getUserEmbeddings(userId: number): Promise<ApiResponse<{ user_id: number; embedding_count: number }>> {
    try {
      const response = await api.get(`/api/face/embeddings/${userId}`)
      return handleApiResponse<ApiResponse<{ user_id: number; embedding_count: number }>>(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const faceRecognitionService = new FaceRecognitionService()