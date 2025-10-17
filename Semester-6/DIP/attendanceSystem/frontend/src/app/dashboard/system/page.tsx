'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Cpu, Database, Settings, TrainTrack, CheckCircle, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'

export default function SystemPage() {
  const { 
    systemStatus, 
    fetchSystemStatus, 
    trainModel, 
    isTraining, 
    isSystemLoading 
  } = useAppStore()
  
  const [trainingProgress, setTrainingProgress] = useState(0)

  useEffect(() => {
    fetchSystemStatus()
  }, [fetchSystemStatus])

  const handleTrainModel = async () => {
    setTrainingProgress(0)
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + 10
      })
    }, 500)

    const success = await trainModel()
    
    clearInterval(interval)
    if (success) {
      setTrainingProgress(100)
      setTimeout(() => setTrainingProgress(0), 2000)
    }
  }

  const getHealthBadge = (health: string) => {
    const variants = {
      healthy: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
      degraded: { class: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      down: { class: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    
    const variant = variants[health as keyof typeof variants] || variants.healthy
    const IconComponent = variant.icon
    
    return (
      <Badge className={variant.class}>
        <IconComponent className="h-3 w-3 mr-1" />
        {health.charAt(0).toUpperCase() + health.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Manage facial recognition model and system configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system health and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSystemLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading system status...</p>
              </div>
            ) : systemStatus ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Health</span>
                  {getHealthBadge(systemStatus.system_health)}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Model Status</span>
                  <Badge variant={systemStatus.model_trained ? "default" : "secondary"}>
                    {systemStatus.model_trained ? 'Trained' : 'Not Trained'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Students</span>
                  <span className="font-semibold">{systemStatus.total_students}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Face Images</span>
                  <span className="font-semibold">{systemStatus.total_faces}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Last Training</span>
                  <span className="text-sm text-muted-foreground">
                    {systemStatus.last_training ? 
                      new Date(systemStatus.last_training).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Unable to load system status
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Training */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Model Training
            </CardTitle>
            <CardDescription>
              Train the facial recognition model with current data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training Progress</span>
                <span>{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
            </div>

            <Button 
              onClick={handleTrainModel}
              disabled={isTraining || trainingProgress > 0}
              className="w-full flex items-center gap-2"
            >
              <TrainTrack className="h-4 w-4" />
              {isTraining ? 'Training Model...' : 'Train Model'}
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Requires at least 1 registered student</p>
              <p>• Process may take several minutes</p>
              <p>• System will be unavailable during training</p>
            </div>
          </CardContent>
        </Card>

        {/* Database Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>
              Storage and data management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="font-semibold">~45.2 MB</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Backup Status</span>
              <Badge variant="default">Auto Backup Enabled</Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Create Backup
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Actions */}
        <Card>
          <CardHeader>
            <CardTitle>System Actions</CardTitle>
            <CardDescription>
              Administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Export All Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              System Logs
            </Button>
            <Button variant="outline" className="w-full justify-start">
              API Documentation
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              Reset System
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}