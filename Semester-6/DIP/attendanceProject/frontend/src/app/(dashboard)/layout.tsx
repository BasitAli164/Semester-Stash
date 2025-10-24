import { ProtectedRoute } from '@/components/protected-route'
import { DashboardNavbar } from '@/components/ui/navbar'
import { DashboardSidebar } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNavbar />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 lg:ml-64 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}