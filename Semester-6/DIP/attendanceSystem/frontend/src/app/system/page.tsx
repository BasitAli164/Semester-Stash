'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrainingStatus } from '@/components/system/TrainingStatus';
import { StorageInfo } from '@/components/system/StorageInfo';
import { SystemHealth } from '@/components/system/SystemHealth';
import { TrainingModal } from '@/components/system/TrainingModal';

export default function SystemPage() {
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  
  const {
    systemStatus,
    trainingStatus,
    storageStats,
    systemLoading,
    fetchSystemStatus,
    fetchTrainingStatus,
    fetchStorageStats,
    trainModel
  } = useAppStore();

  useEffect(() => {
    fetchSystemStatus();
    fetchTrainingStatus();
    fetchStorageStats();
  }, [fetchSystemStatus, fetchTrainingStatus, fetchStorageStats]);

  const handleTrainModel = async () => {
    console.log('🔄 Starting model training...');
    const success = await trainModel();
    console.log('✅ Training result:', success);
    if (success) {
      setShowTrainingModal(false);
      // Refresh all statuses after training
      fetchSystemStatus();
      fetchTrainingStatus();
      fetchStorageStats();
    }
  };

  const handleOpenTrainingModal = () => {
    console.log('🎯 Opening training modal');
    console.log('📊 Current training status:', trainingStatus);
    setShowTrainingModal(true);
  };

  const canTrain = trainingStatus?.can_train || false;
  const readyStudents = trainingStatus?.ready_students || 0;
  const totalStudents = trainingStatus?.total_students || 0;

  console.log('📊 System page render - showTrainingModal:', showTrainingModal);
  console.log('📊 Training status:', trainingStatus);
  console.log('📊 Can train:', canTrain);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor system health and manage face recognition model
          </p>
        </div>
        {/* REMOVE the disabled prop to allow clicking even when can_train is false */}
        <Button 
          onClick={handleOpenTrainingModal}
          // Remove disabled prop to allow clicking
        >
          Train Model
        </Button>
      </div>

      {/* Training Status */}
      <TrainingStatus 
        trainingStatus={trainingStatus}
        systemLoading={systemLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Information */}
        <StorageInfo 
          storageStats={storageStats}
          systemLoading={systemLoading}
        />

        {/* System Health */}
        <SystemHealth 
          systemStatus={systemStatus}
          systemLoading={systemLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* REMOVE disabled prop here too */}
            <Button
              onClick={handleOpenTrainingModal}
              variant="outline"
            >
              Train Model
            </Button>
            <Button
              onClick={() => {
                fetchSystemStatus();
                fetchTrainingStatus();
                fetchStorageStats();
              }}
              variant="outline"
            >
              Refresh Status
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Restart Application
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Modal */}
      {showTrainingModal && (
        <TrainingModal
          trainingStatus={trainingStatus}
          onClose={() => {
            console.log('🔒 Closing training modal');
            setShowTrainingModal(false);
          }}
          onTrain={handleTrainModel}
        />
      )}
    </div>
  );
}