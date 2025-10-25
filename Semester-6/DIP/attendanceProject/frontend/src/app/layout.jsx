'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import { useStore } from '../store'
import { ProtectedRoute } from '../components/common/ProtectedRoute'
import { Header } from '../components/ui/Header'
import { Sidebar } from '../components/ui/Sidebar'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const { isAuthenticated } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        {isAuthenticated ? (
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-auto p-6">
                  {children}
                </main>
              </div>
            </div>
          </ProtectedRoute>
        ) : (
          children
        )}
      </body>
    </html>
  )
}