'use client'

import { AuthProvider } from '../../lib/contexts/AuthContext'
import ProtectedRoute from '../../lib/components/ProtectedRoute'
import ManagerDashboard from '../../lib/components/ManagerDashboard'

export default function ManagerPage() {
  return (
    <AuthProvider>
      <div className="app">
        <ProtectedRoute>
          <ManagerDashboard />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  )
}
