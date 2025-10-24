'use client'

import { useState } from 'react'
import { Camera, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAttendanceStore } from '@/lib/store'
import { FaceCaptureModal } from './face-capture-modal'

interface MarkAttendanceButtonProps {
  variant?: 'primary' | 'secondary'
}

export function MarkAttendanceButton({ variant = 'primary' }: MarkAttendanceButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const { markAttendance, lastMarkedAttendance } = useAttendanceStore()

  const handleMarkAttendance = async (imageData: string) => {
    setIsMarking(true)
    try {
      await markAttendance({ image_data: imageData })
      toast.success('Attendance marked successfully!')
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance')
    } finally {
      setIsMarking(false)
    }
  }

  // Convert lastMarkedAttendance to boolean for disabled prop
  const isDisabled = isMarking || !!lastMarkedAttendance

  const buttonClass = variant === 'primary' 
    ? 'bg-primary-600 hover:bg-primary-700 text-white'
    : 'bg-white dark:bg-gray-800 border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isDisabled}
        className={`px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center space-x-2 ${buttonClass}`}
      >
        {isMarking ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : lastMarkedAttendance ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <Camera className="h-5 w-5" />
        )}
        <span>
          {isMarking ? 'Marking...' : lastMarkedAttendance ? 'Marked Today' : 'Mark Attendance'}
        </span>
      </button>

      <FaceCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCapture={handleMarkAttendance}
        isLoading={isMarking}
      />
    </>
  )
}