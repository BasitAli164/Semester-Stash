import { apiClient } from './client';

export const recognitionApi = {
  async detectFaces(imageData: string): Promise<{ success: boolean; results: any }> {
    const response = await apiClient.post<{ success: boolean; results: any }>('/recognition/detect', {
      image: imageData,
    });
    return response.data;
  },

  async recognizeFace(embedding: number[]): Promise<{ success: boolean; recognition: any }> {
    const response = await apiClient.post<{ success: boolean; recognition: any }>('/recognition/recognize', {
      embedding,
    });
    return response.data;
  },

  async getStatus(): Promise<any> {
    const response = await apiClient.get('/recognition/status');
    return response.data;
  },
};