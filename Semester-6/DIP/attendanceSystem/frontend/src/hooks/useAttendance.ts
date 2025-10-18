import { useAttendanceStore } from '@/store/attendanceStore';
import { studentsApi, attendanceApi, systemApi } from '@/lib/api';
import { useCallback } from 'react';

export const useAttendance = () => {
  const {
    setLoading,
    setError,
    setStudents,
    setAttendanceRecords,
    setAttendanceStats,
    setSystemStatus,
    setTrainingStatus,
  } = useAttendanceStore();

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentsApi.getAll();
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setStudents]);

  const loadAttendance = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      const response = await attendanceApi.getRecords(date);
      if (response.data.success) {
        setAttendanceRecords(response.data.report.attendance);
        setAttendanceStats(response.data.report.stats);
      }
    } catch (error) {
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setAttendanceRecords, setAttendanceStats]);

  const loadSystemStatus = useCallback(async () => {
    try {
      const response = await systemApi.status();
      if (response.data.success) {
        setSystemStatus(response.data.status);
      }
    } catch (error) {
      setError('Failed to load system status');
    }
  }, [setError, setSystemStatus]);

  const loadTrainingStatus = useCallback(async () => {
    try {
      const response = await systemApi.trainingStatus();
      if (response.data.success) {
        setTrainingStatus(response.data.status);
      }
    } catch (error) {
      setError('Failed to load training status');
    }
  }, [setError, setTrainingStatus]);

  const trainModel = useCallback(async () => {
    try {
      setLoading(true);
      const response = await systemApi.train();
      if (response.data.success) {
        await loadTrainingStatus();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      setError('Training failed');
      return { success: false, message: 'Training failed' };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, loadTrainingStatus]);

  const recognizeFaces = useCallback(async (imageData: string) => {
    try {
      setLoading(true);
      const response = await attendanceApi.recognizeFaces(imageData);
      if (response.data.success) {
        return { 
          success: true, 
          results: response.data.results,
          message: response.data.message 
        };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      setError('Face recognition failed');
      return { success: false, message: 'Face recognition failed' };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const markAttendance = useCallback(async (recognizedFaces: any[]) => {
    try {
      setLoading(true);
      const response = await attendanceApi.markAttendance(recognizedFaces);
      if (response.data.success) {
        await loadAttendance();
        return { 
          success: true, 
          markedCount: response.data.marked_count,
          message: response.data.message 
        };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      setError('Failed to mark attendance');
      return { success: false, message: 'Failed to mark attendance' };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, loadAttendance]);

  return {
    loadStudents,
    loadAttendance,
    loadSystemStatus,
    loadTrainingStatus,
    trainModel,
    recognizeFaces,
    markAttendance,
  };
};