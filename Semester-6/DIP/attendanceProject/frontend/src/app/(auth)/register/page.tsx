import { RegisterForm } from '@/components/auth/register-form'
import { authService } from '@/lib/api'
import { redirect } from 'next/navigation'

export default function RegisterPage() {
  // Redirect if already authenticated
  if (authService.isAuthenticated()) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  )
}