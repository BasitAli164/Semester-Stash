import { create } from 'zustand'
import { faceRecognitionService } from '@/lib/api'
import { 
  User, 
  FaceRecognitionResponse, 
  FaceVerificationResponse, 
  RegisterFacesData, 
  RecognizeFaceData, 
  VerifyFaceData,
  ApiResponse 
} from '@/lib/types'

interface FaceRecognitionState {
  // State
  recognizedUser: User | null
  verificationResult: FaceVerificationResponse | null
  recognitionResult: FaceRecognitionResponse | null
  embeddingCount: number | null
  isLoading: boolean
  error: string | null
  isCapturing: boolean

  // Actions - Fix return types
  registerFaces: (data: RegisterFacesData) => Promise<ApiResponse<{ images_processed: number; embeddings_created: number }>>
  recognizeFace: (data: RecognizeFaceData) => Promise<ApiResponse<FaceRecognitionResponse>>
  verifyFace: (data: VerifyFaceData) => Promise<ApiResponse<FaceVerificationResponse>>
  getUserEmbeddings: (userId: number) => Promise<void>
  clearResults: () => void
  clearError: () => void
  setCapturing: (capturing: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useFaceRecognitionStore = create<FaceRecognitionState>((set, get) => ({
  // Initial state
  recognizedUser: null,
  verificationResult: null,
  recognitionResult: null,
  embeddingCount: null,
  isLoading: false,
  error: null,
  isCapturing: false,

  // Actions
  registerFaces: async (data: RegisterFacesData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await faceRecognitionService.registerFaces(data)
      set({
        isLoading: false,
        error: null,
      })
      return response
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to register faces' })
      throw error
    }
  },

  recognizeFace: async (data: RecognizeFaceData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await faceRecognitionService.recognizeFace(data)
      const result = response.data
      
      set({
        recognitionResult: result || null,
        recognizedUser: result?.recognized ? result.user : null,
        isLoading: false,
        error: null,
      })

      return response
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to recognize face',
        recognitionResult: null,
        recognizedUser: null,
      })
      throw error
    }
  },

  verifyFace: async (data: VerifyFaceData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await faceRecognitionService.verifyFace(data)
      const result = response.data
      
      set({
        verificationResult: result || null,
        isLoading: false,
        error: null,
      })

      return response
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to verify face',
        verificationResult: null,
      })
      throw error
    }
  },

  getUserEmbeddings: async (userId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await faceRecognitionService.getUserEmbeddings(userId)
      set({
        embeddingCount: response.data?.embedding_count || null,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to get embedding count',
        embeddingCount: null,
      })
      throw error
    }
  },

  clearResults: () => {
    set({
      recognizedUser: null,
      verificationResult: null,
      recognitionResult: null,
      error: null,
    })
  },

  clearError: () => {
    set({ error: null })
  },

  setCapturing: (capturing: boolean) => {
    set({ isCapturing: capturing })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))