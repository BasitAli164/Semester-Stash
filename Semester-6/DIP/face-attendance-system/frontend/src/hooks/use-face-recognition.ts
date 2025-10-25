'use client';

import { useState, useCallback } from 'react';
import { recognitionApi } from '@/lib/api/recognition';

export interface FaceDetectionResult {
  faces_detected: number;
  recognitions: Array<{
    face_index: number;
    confidence: number;
    student_id?: string;
    name?: string;
    class?: string;
    distance?: number;
    recognized: boolean;
  }>;
}

export interface SystemStatus {
  status: string;
  face_detection_threshold: number;
  face_recognition_threshold: number;
  students: {
    total: number;
    with_embeddings: number;
    without_embeddings: number;
  };
  device: string;
}

export function useFaceRecognition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const detectFaces = useCallback(async (imageData: string): Promise<FaceDetectionResult> => {
    try {
      setLoading(true);
      setError(null);
      const response = await recognitionApi.detectFaces(imageData);
      return response.results;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Face detection failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    try {
      setLoading(true);
      setError(null);
      const response = await recognitionApi.getStatus();
      setSystemStatus(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to get system status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    systemStatus,
    detectFaces,
    getSystemStatus,
  };
}