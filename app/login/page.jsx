'use client'

import { AuthProvider } from '../../lib/contexts/AuthContext'
import Login from '../../lib/components/Login'

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="app">
        <Login />
      </div>
    </AuthProvider>
  )
}
