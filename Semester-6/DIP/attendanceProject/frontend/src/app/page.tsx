import Link from 'next/link';
import { Camera, Users, Shield, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen  from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">FaceAttend</span>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Facial Recognition
              <br />
              <span className="text-blue-600">Attendance System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automate your attendance tracking with cutting-edge face recognition technology. 
              Fast, accurate, and secure attendance management for educational institutions.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Start Using Now
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">Everything you need for modern attendance management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Face Recognition</h3>
              <p className="text-gray-600">
                Advanced AI-powered facial recognition for accurate and fast attendance marking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Separate interfaces for administrators and students with appropriate permissions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is protected with industry-standard security practices and encryption.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
              <p className="text-gray-600">
                Comprehensive reports and analytics to track attendance patterns and trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <Camera className="h-8 w-8 text-blue-400 mr-3" />
            <span className="text-xl font-bold">FaceAttend</span>
          </div>
          <p className="text-gray-400 mb-4">
            Intelligent Facial Attendance System
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 FaceAttend. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}