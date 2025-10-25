'use client'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function StudentForm({ onSubmit, loading = false, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    username: initialData.username || '',
    password: '',
    email: initialData.email || '',
    student_id: initialData.student_id || '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    
    if (!initialData.id && !formData.password) {
      newErrors.password = 'Password is required for new students'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name *"
          name="name"
          type="text"
          placeholder="Enter student's full name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Username *"
          name="username"
          type="text"
          placeholder="Enter unique username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Student ID"
          name="student_id"
          type="text"
          placeholder="Enter student ID (optional)"
          value={formData.student_id}
          onChange={handleChange}
          error={errors.student_id}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter email address (optional)"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
      </div>

      {!initialData.id && (
        <Input
          label="Password *"
          name="password"
          type="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
      )}

      <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
        <Button type="submit" loading={loading}>
          {initialData.id ? 'Update Student' : 'Create Student'}
        </Button>
      </div>
    </form>
  )
}