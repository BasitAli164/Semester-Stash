import Link from 'next/link'
import { ArrowRight, Users, Clock, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FaceAttend
            </span>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="px-6 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400">
            Modern Facial Recognition
            <span className="block mt-2">Attendance System</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Revolutionize attendance tracking with AI-powered facial recognition. 
            Secure, fast, and accurate for educational institutions and workplaces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/register"
              className="group px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-3xl flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300 font-semibold text-lg"
            >
              Demo Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 p-8 rounded-3xl hover:scale-105 transition-transform duration-300 shadow-xl">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Smart User Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Easy administration of students and staff with role-based access control and comprehensive user profiles.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 p-8 rounded-3xl hover:scale-105 transition-transform duration-300 shadow-xl">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Real-time Attendance
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Instant attendance marking with facial verification. Get live updates and comprehensive reporting.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 p-8 rounded-3xl hover:scale-105 transition-transform duration-300 shadow-xl">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Enterprise Security
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Military-grade encryption and secure facial data handling with privacy-first architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-20 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 FaceAttend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}