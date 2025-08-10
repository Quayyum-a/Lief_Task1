'use client'

import { AuthProvider } from '../../lib/contexts/AuthContext'
import ProtectedRoute from '../../lib/components/ProtectedRoute'
import Dashboard from '../../lib/components/Dashboard'

export default function DashboardPage() {
  return (
    <AuthProvider>
      <div className="app">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  )
}
