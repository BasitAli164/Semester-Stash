import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { DashboardHeader } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}