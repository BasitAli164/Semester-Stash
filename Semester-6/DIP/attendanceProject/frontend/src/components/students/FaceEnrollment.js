'use client'
import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function FaceEnrollment({ studentId, onComplete, isOpen, onClose }) {
  const webcamRef = useRef(null)
  const [capturedImages, setCapturedImages] = useState([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [uploading, setUploading] = useState(false)

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot()
    setCapturedImages(prev => [...prev, { src: imageSrc, id: Date.now() }])
  }

  const removeImage = (id) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id))
  }

  const handleSubmit = async () => {
    if (capturedImages.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      
      // Convert base64 images to files
      for (let i = 0; i < capturedImages.length; i++) {
        const image = capturedImages[i]
        const response = await fetch(image.src)
        const blob = await response.blob()
        const file = new File([blob], `face_${i}.jpg`, { type: 'image/jpeg' })
        formData.append('images', file)
      }

      await onComplete(studentId, formData)
      setCapturedImages([])
      onClose()
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Face Enrollment"
      size="lg"
    >
      <div className="space-y-6">
        {/* Webcam Preview */}
        <div className="relative">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-64 md:h-96 rounded-xl object-cover"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "user"
            }}
          />
          <div className="absolute inset-0 border-2 border-primary-500/50 rounded-xl pointer-events-none"></div>
        </div>

        {/* Capture Controls */}
        <div className="flex justify-center">
          <Button
            onClick={captureImage}
            disabled={capturedImages.length >= 6}
            className="relative"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capture Image ({capturedImages.length}/6)
          </Button>
        </div>

        {/* Captured Images */}
        {capturedImages.length > 0 && (
          <div>
            <h4 className="font-semibold text-white mb-3">Captured Images</h4>
            <div className="grid grid-cols-3 gap-4">
              {capturedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.src}
                    alt="Captured face"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h4 className="font-semibold text-blue-500 mb-2">Capture Instructions</h4>
          <ul className="text-sm text-blue-500/80 space-y-1">
            <li>• Capture 3-6 images from different angles</li>
            <li>• Ensure good lighting and clear face visibility</li>
            <li>• Include front, left, and right profile views</li>
            <li>• Remove images with blur or poor quality</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-white/20">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={uploading}
            disabled={capturedImages.length === 0}
          >
            Save {capturedImages.length} Images
          </Button>
        </div>
      </div>
    </Modal>
  )
}