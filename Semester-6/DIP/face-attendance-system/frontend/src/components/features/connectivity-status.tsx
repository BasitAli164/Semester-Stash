'use client';

import { useState, useEffect } from 'react';
import { healthApi } from '@/lib/api/health';
import { Card, CardContent } from '@/components/ui/card';

export function ConnectivityStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsChecking(true);
        await healthApi.checkBackendHealth();
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
    
    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700">Checking backend connection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isOnline) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-red-700">Backend Connection Failed</span>
              <p className="text-xs text-red-600">
                Make sure your Flask backend is running on http://localhost:5000
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700">Backend connected successfully</span>
        </div>
      </CardContent>
    </Card>
  );
}