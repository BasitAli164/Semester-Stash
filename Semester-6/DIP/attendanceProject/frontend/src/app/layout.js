'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../lib/auth'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}