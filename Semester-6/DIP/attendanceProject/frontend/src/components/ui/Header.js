'use client'
import { useStore } from '../../store'
import { Button } from './Button'

export function Header({ onMenuToggle }) {
  const { user, logout } = useStore()

  return (
    <header className="glass-effect border-b border-white/20 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu toggle and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gradient">Facial Attendance</h1>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="font-semibold text-white">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="font-medium">{user?.name || 'Admin'}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}