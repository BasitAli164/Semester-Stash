'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/use-app-store'
import { X, Camera, RefreshCw, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const studentSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  department: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentRegistrationFormProps {
  onClose: () => void
}

export function StudentRegistrationForm({ onClose }: StudentRegistrationFormProps) {
  const { registerStudent } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      student_id: '',
      name: '',
      email: '',
      department: '',
    },
  })

  // Handle file selection for photo capture
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setCapturedImages(prev => [...prev, imageData])
      toast.success(`Image ${capturedImages.length + 1} captured successfully`)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  // Capture photo using camera
  const capturePhoto = async () => {
    try {
      // Check if browser supports camera
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Camera not supported in this browser')
        return
      }

      // Access camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      })
      
      // Create video element temporarily for capture
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          resolve(null)
        }
      })

      // Create canvas for capture
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      
      if (context) {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        
        setCapturedImages(prev => [...prev, imageData])
        toast.success(`Image ${capturedImages.length + 1} captured successfully`)
      }

      // Stop all video tracks
      stream.getTracks().forEach(track => track.stop())
      
    } catch (error) {
      console.error('Camera error:', error)
      toast.error('Unable to access camera. Please check permissions.')
    }
  }

  // Remove captured image
  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index))
    toast.info('Image removed')
  }

  const onSubmit = async (values: StudentFormData) => {
    if (capturedImages.length === 0) {
      toast.error("Please capture at least one face image for registration")
      return
    }

    setIsSubmitting(true)
    try {
      const success = await registerStudent(values)
      
      if (success) {
        console.log('Student registered with images:', capturedImages.length)
        
        // Here you would typically send images to your backend
        // For example: await studentService.captureFaceImages(values.student_id, capturedImages)
        
        toast.success("Student registered successfully with face data")
        onClose()
      }
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error("Failed to register student")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Register New Student</CardTitle>
            <CardDescription>
              Add student details and capture face photos for recognition
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Student Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Face Capture Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Face Registration</h3>
                    <p className="text-sm text-muted-foreground">
                      Capture multiple face photos for better recognition
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {capturedImages.length} images captured
                    </span>
                    {capturedImages.length >= 3 && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Capture Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      type="button" 
                      onClick={capturePhoto}
                      className="h-20 flex flex-col gap-2"
                      variant="outline"
                    >
                      <Camera className="h-6 w-6" />
                      <span>Take Photo with Camera</span>
                    </Button>

                    <Button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-20 flex flex-col gap-2"
                      variant="outline"
                    >
                      <Camera className="h-6 w-6" />
                      <span>Upload Photo from Device</span>
                    </Button>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Captured Images Preview */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Captured Photos</h4>
                    {capturedImages.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground font-medium">No photos captured yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use the buttons above to capture face photos
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {capturedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`Captured face ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="opacity-90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">📸 Photo Guidelines</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Capture 3-5 photos from different angles</li>
                      <li>• Ensure good lighting on the face</li>
                      <li>• Look directly at the camera</li>
                      <li>• Remove sunglasses, hats, or face coverings</li>
                      <li>• Use clear, high-quality images</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.formState.isValid || capturedImages.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register Student'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}